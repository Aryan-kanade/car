// ─────────────────────────────────────────────────────────────
// POST /api/webhooks/razorpay
// Safety net when the browser dies between payment and
// verification. Vercel may pre-parse the JSON body, so when the
// exact raw bytes are unavailable we re-confirm the payment with
// an authenticated Razorpay API call instead of trusting the
// payload. Handles payment.captured / payment.failed / order.paid.
// Every event lands in the admin webhook log. Configure in
// Razorpay → Settings → Webhooks.
// ─────────────────────────────────────────────────────────────

import { json, readJson } from '../_lib/http.js'
import { getOrderByRazorpayId, logWebhookEvent, saveOrderRecord } from '../_lib/db.js'
import {
  fetchRazorpayPayment,
  razorpayConfigured,
  verifyWebhookSignature,
} from '../_lib/razorpay.js'
import { createShiprocketOrder, shiprocketConfigured } from '../_lib/shiprocket.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Use POST.' })

  const rawBody = req.rawBody ? Buffer.from(req.rawBody).toString('utf8') : null
  const signature = req.headers['x-razorpay-signature']

  if (rawBody && process.env.RAZORPAY_WEBHOOK_SECRET) {
    if (!verifyWebhookSignature(rawBody, signature)) {
      await logWebhookEvent({ event: 'invalid-signature', outcome: 'rejected' })
      return json(res, 400, { error: 'Invalid webhook signature.' })
    }
  }

  const body = req.body ?? (rawBody ? JSON.parse(rawBody) : await readJson(req))
  const event = body?.event
  const payment = body?.payload?.payment?.entity

  // order.paid wraps the payment entity the same way payment.captured does
  const orderEntity = body?.payload?.order?.entity
  const razorpayOrderId = payment?.order_id ?? orderEntity?.id
  const paymentId = payment?.id

  if (
    (event === 'payment.captured' || event === 'payment.failed' || event === 'order.paid') &&
    razorpayOrderId
  ) {
    let outcome = 'ignored'
    try {
      const record = await getOrderByRazorpayId(razorpayOrderId)

      const wantsPaid = event === 'payment.captured' || event === 'order.paid'
      if (wantsPaid && record && record.status !== 'paid') {
        // Without the raw-body HMAC, re-confirm directly with Razorpay.
        let confirmed = true
        if (!rawBody && razorpayConfigured() && paymentId) {
          const live = await fetchRazorpayPayment(paymentId)
          confirmed = live.status === 'captured' && live.order_id === razorpayOrderId
        }
        if (confirmed) {
          record.status = 'paid'
          record.razorpayPaymentId = paymentId ?? record.razorpayPaymentId
          record.paidAt = Date.now()
          if (
            shiprocketConfigured() &&
            record.shippingMethod !== 'pickup' &&
            !record.shiprocket?.ok
          ) {
            record.shiprocket = await createShiprocketOrder(record)
          }
          await saveOrderRecord(record)
          outcome = 'marked-paid'
        } else {
          outcome = 'unconfirmed'
        }
      } else if (event === 'payment.failed' && record && record.status === 'payment_pending') {
        record.status = 'failed'
        await saveOrderRecord(record)
        outcome = 'marked-failed'
      } else if (wantsPaid && record?.status === 'paid') {
        outcome = 'already-paid'
      }
    } catch {
      outcome = 'error'
      // Always 200 so Razorpay does not hammer retries on transient errors.
    }
    await logWebhookEvent({
      event,
      order: razorpayOrderId,
      payment: paymentId ?? null,
      outcome,
    })
  } else {
    await logWebhookEvent({ event: event ?? 'unknown', outcome: 'unhandled' })
  }

  return json(res, 200, { received: true })
}

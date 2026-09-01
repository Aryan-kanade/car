// ─────────────────────────────────────────────────────────────
// POST /api/verify-payment
// Verifies the Razorpay checkout signature server-side (HMAC of
// order_id|payment_id with the key secret) before the order is
// treated as paid, then pushes the shipment to Shiprocket.
// ─────────────────────────────────────────────────────────────

import { fail, json, readJson } from './_lib/http.js'
import { getOrder, saveOrderRecord } from './_lib/db.js'
import { verifyPaymentSignature } from './_lib/razorpay.js'
import { createShiprocketOrder, shiprocketConfigured } from './_lib/shiprocket.js'
import { toClientOrder } from './_lib/orders.js'
import { LIMITS, rateLimited, tooMany } from './_lib/ratelimit.js'
import { signLink } from './_lib/links.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'Use POST.')
  if (
    await rateLimited(
      req,
      LIMITS.verifyPayment.bucket,
      LIMITS.verifyPayment.limit,
      LIMITS.verifyPayment.window
    )
  )
    return tooMany(res)

  const body = await readJson(req)
  if (!body) return fail(res, 400, 'Request body must be valid JSON.')

  const { orderNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {}
  if (!orderNumber || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return fail(res, 400, 'Missing payment confirmation fields.')
  }

  const record = await getOrder(orderNumber)
  if (!record) return fail(res, 404, 'Order not found.')

  // Idempotent: a repeated verification of an already-paid order succeeds.
  if (record.status === 'paid') {
    return json(res, 200, { verified: true, order: toClientOrder(record) })
  }
  if (record.razorpayOrderId !== razorpay_order_id) {
    return fail(res, 400, 'Payment does not match this order.')
  }

  const valid = verifyPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  })
  if (!valid) {
    return fail(
      res,
      400,
      'Payment signature verification failed. If you were charged, contact support.'
    )
  }

  record.status = 'paid'
  record.razorpayPaymentId = razorpay_payment_id
  record.paidAt = Date.now()

  // Paid → create the shipment. Failures are recorded, not fatal.
  if (shiprocketConfigured()) {
    record.shiprocket = await createShiprocketOrder(record)
  }

  await saveOrderRecord(record)
  return json(res, 200, {
    verified: true,
    shareToken: signLink(record.number, 'track'),
    order: toClientOrder(record),
  })
}

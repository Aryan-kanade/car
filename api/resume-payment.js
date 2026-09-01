// ─────────────────────────────────────────────────────────────
// GET /api/resume-payment?number=KMK-123456&email=you@example.com
// Payment recovery: returns the still-live Razorpay order for a
// pending order so the customer can retry paying — Razorpay
// orders are re-openable. Email must match; rate limited.
// ─────────────────────────────────────────────────────────────

import { fail, json } from './_lib/http.js'
import { dbConfigured, getOrder } from './_lib/db.js'
import { LIMITS, rateLimited, tooMany } from './_lib/ratelimit.js'
import { razorpayConfigured } from './_lib/razorpay.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return fail(res, 405, 'Use GET.')
  if (await rateLimited(req, LIMITS.resume.bucket, LIMITS.resume.limit, LIMITS.resume.window))
    return tooMany(res)

  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`)
  const number = url.searchParams.get('number')?.trim() ?? ''
  const email = url.searchParams.get('email')?.trim() ?? ''
  if (!/^KMK-\d{6}$/i.test(number) || !email) {
    return fail(res, 400, 'Provide an order number and the email used at checkout.')
  }
  if (!dbConfigured()) return fail(res, 503, 'Order storage is not configured.')
  if (!razorpayConfigured()) return fail(res, 503, 'Payments are not configured.')

  const record = await getOrder(number)
  if (!record || record.customer.email.toLowerCase() !== email.toLowerCase()) {
    return fail(res, 404, 'not-found')
  }
  if (record.paymentMethod !== 'online' || !record.razorpayOrderId) {
    return fail(res, 422, 'This order has no pending online payment.')
  }
  if (record.status === 'paid') {
    return json(res, 200, { pending: false, alreadyPaid: true })
  }
  if (record.status === 'failed') {
    return fail(res, 422, 'The payment attempt failed — place a new order instead.')
  }

  return json(res, 200, {
    pending: true,
    orderNumber: record.number,
    razorpayOrderId: record.razorpayOrderId,
    amount: record.totals.total * 100,
    keyId: process.env.RAZORPAY_KEY_ID,
    order: {
      number: record.number,
      total: record.totals.total,
      items: record.items,
      placedAt: record.placedAt,
    },
  })
}

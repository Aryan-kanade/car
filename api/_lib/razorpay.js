// ─────────────────────────────────────────────────────────────
// Razorpay server-side helpers. The key secret NEVER reaches the
// browser — order creation and signature verification happen here.
// Docs: https://razorpay.com/docs/api/orders, /webhooks
// ─────────────────────────────────────────────────────────────

import crypto from 'node:crypto'

const API = 'https://api.razorpay.com/v1'

export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}

function authHeader() {
  const raw = `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  return `Basic ${Buffer.from(raw).toString('base64')}`
}

/**
 * Create a Razorpay order for `amount` paise with our order number as receipt.
 * Throws with a readable message on failure.
 */
export async function createRazorpayOrder({ amount, receipt, notes = {} }) {
  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
    body: JSON.stringify({ amount, currency: 'INR', receipt, notes }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body?.error?.description || `Razorpay order creation failed (${res.status}).`)
  }
  return body
}

/** Fetch a payment server-to-server — used to double-check webhooks. */
export async function fetchRazorpayPayment(paymentId) {
  const res = await fetch(`${API}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: authHeader() },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.error?.description || `Razorpay payment fetch failed.`)
  return body
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

/**
 * Verify the checkout handler signature: HMAC-SHA256 of
 * `${razorpay_order_id}|${razorpay_payment_id}` with the key secret.
 */
export function verifyPaymentSignature(
  { razorpayOrderId, razorpayPaymentId, signature },
  secret = process.env.RAZORPAY_KEY_SECRET
) {
  if (!secret || !razorpayOrderId || !razorpayPaymentId || !signature) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')
  return timingSafeEqual(expected, signature)
}

/** Verify a webhook's x-razorpay-signature over the exact raw body. */
export function verifyWebhookSignature(
  rawBody,
  signature,
  secret = process.env.RAZORPAY_WEBHOOK_SECRET
) {
  if (!secret || !rawBody || !signature) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return timingSafeEqual(expected, signature)
}

// ─────────────────────────────────────────────────────────────
// HMAC-signed share links: /track/:number?t=token and payment
// resume URLs that verify ownership without an email prompt.
// TRACKING_LINK_SECRET falls back to the Razorpay key secret.
// ─────────────────────────────────────────────────────────────

import crypto from 'node:crypto'

function secret() {
  return process.env.TRACKING_LINK_SECRET || process.env.RAZORPAY_KEY_SECRET || ''
}

/** Stable HMAC token for an order number + purpose ('track' | 'pay'). */
export function signLink(number, purpose = 'track') {
  const s = secret()
  if (!s) return null
  return crypto
    .createHmac('sha256', s)
    .update(`${purpose}:${String(number).toUpperCase()}`)
    .digest('hex')
    .slice(0, 32)
}

/** Constant-time token verification. */
export function verifyLinkToken(number, purpose, token) {
  const expected = signLink(number, purpose)
  if (!expected || !token) return false
  const a = Buffer.from(expected)
  const b = Buffer.from(String(token))
  if (a.length !== b.length || b.length === 0) return false
  return crypto.timingSafeEqual(a, b)
}

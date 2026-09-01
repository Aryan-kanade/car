// ─────────────────────────────────────────────────────────────
// GET /api/track?number=KMK-123456&email=you@example.com
//    GET /api/track?number=KMK-123456&t={shareToken}   (no email needed)
// Order lookup (works from any device), live Shiprocket tracking
// when available, plus payment-pending state for the "Pay now"
// recovery flow and the post-delivery survey state.
// ─────────────────────────────────────────────────────────────

import { fail, json } from './_lib/http.js'
import { dbConfigured, getOrder } from './_lib/db.js'
import { shiprocketConfigured, trackOrder } from './_lib/shiprocket.js'
import { LIMITS, rateLimited, tooMany } from './_lib/ratelimit.js'
import { signLink, verifyLinkToken } from './_lib/links.js'

const RECORD_STATUS = {
  payment_pending: {
    label: 'Awaiting payment',
    detail: 'Payment was not completed for this order.',
  },
  failed: {
    label: 'Payment failed',
    detail: 'The payment did not go through. You were not charged — try placing the order again.',
  },
  paid: { label: 'Placed', detail: 'Payment received. We are preparing your parcel.' },
  cod_placed: { label: 'Placed', detail: 'Order confirmed — pay the courier on delivery.' },
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return fail(res, 405, 'Use GET.')
  if (await rateLimited(req, LIMITS.track.bucket, LIMITS.track.limit, LIMITS.track.window))
    return tooMany(res)

  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`)
  const number = url.searchParams.get('number')?.trim() ?? ''
  const email = url.searchParams.get('email')?.trim() ?? ''
  const token = url.searchParams.get('t')?.trim() ?? ''

  if (!/^KMK-\d{6}$/i.test(number) || (!email && !token)) {
    return fail(
      res,
      400,
      'Provide an order number and the email used at checkout (or a share token).'
    )
  }
  if (!dbConfigured()) {
    return fail(res, 503, 'Order storage is not configured.')
  }

  const record = await getOrder(number)
  const emailMatches =
    record && email && record.customer.email.toLowerCase() === email.toLowerCase()
  const tokenValid = token ? verifyLinkToken(number, 'track', token) : false
  if (!record || (!emailMatches && !tokenValid)) {
    return fail(res, 404, 'not-found')
  }

  let tracking = null
  if (shiprocketConfigured() && record.shiprocket?.ok) {
    const result = await trackOrder(record)
    if (result.ok) tracking = result.tracking
  }

  const delivered = tracking?.status === 'Delivered'
  const status = tracking
    ? {
        label: tracking.status,
        detail:
          tracking.events[0] != null
            ? `${tracking.events[0].activity}${tracking.events[0].location ? ` — ${tracking.events[0].location}` : ''}`
            : 'Your parcel is on the way.',
      }
    : (RECORD_STATUS[record.status] ?? RECORD_STATUS.paid)

  return json(res, 200, {
    found: true,
    status,
    tracking,
    paymentPending: record.status === 'payment_pending' && record.paymentMethod === 'online',
    delivered,
    surveyRating: record.survey?.rating ?? null,
    shareToken: emailMatches ? signLink(record.number, 'track') : null,
    order: {
      number: record.number,
      placedAt: record.placedAt,
      items: record.items,
      discount: record.totals.discount,
      promoCode: record.totals.promoCode,
      total: record.totals.total,
      paymentMethod: record.paymentMethod,
      giftHidePrices: record.gift?.hidePrices === true,
      gstin: record.customer.gstin ?? null,
      businessName: record.customer.businessName ?? null,
    },
  })
}

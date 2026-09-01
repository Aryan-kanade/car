// ─────────────────────────────────────────────────────────────
// POST /api/create-order
// Validates the cart + customer, recomputes totals from the
// catalog (client prices are never trusted), persists the order,
// then either creates a Razorpay order (online) or pushes the
// shipment straight to Shiprocket (COD) — studio-pickup orders
// skip the courier entirely.
// ─────────────────────────────────────────────────────────────

import { fail, json, readJson } from './_lib/http.js'
import {
  countCodAttempt,
  dbConfigured,
  getIdempotent,
  getOrder,
  rememberRazorpayOrder,
  saveIdempotent,
  saveOrderRecord,
} from './_lib/db.js'
import { createRazorpayOrder, razorpayConfigured } from './_lib/razorpay.js'
import { createShiprocketOrder, shiprocketConfigured } from './_lib/shiprocket.js'
import {
  generateOrderNumber,
  snapshotItems,
  toClientOrder,
  validateCustomer,
} from './_lib/orders.js'
import { LIMITS, rateLimited, tooMany } from './_lib/ratelimit.js'
import { signLink } from './_lib/links.js'
import { computeTotals, normalizeShippingMethod } from '../src/utils/pricing.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'Use POST.')
  if (
    await rateLimited(
      req,
      LIMITS.createOrder.bucket,
      LIMITS.createOrder.limit,
      LIMITS.createOrder.window
    )
  )
    return tooMany(res)

  const body = await readJson(req)
  if (!body) return fail(res, 400, 'Request body must be valid JSON.')

  // Idempotent replay: same key → same order (double-click / retry safe)
  if (
    body.idempotencyKey &&
    typeof body.idempotencyKey === 'string' &&
    body.idempotencyKey.length <= 64
  ) {
    const cached = await getIdempotent(body.idempotencyKey).catch(() => null)
    if (cached) return json(res, 200, cached)
  }

  // Delivery: pickup (studio collection) skips the courier entirely
  const shippingMethod = normalizeShippingMethod(body.shippingMethod)
  const pickup = shippingMethod === 'pickup'

  const { ok, errors, customer } = validateCustomer(body.customer, { pickup })
  if (!ok)
    return json(res, 422, { error: 'Please fix the highlighted fields.', fieldErrors: errors })

  // Recompute every price server-side from ids + catalog
  const items = snapshotItems(body.items)
  if (!items)
    return fail(res, 422, 'Your cart contains items we cannot price. Refresh and try again.')

  const pricingItems = items.map(({ id, size, subscription, qty }) => ({
    id,
    size,
    plan: subscription ? 'sub' : 'once',
    qty,
  }))
  const claimedPoints = Number.isFinite(body.pointsDiscount) ? Math.max(0, body.pointsDiscount) : 0
  const claimedGift = Number.isFinite(body.giftDiscount) ? Math.max(0, body.giftDiscount) : 0
  const totals = computeTotals(
    pricingItems,
    body.promoCode ?? null,
    claimedPoints,
    claimedGift,
    shippingMethod
  )
  if (!totals)
    return fail(res, 422, 'Your cart contains items we cannot price. Refresh and try again.')
  totals.promoCode = body.promoCode ?? null

  const paymentMethod = body.paymentMethod === 'cod' ? 'cod' : 'online'

  if (!dbConfigured()) {
    return fail(
      res,
      503,
      'Order storage is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'
    )
  }
  if (paymentMethod === 'online' && !razorpayConfigured()) {
    return fail(
      res,
      503,
      'Payments are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
    )
  }
  if (paymentMethod === 'cod' && totals.total > 50000) {
    return fail(res, 422, 'Cash on Delivery is available for orders up to ₹50,000.')
  }
  // COD abuse guard: >2 COD orders from one phone in 24h → prepaid only
  if (paymentMethod === 'cod' && dbConfigured()) {
    const attempts = await countCodAttempt(customer.phone).catch(() => 1)
    if (attempts > 2) {
      return fail(
        res,
        422,
        'Cash on Delivery is temporarily unavailable for this number — please pay online.'
      )
    }
  }

  // Unique order number (retry on the rare collision)
  let number
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateOrderNumber()
    if (!(await getOrder(candidate))) {
      number = candidate
      break
    }
  }
  if (!number) return fail(res, 500, 'Could not allocate an order number. Try again.')

  const record = {
    number,
    placedAt: Date.now(),
    status: paymentMethod === 'cod' ? 'cod_placed' : 'payment_pending',
    paymentMethod,
    shippingMethod,
    customer: {
      ...customer,
      gstin:
        typeof body.gstin === 'string' && /^[0-9A-Za-z]{15}$/.test(body.gstin.trim())
          ? body.gstin.trim().toUpperCase()
          : null,
      businessName:
        typeof body.businessName === 'string' && body.businessName.trim()
          ? body.businessName.trim().slice(0, 80)
          : null,
    },
    gift: {
      note:
        typeof body.giftNote === 'string' && body.giftNote.trim()
          ? body.giftNote.trim().slice(0, 280)
          : null,
      hidePrices: body.giftHidePrices === true,
    },
    items,
    totals,
    razorpayOrderId: null,
    razorpayPaymentId: null,
    paidAt: null,
    shiprocket: null,
    survey: null,
  }

  if (paymentMethod === 'online') {
    try {
      const rzp = await createRazorpayOrder({
        amount: totals.total * 100, // paise
        receipt: number,
        notes: { order_number: number },
      })
      record.razorpayOrderId = rzp.id
    } catch (err) {
      return fail(res, 502, err.message || 'Razorpay order creation failed. Try again.')
    }
  } else if (!pickup && shiprocketConfigured()) {
    // COD has no payment step — create the shipment right away (pickup
    // orders are collected at the studio, so there is no courier shipment).
    // Failures are recorded, not fatal (merchant can retry from the panel).
    record.shiprocket = await createShiprocketOrder(record)
  }

  await saveOrderRecord(record)
  if (record.razorpayOrderId) await rememberRazorpayOrder(record.razorpayOrderId, number)

  const response = {
    orderNumber: number,
    totals,
    amount: totals.total * 100,
    keyId: process.env.RAZORPAY_KEY_ID ?? null,
    razorpayOrderId: record.razorpayOrderId,
    cod: paymentMethod === 'cod',
    shareToken: signLink(number, 'track'),
    order: toClientOrder(record),
  }
  if (body.idempotencyKey) await saveIdempotent(body.idempotencyKey, response).catch(() => {})
  return json(res, 200, response)
}

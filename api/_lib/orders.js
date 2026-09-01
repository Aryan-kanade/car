// ─────────────────────────────────────────────────────────────
// Order-record helpers shared by the /api endpoints: customer
// validation, order-number generation, and the server → client
// order shape (matches src/utils/orders.ts Order interface).
// ─────────────────────────────────────────────────────────────

import { getProductById } from '../../src/data/catalog'
import { resolveUnitPrice } from '../../src/utils/pricing'

export const MAX_LINES = 40

export function generateOrderNumber() {
  return `KMK-${Math.floor(100000 + Math.random() * 900000)}`
}

export function validateCustomer(customer) {
  const errors = {}
  const name = String(customer?.name ?? '').trim()
  const email = String(customer?.email ?? '').trim()
  const phone = String(customer?.phone ?? '').replace(/\D/g, '')
  const address = String(customer?.address ?? '').trim()
  const city = String(customer?.city ?? '').trim()
  const state = String(customer?.state ?? '').trim()
  const pincode = String(customer?.pincode ?? '').trim()

  if (name.length < 2) errors.name = 'Enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
  // Indian mobile numbers (optionally prefixed with 91)
  if (!/^(0?91)?[6-9]\d{9}$/.test(phone)) errors.phone = 'Enter a valid 10-digit mobile number.'
  if (address.length < 5) errors.address = 'Enter your street address.'
  if (!city) errors.city = 'Enter your city.'
  if (!state) errors.state = 'Enter your state.'
  if (!/^\d{6}$/.test(pincode)) errors.pincode = 'PIN code must be 6 digits.'

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    customer: { name, email, phone: phone.replace(/^(0?91)/, ''), address, city, state, pincode },
  }
}

/**
 * Validate the client cart lines and snapshot them with catalog
 * prices (id, name, size, unit price) — the priced snapshot is
 * what lands in the order record and Shiprocket payload.
 */
export function snapshotItems(lines) {
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > MAX_LINES) return null
  const items = []
  for (const line of lines) {
    const product = getProductById(String(line?.id ?? ''))
    if (!product) return null
    const plan = line?.plan === 'sub' ? 'sub' : 'once'
    const unitPrice = resolveUnitPrice(product.id, line?.size ?? null, plan)
    if (unitPrice == null) return null
    const qty = Number.isInteger(line?.qty) && line?.qty > 0 ? Math.min(line.qty, 99) : 1
    items.push({
      id: product.id,
      name: product.name,
      size: line?.size ?? null,
      subscription: plan === 'sub',
      qty,
      unitPrice,
    })
  }
  return items
}

/** Server record → the Order shape the frontend persists and renders. */
export function toClientOrder(record) {
  return {
    number: record.number,
    email: record.customer.email,
    name: record.customer.name,
    phone: record.customer.phone,
    items: record.items,
    subtotal: record.totals.subtotal,
    discount: record.totals.discount,
    promoCode: record.totals.promoCode,
    shipping: record.totals.shipping,
    pointsDiscount: record.totals.pointsDiscount,
    giftDiscount: record.totals.giftDiscount,
    total: record.totals.total,
    placedAt: record.placedAt,
    paymentMethod: record.paymentMethod,
    razorpayPaymentId: record.razorpayPaymentId ?? null,
    shiprocketOrderId: record.shiprocket?.orderId ?? null,
    awb: record.shiprocket?.awb ?? null,
    city: record.customer.city ?? null,
    state: record.customer.state ?? null,
    pincode: record.customer.pincode ?? null,
    address: record.customer.address ?? null,
    giftNote: record.gift?.note ?? null,
    giftHidePrices: record.gift?.hidePrices === true,
    gstin: record.customer.gstin ?? null,
    businessName: record.customer.businessName ?? null,
    survey: record.survey?.rating ?? null,
  }
}

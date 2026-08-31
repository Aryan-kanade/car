// ─────────────────────────────────────────────────────────────
// Demo order persistence: orders live in localStorage so the
// Order Lookup page can find real checkouts from this device.
// ─────────────────────────────────────────────────────────────

import { FREE_SHIPPING_THRESHOLD } from '../data/catalog'

const KEY = 'kmkiramyki-orders'

export function readOrders() {
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function generateOrderNumber() {
  return `KMK-${Math.floor(100000 + Math.random() * 900000)}`
}

/** Snapshot the current cart into a persisted order and return it. */
export function saveOrder({ email, name, items, subtotal }) {
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 199
  const order = {
    number: generateOrderNumber(),
    email,
    name,
    items: items.map(({ product, qty }) => ({
      id: product.id,
      name: product.name,
      qty,
      unitPrice: product.price,
    })),
    subtotal,
    shipping,
    total: subtotal + shipping,
    placedAt: Date.now(),
  }

  try {
    const orders = [order, ...readOrders()].slice(0, 20)
    window.localStorage.setItem(KEY, JSON.stringify(orders))
  } catch {
    /* storage unavailable — confirmation still renders in-session */
  }

  return order
}

export function findOrder(number, email) {
  const norm = (value) => (value ?? '').toString().trim().toLowerCase()
  return readOrders().find(
    (order) => norm(order.number) === norm(number) && norm(order.email) === norm(email),
  )
}

/** Demo status derived from order age: Placed → Shipped → Out for delivery. */
export function getOrderStatus(placedAt) {
  const ageHours = (Date.now() - placedAt) / 36e5
  if (ageHours < 24) {
    return { label: 'Placed', detail: 'We are preparing your parcel. Tracking arrives by email.' }
  }
  if (ageHours < 72) {
    return { label: 'Shipped', detail: 'Your parcel is on the way — typically 2–3 days for metro PIN codes.' }
  }
  return { label: 'Out for delivery', detail: 'Almost there. Keep your phone handy for the delivery agent.' }
}

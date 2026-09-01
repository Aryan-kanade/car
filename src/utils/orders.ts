// ─────────────────────────────────────────────────────────────
// Demo order persistence: orders live in localStorage so the
// Order Lookup page can find real checkouts from this device.
// ─────────────────────────────────────────────────────────────

import { FREE_SHIPPING_THRESHOLD } from '../data/catalog'
import { promoDiscount, promoGivesFreeShipping, type Promo } from './promos'

const KEY = 'kmkiramyki-orders'

export interface OrderItem {
  id: string
  name: string
  size: string | null
  qty: number
  unitPrice: number
}

export interface Order {
  number: string
  email: string
  name: string
  items: OrderItem[]
  subtotal: number
  discount: number
  promoCode: string | null
  shipping: number
  total: number
  placedAt: number
}

interface CartLine {
  product: { id: string; name: string }
  size: string | null
  qty: number
  unitPrice: number
}

interface SaveOrderInput {
  email: string
  name: string
  items: CartLine[]
  subtotal: number
  promo: Promo | null
}

export const SHIPPING_FEE = 199

export function readOrders(): Order[] {
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
export function saveOrder({ email, name, items, subtotal, promo }: SaveOrderInput): Order {
  const discount = promoDiscount(promo, subtotal)
  const shipping =
    subtotal - discount >= FREE_SHIPPING_THRESHOLD || promoGivesFreeShipping(promo)
      ? 0
      : SHIPPING_FEE
  const order: Order = {
    number: generateOrderNumber(),
    email,
    name,
    items: items.map(({ product, size, qty, unitPrice }) => ({
      id: product.id,
      name: product.name,
      size,
      qty,
      unitPrice,
    })),
    subtotal,
    discount,
    promoCode: promo?.code ?? null,
    shipping,
    total: subtotal - discount + shipping,
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

export function findOrder(number: string, email: string): Order | undefined {
  const norm = (value: string | null | undefined) => (value ?? '').toString().trim().toLowerCase()
  return readOrders().find(
    (order) => norm(order.number) === norm(number) && norm(order.email) === norm(email)
  )
}

/** Demo status derived from order age: Placed → Shipped → Out for delivery. */
export interface OrderStatus {
  label: string
  detail: string
}

export function getOrderStatus(placedAt: number): OrderStatus {
  const ageHours = (Date.now() - placedAt) / 36e5
  if (ageHours < 24) {
    return { label: 'Placed', detail: 'We are preparing your parcel. Tracking arrives by email.' }
  }
  if (ageHours < 72) {
    return {
      label: 'Shipped',
      detail: 'Your parcel is on the way — typically 2–3 days for metro PIN codes.',
    }
  }
  return {
    label: 'Out for delivery',
    detail: 'Almost there. Keep your phone handy for the delivery agent.',
  }
}

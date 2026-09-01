// ─────────────────────────────────────────────────────────────
// Shared pricing: single source of truth for cart line prices
// and order totals. Used by the cart context (display) and by
// the /api serverless functions, which recompute totals from
// the catalog so a tampered client cannot underpay.
// ─────────────────────────────────────────────────────────────

import { FREE_SHIPPING_THRESHOLD, getProductById, getVariant } from '../data/catalog'
import { lookupPromo, promoDiscount, promoGivesFreeShipping, type Promo } from './promos'

/** Subscription plans get 15% off the unit price. */
export const SUBSCRIBE_DISCOUNT = 0.15
export const subscribePrice = (price: number): number =>
  Math.round(price * (1 - SUBSCRIBE_DISCOUNT))

export const SHIPPING_FEE = 199

/** Priority dispatch: jumps the packing queue (added on top of Standard rules). */
export const PRIORITY_DISPATCH_FEE = 99

export type ShippingMethod = 'standard' | 'priority' | 'pickup'

/** Whitelist shared by checkout UI and /api — anything else falls back to standard. */
export const SHIPPING_METHODS: ShippingMethod[] = ['standard', 'priority', 'pickup']

export function normalizeShippingMethod(value: unknown): ShippingMethod {
  return SHIPPING_METHODS.includes(value as ShippingMethod) ? (value as ShippingMethod) : 'standard'
}

export type Plan = 'once' | 'sub'

/** Cart line as sent to /api — ids only, no client price is trusted. */
export interface PricingItem {
  id: string
  size: string | null
  plan: Plan
  qty: number
}

export interface OrderTotals {
  subtotal: number
  discount: number
  shipping: number
  pointsDiscount: number
  giftDiscount: number
  total: number
}

/** Resolve the charged unit price for a catalog product + size + plan (null if unknown). */
export function resolveUnitPrice(
  productId: string,
  sizeLabel: string | null,
  plan: Plan
): number | null {
  const product = getProductById(productId)
  if (!product) return null
  const base = getVariant(product, sizeLabel).price
  return plan === 'sub' ? subscribePrice(base) : base
}

/** Clamp a cart qty the same way the cart UI does. */
function clampQty(qty: number): number {
  return Number.isInteger(qty) && qty > 0 ? Math.min(qty, 99) : 1
}

/**
 * Compute order totals from catalog prices. `claimedPointsDiscount` and
 * `claimedGiftDiscount` are client-claimed (Studio Points and gift cards are
 * device-local demo features) and are clamped against the remaining payable.
 * `shippingMethod`: pickup skips shipping entirely; priority adds the dispatch
 * fee on top of the standard rules (even when free shipping is unlocked).
 * Returns null when any product is unknown — callers must reject the order.
 */
export function computeTotals(
  items: PricingItem[],
  promoCode: string | null = null,
  claimedPointsDiscount = 0,
  claimedGiftDiscount = 0,
  shippingMethod: ShippingMethod = 'standard'
): OrderTotals | null {
  let subtotal = 0
  for (const item of items) {
    const unitPrice = resolveUnitPrice(item.id, item.size, item.plan)
    if (unitPrice == null) return null
    subtotal += unitPrice * clampQty(item.qty)
  }

  const promo: Promo | null = lookupPromo(promoCode)
  const discount = promoDiscount(promo, subtotal)
  const freeShipping =
    subtotal - discount >= FREE_SHIPPING_THRESHOLD || promoGivesFreeShipping(promo)
  let shipping: number
  if (shippingMethod === 'pickup') {
    shipping = 0
  } else if (shippingMethod === 'priority') {
    shipping = (freeShipping ? 0 : SHIPPING_FEE) + PRIORITY_DISPATCH_FEE
  } else {
    shipping = freeShipping ? 0 : SHIPPING_FEE
  }

  const pointsDiscount = Math.max(0, Math.min(claimedPointsDiscount, subtotal - discount))
  const giftDiscount = Math.max(
    0,
    Math.min(claimedGiftDiscount, subtotal - discount - pointsDiscount + shipping)
  )
  const total = Math.max(0, subtotal - discount - pointsDiscount + shipping - giftDiscount)

  return { subtotal, discount, shipping, pointsDiscount, giftDiscount, total }
}

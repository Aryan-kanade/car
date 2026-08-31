// ─────────────────────────────────────────────────────────────
// Demo promo codes for checkout.
// ─────────────────────────────────────────────────────────────

const PROMOS = {
  WELCOME10: { code: 'WELCOME10', type: 'percent', value: 10, label: '10% off your order' },
  FREESHIP: { code: 'FREESHIP', type: 'shipping', value: 0, label: 'Free shipping' },
}

export function lookupPromo(code) {
  return PROMOS[(code ?? '').toString().trim().toUpperCase()] ?? null
}

/** Percent-off promos reduce the subtotal; shipping promos do not. */
export function promoDiscount(promo, subtotal) {
  if (!promo || promo.type !== 'percent') return 0
  return Math.round((subtotal * promo.value) / 100)
}

export function promoGivesFreeShipping(promo) {
  return promo?.type === 'shipping'
}

// ─────────────────────────────────────────────────────────────
// Demo promo codes for checkout.
// ─────────────────────────────────────────────────────────────

export type PromoType = 'percent' | 'shipping'

export interface Promo {
  code: string
  type: PromoType
  value: number
  label: string
}

const PROMOS: Record<string, Promo> = {
  WELCOME10: { code: 'WELCOME10', type: 'percent', value: 10, label: '10% off your order' },
  FREESHIP: { code: 'FREESHIP', type: 'shipping', value: 0, label: 'Free shipping' },
}

export function lookupPromo(code: string | null | undefined): Promo | null {
  return PROMOS[(code ?? '').toString().trim().toUpperCase()] ?? null
}

/** Percent-off promos reduce the subtotal; shipping promos do not. */
export function promoDiscount(promo: Promo | null, subtotal: number): number {
  if (!promo || promo.type !== 'percent') return 0
  return Math.round((subtotal * promo.value) / 100)
}

export function promoGivesFreeShipping(promo: Promo | null | undefined): boolean {
  return promo?.type === 'shipping'
}

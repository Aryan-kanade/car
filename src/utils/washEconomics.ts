// ─────────────────────────────────────────────────────────────
// Cost-per-use economics from the catalog's dilution data —
// "500 ml = ~40 washes → ₹9.7 per wash". Shown on PDP, cart and
// the invoice; pure so it can be unit-tested.
// ─────────────────────────────────────────────────────────────

import { getProductById, getVariant, sizeLitres, type Product } from '../data/catalog'
import { resolveUnitPrice, type Plan } from './pricing'

export interface WashEconomics {
  /** Full-capacity washes a single unit covers (10 L bucket). */
  washes: number
  /** Price per wash in rupees. */
  perWash: number
  /** Volume label used for the copy, e.g. '500 ml'. */
  sizeLabel: string | null
}

const BUCKET_LITRES = 10

/** Estimate washes + ₹/wash for a product/size/plan. Null when not a wash chemical. */
export function washEconomics(
  productId: string,
  sizeLabel: string | null,
  plan: Plan = 'once'
): WashEconomics | null {
  const product: Product | undefined = getProductById(productId)
  if (!product?.dilutionMlPerLitre || product.dilutionMlPerLitre <= 0) return null

  const variant = getVariant(product, sizeLabel)
  const litres = sizeLitres(variant.label)
  if (litres == null || litres <= 0) return null

  const mlPerWash = product.dilutionMlPerLitre * BUCKET_LITRES
  const washes = Math.floor((litres * 1000) / mlPerWash)
  // Only frame products as "per wash" supplies when a bottle meaningfully
  // covers multiple buckets — targeted sprays (wheel cleaner) don't qualify.
  if (washes < 5) return null

  const unitPrice = resolveUnitPrice(productId, variant.label, plan)
  if (unitPrice == null) return null

  return {
    washes,
    perWash: Math.round((unitPrice / washes) * 10) / 10,
    sizeLabel: variant.label,
  }
}

/** Formatted line for UI: '~40 washes · ₹9.7 per wash'. */
export function formatEconomics(econ: WashEconomics | null): string | null {
  if (!econ) return null
  return `~${econ.washes} washes · ₹${econ.perWash} per wash`
}

/** Aggregate estimate across a whole order — "your kit ≈ 6 months of washes". */
export function orderWashEstimate(
  items: Array<{ id: string; size: string | null; qty: number }>
): { washes: number; months: number } | null {
  // A typical enthusiast washes every ~10 days → ~3 washes a month
  const WASHES_PER_MONTH = 3
  let washes = 0
  for (const item of items) {
    const econ = washEconomics(item.id, item.size)
    if (econ) washes += econ.washes * item.qty
  }
  if (washes === 0) return null
  return { washes, months: Math.round((washes / WASHES_PER_MONTH) * 10) / 10 }
}

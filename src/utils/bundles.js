// ─────────────────────────────────────────────────────────────
// Smart bundle completion: detect when a cart already contains
// 2+ of a kit's products and suggest upgrading to the full kit
// (better per-unit value via the bundle price). Pure — tested.
// ─────────────────────────────────────────────────────────────

import { bundles } from '../data/catalog'

/** Strip " (500 ml)" style suffixes from a bundle include line. */
function includeName(line) {
  return line
    .replace(/\s*\(.*\)\s*$/, '')
    .replace(/\s*\d+\s*×\s*/i, '')
    .trim()
    .toLowerCase()
}

/**
 * Best kit-upgrade candidate for the current cart, or null.
 * Matches on product names inside each bundle's `includes` list;
 * suggests only when the kit itself is not already in the cart.
 */
export function kitCompletionCandidate(cartProducts) {
  let best = null
  for (const bundle of bundles) {
    if (cartProducts.some((p) => p.id === bundle.productId)) continue
    const names = bundle.includes.map(includeName)
    const matches = cartProducts.filter((p) => {
      const name = p.name.toLowerCase()
      return names.some((n) => n.includes(name) || name.includes(n))
    })
    if (matches.length >= 2 && (!best || matches.length > best.matchedCount)) {
      best = { bundle, matchedCount: matches.length }
    }
  }
  return best
}

import Fuse from 'fuse.js'
import { purchasableProducts } from '../data/catalog'

/** Synonym layer — expands queries so "tyre soap" finds Wheel Cleaner + shampoos. */
const SYNONYMS = {
  wash: ['shampoo', 'wash'],
  soap: ['shampoo', 'wash'],
  shampoo: ['shampoo', 'wash'],
  tyre: ['tyre', 'wheel'],
  tire: ['tyre', 'wheel'],
  wheel: ['wheel', 'tyre'],
  rim: ['wheel', 'tyre'],
  cheap: ['shampoo'],
  gloss: ['wax', 'shine'],
  shine: ['wax', 'gloss'],
  protect: ['wax', 'coat', 'polish'],
  coat: ['wax', 'protect'],
  glass: ['glass'],
  window: ['glass'],
  inside: ['interior'],
  cabin: ['interior'],
  dash: ['interior', 'dashboard'],
  towel: ['microfibre', 'drying'],
  cloth: ['microfibre', 'towel'],
  mitt: ['mitt', 'wash'],
  brush: ['brush'],
  kit: ['kit', 'bundle'],
  set: ['kit', 'set'],
}

const fuse = new Fuse(purchasableProducts, {
  keys: [
    { name: 'name', weight: 2 },
    { name: 'category', weight: 1.5 },
    { name: 'description', weight: 0.5 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
})

function expand(query) {
  return query
    .split(/\s+/)
    .flatMap((word) => SYNONYMS[word.toLowerCase()] ?? [word])
    .join(' ')
}

/** Typo-tolerant, synonym-aware product search over the purchasable catalog. */
export function searchProducts(query, limit = 8) {
  const trimmed = query.trim()
  if (!trimmed) return purchasableProducts.slice(0, limit)
  const expanded = expand(trimmed)
  const results = fuse.search(expanded, { limit })
  return results.length > 0 ? results.map((entry) => entry.item) : []
}

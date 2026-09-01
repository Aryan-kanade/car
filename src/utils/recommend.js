// ─────────────────────────────────────────────────────────────
// Co-purchase matrix — curated "bought together" pairs, and
// localStorage category-affinity scoring for recommendations.
// ─────────────────────────────────────────────────────────────

import { getProductById, purchasableProducts } from '../data/catalog'

/** Curated co-purchase pairs ( productId -> frequently bought with ). */
const CO_PURCHASE = {
  'pre-wash-shampoo': ['washberry-shampoo', 'grit-guard', 'plush-wash-mitt'],
  'washberry-shampoo': ['pre-wash-shampoo', 'twist-loop-drying-towel', 'plush-wash-mitt'],
  'wax-shampoo': ['dual-layer-microfibre-pack', 'washberry-shampoo'],
  degreaser: ['detailing-brush-set', 'wheel-cleaner'],
  'wheel-cleaner': ['tyre-polish', 'detailing-brush-set'],
  'tyre-polish': ['wheel-cleaner', 'foam-applicator-set'],
  'glass-cleaner': ['dual-layer-microfibre-pack', 'dashboard-polish'],
  'dashboard-polish': ['foam-applicator-set', 'glass-cleaner'],
  'complete-detail-kit': [],
  'essentials-wash-kit': ['sample-pre-wash', 'grit-guard'],
  'twist-loop-drying-towel': ['washberry-shampoo', 'plush-wash-mitt'],
  'plush-wash-mitt': ['grit-guard', 'pre-wash-shampoo'],
  'foam-applicator-set': ['dashboard-polish', 'tyre-polish'],
  'detailing-brush-set': ['wheel-cleaner', 'degreaser'],
  'dual-layer-microfibre-pack': ['glass-cleaner', 'wax-shampoo'],
  'grit-guard': ['plush-wash-mitt', 'washberry-shampoo'],
}

/** Products frequently bought with the given product, excluding cart items. */
export function coViewRecommendations(productId, excludeIds = [], limit = 3) {
  const pairs = CO_PURCHASE[productId] ?? []
  return pairs
    .filter((id) => !excludeIds.includes(id))
    .map((id) => getProductById(id))
    .filter(Boolean)
    .slice(0, limit)
}

const AFFINITY_KEY = 'kmkiramyki-affinity'

function readAffinity() {
  try {
    const raw = window.localStorage.getItem(AFFINITY_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

/** Record a product view/category signal for affinity-based recs. */
export function recordAffinity(category) {
  if (!category) return
  try {
    const counts = readAffinity()
    counts[category] = (counts[category] ?? 0) + 1
    window.localStorage.setItem(AFFINITY_KEY, JSON.stringify(counts))
  } catch {
    /* storage unavailable */
  }
}

/** Top categories by view count. */
export function topAffinityCategories(limit = 2) {
  const counts = readAffinity()
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([category]) => category)
}

/** "Recommended for you" — top products from affinity categories. */
export function recommendedForYou(excludeIds = [], limit = 4) {
  const categories = topAffinityCategories()
  if (categories.length === 0) return []
  return purchasableProducts
    .filter((p) => categories.includes(p.category) && !excludeIds.includes(p.id))
    .slice(0, limit)
}

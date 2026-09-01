// ─────────────────────────────────────────────────────────────
// 30-day price tracker: snapshots variant prices to localStorage
// so cards/PDPs can show a truthful "Lowest in 30 days" badge.
// ─────────────────────────────────────────────────────────────

const KEY = 'kmkiramyki-prices'
const WINDOW_DAYS = 30

/** { 'product-id|size': { min: price, max: price, firstSeen, lastSeen } } */
function readSnapshots() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeSnapshots(snapshots) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(snapshots))
  } catch {
    /* storage unavailable — tracker is optional */
  }
}

function entryKey(productId, sizeLabel) {
  return `${productId}|${sizeLabel ?? 'default'}`
}

/** Record today's price. Call once per product on catalog render. */
export function trackPrice(productId, sizeLabel, price) {
  const key = entryKey(productId, sizeLabel)
  const now = Date.now()
  const snapshots = readSnapshots()
  const current = snapshots[key]

  if (!current) {
    snapshots[key] = { min: price, max: price, firstSeen: now, lastSeen: now }
  } else {
    snapshots[key] = {
      min: Math.min(current.min, price),
      max: Math.max(current.max, price),
      firstSeen: current.firstSeen,
      lastSeen: now,
    }
  }
  writeSnapshots(snapshots)
}

/**
 * Is this price the lowest seen in the tracking window?
 * Only claims a "low" when history actually exists (≥ 1 prior day
 * with a higher price) — never fabricates a deal.
 */
export function isLowestInWindow(productId, sizeLabel, price) {
  const current = readSnapshots()[entryKey(productId, sizeLabel)]
  if (!current) return false
  const seenBefore = current.lastSeen - current.firstSeen >= WINDOW_DAYS * 0.5 * 24 * 60 * 60 * 1000 // ≥ 15 days of history
  return seenBefore && price <= current.min && current.max > current.min
}

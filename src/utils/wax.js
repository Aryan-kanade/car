// ─────────────────────────────────────────────────────────────
// Recoat math for the Garage: carnauba-style protection is spent
// after ~8 weeks. Pure — unit-tested in tests/wax.test.js.
// ─────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000
/** Weeks of protection a typical wax/sealant application gives. */
export const WAX_PROTECTION_DAYS = 56

export function waxStatus(car, now = Date.now()) {
  if (!car?.waxedAt) return { known: false }
  const days = Math.floor((now - car.waxedAt) / DAY_MS)
  const left = WAX_PROTECTION_DAYS - days
  if (left <= 0) return { known: true, days, due: true, label: 'Recoat due now' }
  if (days >= 42)
    return { known: true, days, due: false, soon: true, label: `Recoat soon — ${left} days left` }
  return { known: true, days, due: false, soon: false, label: `Protected — ${left} days left` }
}

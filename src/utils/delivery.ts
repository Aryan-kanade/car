// ─────────────────────────────────────────────────────────────
// Delivery planning: ship-day cutoff (2 PM IST), EDD parsing,
// "order within Xh Ym" countdowns and the Detail-Day planner.
// Pure date math — unit-tested in tests/delivery.test.js.
// ─────────────────────────────────────────────────────────────

/** Orders before 2 PM IST ship the same day. */
export const SHIP_CUTOFF_IST = { hours: 14, minutes: 0 }

const IST_OFFSET_MINUTES = 5 * 60 + 30
const DAY_MS = 24 * 60 * 60 * 1000

/** Shift a Date to "IST wall clock as UTC" for safe component math. */
function toIstClock(now: Date): Date {
  return new Date(now.getTime() + IST_OFFSET_MINUTES * 60 * 1000)
}

function fromIstClock(ist: Date): Date {
  return new Date(ist.getTime() - IST_OFFSET_MINUTES * 60 * 1000)
}

/** The UTC-midnight Date of an IST wall-clock moment. */
function istMidnight(ist: Date): Date {
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()))
}

/**
 * The next ship-out moment (returned as a real instant): today's
 * 2 PM IST if we are before it on a business day, else the next
 * business day's cutoff (Mon–Sat; Sundays skip).
 */
export function nextShipDate(now: Date = new Date()): Date {
  const ist = toIstClock(now)
  const todayCutoff = new Date(
    istMidnight(ist).getTime() +
      SHIP_CUTOFF_IST.hours * 60 * 60 * 1000 +
      SHIP_CUTOFF_IST.minutes * 60 * 1000
  )
  let ship =
    ist.getTime() <= todayCutoff.getTime() ? todayCutoff : new Date(todayCutoff.getTime() + DAY_MS)
  while (ship.getUTCDay() === 0) ship = new Date(ship.getTime() + DAY_MS)
  return fromIstClock(ship)
}

/** ms from now until today's ship cutoff — drives the countdown. Null once passed (or Sunday). */
export function msUntilCutoff(now: Date = new Date()): number | null {
  const ist = toIstClock(now)
  if (ist.getUTCDay() === 0) return null
  const todayCutoff = new Date(
    istMidnight(ist).getTime() +
      SHIP_CUTOFF_IST.hours * 60 * 60 * 1000 +
      SHIP_CUTOFF_IST.minutes * 60 * 1000
  )
  if (ist.getTime() >= todayCutoff.getTime()) return null
  return todayCutoff.getTime() - ist.getTime()
}

/** Parse 'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm:ss' → Date at UTC midnight (or null). */
export function parseEdd(value: string | null | undefined): Date | null {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return null
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  return Number.isNaN(date.getTime()) ? null : date
}

/** Add N business days (Mon–Sat, Sundays skipped). */
export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date.getTime())
  let added = 0
  while (added < days) {
    result.setUTCDate(result.getUTCDate() + 1)
    if (result.getUTCDay() !== 0) added += 1
  }
  return result
}

/** Subtract N business days (Mon–Sat, Sundays skipped). */
export function subtractBusinessDays(date: Date, days: number): Date {
  const result = new Date(date.getTime())
  let removed = 0
  while (removed < days) {
    result.setUTCDate(result.getUTCDate() - 1)
    if (result.getUTCDay() !== 0) removed += 1
  }
  return result
}

/**
 * The estimated delivery date: real EDD when we have one, else
 * the policy estimate (3 business days) from the next ship date.
 */
export function estimatedDelivery(
  edd: string | null | undefined,
  now: Date = new Date(),
  businessDays = 3
): Date {
  const parsed = parseEdd(edd)
  if (parsed) return parsed
  return addBusinessDays(nextShipDate(now), businessDays)
}

export interface DeliveryPlan {
  /** Target detail day the customer picked (UTC midnight). */
  detailDay: Date
  /** Latest order day (UTC midnight) — order by its 2 PM IST cutoff. */
  orderBy: Date
  /** Order today and it still lands in time? */
  feasible: boolean
}

/**
 * Detail-Day planner: for a chosen wash day, the latest day you
 * can order — walking back 3 shipping days + a 1-day buffer.
 */
export function planDetailDay(
  detailDay: Date,
  edd: string | null = null,
  now: Date = new Date()
): DeliveryPlan {
  const orderBy = subtractBusinessDays(detailDay, 3 + 1)
  const projected = estimatedDelivery(edd, now)
  return { detailDay, orderBy, feasible: projected.getTime() <= detailDay.getTime() }
}

/** 'Fri, 12 Sep' style label for UTC-midnight dates. */
export function dayLabel(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

/** Countdown text '3h 12m' / '12m' — null when there is no live countdown. */
export function countdownLabel(ms: number | null): string | null {
  if (ms == null || ms <= 0) return null
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

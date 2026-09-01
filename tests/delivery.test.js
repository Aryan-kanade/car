import { describe, expect, it } from 'vitest'
import {
  addBusinessDays,
  countdownLabel,
  dayLabel,
  estimatedDelivery,
  msUntilCutoff,
  nextShipDate,
  parseEdd,
  planDetailDay,
  subtractBusinessDays,
} from '../src/utils/delivery'

const DAY = 24 * 60 * 60 * 1000

describe('nextShipDate / msUntilCutoff (IST cutoff 14:00)', () => {
  it('ships today when before 2 PM IST on a weekday', () => {
    // 2026-09-01 is a Tuesday; 07:00 IST = 01:30 UTC
    const now = new Date('2026-09-01T01:30:00Z')
    const ship = nextShipDate(now)
    // cutoff 14:00 IST = 08:30 UTC same day
    expect(ship.toISOString()).toBe('2026-09-01T08:30:00.000Z')
    expect(msUntilCutoff(now)).toBe(7 * 60 * 60 * 1000)
  })

  it('rolls to the next business day after the cutoff', () => {
    // 2026-09-01 Tuesday 18:00 IST (12:30 UTC) → ships Wed 14:00 IST
    const now = new Date('2026-09-01T12:30:00Z')
    expect(nextShipDate(now).toISOString()).toBe('2026-09-02T08:30:00.000Z')
    expect(msUntilCutoff(now)).toBeNull()
  })

  it('skips Sunday cutoffs', () => {
    // 2026-09-06 is a Sunday, 10:00 IST (04:30 UTC) → ships Monday
    const now = new Date('2026-09-06T04:30:00Z')
    expect(nextShipDate(now).toISOString()).toBe('2026-09-07T08:30:00.000Z')
    expect(msUntilCutoff(now)).toBeNull()
  })
})

describe('business-day math', () => {
  const tue = new Date('2026-09-01T00:00:00Z') // Tuesday

  it('adds business days skipping Sundays', () => {
    // Tue + 5 business days = Tue→Wed→Thu→Fri→Sat→Mon
    expect(addBusinessDays(tue, 5).toISOString()).toBe('2026-09-07T00:00:00.000Z')
  })

  it('subtracts business days skipping Sundays', () => {
    expect(subtractBusinessDays(tue, 4).toISOString()).toBe('2026-08-27T00:00:00.000Z')
  })
})

describe('estimatedDelivery', () => {
  it('uses the real EDD when parseable', () => {
    expect(estimatedDelivery('2026-09-10 17:23:34').toISOString()).toBe('2026-09-10T00:00:00.000Z')
  })

  it('falls back to 3 business days after the ship date', () => {
    // Tuesday before cutoff → Fri same week
    const now = new Date('2026-09-01T01:30:00Z')
    expect(estimatedDelivery(null, now).toISOString()).toBe('2026-09-04T08:30:00.000Z')
  })

  it('parseEdd rejects junk', () => {
    expect(parseEdd('nope')).toBeNull()
    expect(parseEdd(null)).toBeNull()
  })
})

describe('planDetailDay', () => {
  it('computes the order-by day with a buffer, walking back business days', () => {
    // Detail on Sun 2026-09-13 → back 4 business days (Sat, Fri, Thu, Wed) → Wed 2026-09-09
    const now = new Date('2026-09-01T01:30:00Z') // Tuesday before cutoff
    const plan = planDetailDay(new Date('2026-09-13T00:00:00Z'), null, now)
    expect(plan.orderBy.toISOString()).toBe('2026-09-09T00:00:00.000Z')
    expect(plan.feasible).toBe(true)
  })

  it('flags a detail day that is too soon', () => {
    const now = new Date('2026-09-10T12:30:00Z') // Thursday after cutoff
    const plan = planDetailDay(new Date('2026-09-11T00:00:00Z'), null, now)
    expect(plan.feasible).toBe(false)
  })
})

describe('labels', () => {
  it('formats UTC-midnight dates consistently', () => {
    expect(dayLabel(new Date('2026-09-04T00:00:00Z'))).toMatch(/Fri/)
  })

  it('countdown labels', () => {
    expect(countdownLabel(3 * 3600_000 + 12 * 60_000)).toBe('3h 12m')
    expect(countdownLabel(42 * 60_000)).toBe('42m')
    expect(countdownLabel(null)).toBeNull()
    expect(countdownLabel(0)).toBeNull()
  })
})

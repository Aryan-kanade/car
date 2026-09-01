import { describe, expect, it } from 'vitest'
import { waxStatus } from '../src/utils/wax'

const DAY = 24 * 60 * 60 * 1000
const NOW = Date.UTC(2026, 8, 1)

describe('waxStatus', () => {
  it('is unknown until a wax application is logged', () => {
    expect(waxStatus({ waxedAt: null }, NOW)).toEqual({ known: false })
    expect(waxStatus(null, NOW)).toEqual({ known: false })
  })

  it('reports protection days remaining', () => {
    const car = { waxedAt: NOW - 10 * DAY }
    const status = waxStatus(car, NOW)
    expect(status.known).toBe(true)
    expect(status.days).toBe(10)
    expect(status.due).toBe(false)
    expect(status.label).toContain('46 days left')
  })

  it('warns soon from week 6 and is due after 8 weeks', () => {
    const soon = waxStatus({ waxedAt: NOW - 45 * DAY }, NOW)
    expect(soon.soon).toBe(true)
    const due = waxStatus({ waxedAt: NOW - 57 * DAY }, NOW)
    expect(due.due).toBe(true)
    expect(due.label).toBe('Recoat due now')
  })
})

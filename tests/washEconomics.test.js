import { describe, expect, it } from 'vitest'
import { orderWashEstimate, washEconomics } from '../src/utils/washEconomics'

describe('washEconomics', () => {
  it('computes washes and ₹/wash from the dilution data', () => {
    // Pre Wash Shampoo: 10 ml/L × 10 L bucket = 100 ml/wash → 1 L = 10 washes
    // 1 L variant = ₹990 (549 × 1.8 rounded to ₹10) → ₹99 per wash
    const econ = washEconomics('pre-wash-shampoo', '1 L')
    expect(econ).not.toBeNull()
    expect(econ.washes).toBe(10)
    expect(econ.perWash).toBe(99)
  })

  it('returns null for products without dilution data (kits, accessories)', () => {
    expect(washEconomics('complete-detail-kit', null)).toBeNull()
    expect(washEconomics('twist-loop-drying-towel', null)).toBeNull()
  })

  it('returns null for targeted sprays that do not cover 5+ bucket washes', () => {
    // Wheel Cleaner: 25 ml/L → 250 ml/wash → max 4 washes per litre
    expect(washEconomics('wheel-cleaner', '1 L')).toBeNull()
    expect(washEconomics('wheel-cleaner', '500 ml')).toBeNull()
  })

  it('applies the subscription discount to the per-wash price', () => {
    const once = washEconomics('wax-shampoo', '500 ml', 'once')
    const sub = washEconomics('wax-shampoo', '500 ml', 'sub')
    expect(once.washes).toBe(sub.washes)
    expect(sub.perWash).toBeLessThan(once.perWash)
  })
})

describe('orderWashEstimate', () => {
  it('sums washable items and estimates months at 3 washes/month', () => {
    const estimate = orderWashEstimate([{ id: 'pre-wash-shampoo', size: '1 L', qty: 1 }])
    // 10 washes / 3 per month ≈ 3.3 months
    expect(estimate.washes).toBe(10)
    expect(estimate.months).toBe(3.3)
  })

  it('returns null when nothing in the order is washable', () => {
    expect(orderWashEstimate([{ id: 'complete-detail-kit', size: null, qty: 1 }])).toBeNull()
  })
})

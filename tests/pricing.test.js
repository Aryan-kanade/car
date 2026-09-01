import { describe, expect, it } from 'vitest'
import {
  computeTotals,
  normalizeShippingMethod,
  resolveUnitPrice,
  subscribePrice,
} from '../src/utils/pricing'

describe('resolveUnitPrice', () => {
  it('prices base size from the catalog', () => {
    expect(resolveUnitPrice('wheel-cleaner', '500 ml', 'once')).toBe(679)
  })

  it('applies the 1 L multiplier rounded to ₹10', () => {
    // 679 × 1.8 = 1222.2 → rounded to 1220
    expect(resolveUnitPrice('wheel-cleaner', '1 L', 'once')).toBe(1220)
  })

  it('applies the 15% subscription discount, rounded to the rupee', () => {
    expect(subscribePrice(439)).toBe(373)
    expect(resolveUnitPrice('wax-shampoo', '500 ml', 'sub')).toBe(373)
  })

  it('returns null for unknown products', () => {
    expect(resolveUnitPrice('does-not-exist', null, 'once')).toBeNull()
  })
})

describe('computeTotals', () => {
  it('computes subtotal, flat shipping and total', () => {
    const totals = computeTotals([{ id: 'wheel-cleaner', size: '500 ml', plan: 'once', qty: 2 }])
    expect(totals.subtotal).toBe(1358)
    expect(totals.shipping).toBe(199)
    expect(totals.total).toBe(1557)
  })

  it('re-checks the free-shipping threshold after the promo discount', () => {
    // 10 × 679 = 6790 → −10% = 6111 → below 7155 threshold → shipping charged
    const totals = computeTotals(
      [{ id: 'wheel-cleaner', size: '500 ml', plan: 'once', qty: 10 }],
      'WELCOME10'
    )
    expect(totals.discount).toBe(679)
    expect(totals.shipping).toBe(199)
    expect(totals.total).toBe(6111 + 199)
  })

  it('gives free shipping with the FREESHIP promo under the threshold', () => {
    const totals = computeTotals(
      [{ id: 'wheel-cleaner', size: '500 ml', plan: 'once', qty: 1 }],
      'FREESHIP'
    )
    expect(totals.shipping).toBe(0)
    expect(totals.total).toBe(679)
  })

  it('clamps a claimed points discount to the payable subtotal', () => {
    const totals = computeTotals(
      [{ id: 'wheel-cleaner', size: '500 ml', plan: 'once', qty: 1 }],
      null,
      5000 // claimed far beyond the ₹679 subtotal
    )
    expect(totals.pointsDiscount).toBe(679)
    expect(totals.giftDiscount).toBe(0)
    expect(totals.total).toBe(199) // only shipping remains
  })

  it('gift discount can absorb shipping when the subtotal is covered', () => {
    const totals = computeTotals(
      [{ id: 'wheel-cleaner', size: '500 ml', plan: 'once', qty: 1 }],
      null,
      679, // points exactly cover the subtotal
      5000 // gift absorbs the shipping fee
    )
    expect(totals.pointsDiscount).toBe(679)
    expect(totals.giftDiscount).toBe(199)
    expect(totals.total).toBe(0)
  })

  it('returns null when any line is unknown (server must reject)', () => {
    expect(
      computeTotals([
        { id: 'wheel-cleaner', size: '500 ml', plan: 'once', qty: 1 },
        { id: 'not-a-product', size: null, plan: 'once', qty: 1 },
      ])
    ).toBeNull()
  })
})

describe('computeTotals shipping methods', () => {
  const line = { id: 'wheel-cleaner', size: '500 ml', plan: 'once', qty: 1 } // ₹679

  it('priority adds the dispatch fee on top of standard shipping', () => {
    const totals = computeTotals([line], null, 0, 0, 'priority')
    expect(totals.shipping).toBe(199 + 99)
    expect(totals.total).toBe(679 + 199 + 99)
  })

  it('priority keeps the fee even when free shipping is unlocked', () => {
    const overThreshold = [{ ...line, qty: 12 }] // 12 × 679 = 8148 ≥ 7155
    const totals = computeTotals(overThreshold, null, 0, 0, 'priority')
    expect(totals.shipping).toBe(99)
  })

  it('pickup never charges shipping', () => {
    const totals = computeTotals([line], null, 0, 0, 'pickup')
    expect(totals.shipping).toBe(0)
    expect(totals.total).toBe(679)
  })

  it('unknown methods fall back to standard', () => {
    expect(computeTotals([line], null, 0, 0, 'teleport')).toMatchObject({
      shipping: 199,
      total: 878,
    })
  })
})

describe('normalizeShippingMethod', () => {
  it('accepts whitelisted methods and falls back to standard', () => {
    expect(normalizeShippingMethod('pickup')).toBe('pickup')
    expect(normalizeShippingMethod('priority')).toBe('priority')
    expect(normalizeShippingMethod('standard')).toBe('standard')
    expect(normalizeShippingMethod('drone')).toBe('standard')
    expect(normalizeShippingMethod(undefined)).toBe('standard')
  })
})

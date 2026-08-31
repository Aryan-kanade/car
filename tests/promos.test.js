import { describe, expect, it } from 'vitest'
import { lookupPromo, promoDiscount, promoGivesFreeShipping } from '../src/utils/promos'

describe('lookupPromo', () => {
  it('matches codes case-insensitively and trims whitespace', () => {
    expect(lookupPromo(' welcome10 ').code).toBe('WELCOME10')
    expect(lookupPromo('FreeShip').code).toBe('FREESHIP')
  })

  it('returns null for unknown or empty codes', () => {
    expect(lookupPromo('SAVE100')).toBeNull()
    expect(lookupPromo('')).toBeNull()
    expect(lookupPromo(null)).toBeNull()
  })
})

describe('promoDiscount', () => {
  it('computes percent discounts', () => {
    expect(promoDiscount(lookupPromo('WELCOME10'), 1613)).toBe(161)
  })

  it('returns zero for shipping promos and missing promos', () => {
    expect(promoDiscount(lookupPromo('FREESHIP'), 1613)).toBe(0)
    expect(promoDiscount(null, 1613)).toBe(0)
  })
})

describe('promoGivesFreeShipping', () => {
  it('is true only for shipping promos', () => {
    expect(promoGivesFreeShipping(lookupPromo('FREESHIP'))).toBe(true)
    expect(promoGivesFreeShipping(lookupPromo('WELCOME10'))).toBe(false)
    expect(promoGivesFreeShipping(null)).toBe(false)
  })
})

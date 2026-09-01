import { describe, expect, it } from 'vitest'
import { padBadgeCount } from '../src/components/CartLogo'

describe('padBadgeCount', () => {
  it('zero-pads single digits like the brand mockup ("03")', () => {
    expect(padBadgeCount(0)).toBe('00')
    expect(padBadgeCount(3)).toBe('03')
    expect(padBadgeCount(9)).toBe('09')
  })

  it('keeps two digits untouched', () => {
    expect(padBadgeCount(10)).toBe('10')
    expect(padBadgeCount(12)).toBe('12')
    expect(padBadgeCount(99)).toBe('99')
  })

  it('caps past two digits', () => {
    expect(padBadgeCount(100)).toBe('99+')
    expect(padBadgeCount(999)).toBe('99+')
  })
})

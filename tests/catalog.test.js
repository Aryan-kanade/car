import { describe, expect, it } from 'vitest'
import { defaultSizeLabel, formatPrice, getVariant, products } from '../src/data/catalog'

describe('formatPrice', () => {
  it('formats INR with Indian grouping and two decimals', () => {
    expect(formatPrice(18125)).toBe('₹18,125.00')
    expect(formatPrice(325)).toBe('₹325.00')
    expect(formatPrice(7155)).toBe('₹7,155.00')
  })
})

describe('getVariant', () => {
  const washberry = products.find((p) => p.id === 'washberry-shampoo')
  const kit = products.find((p) => p.id === 'complete-detail-kit')

  it('returns base pricing for the default size', () => {
    const variant = getVariant(washberry, '500 ml')
    expect(variant.price).toBe(washberry.price)
    expect(variant.compareAt).toBe(washberry.compareAt)
    expect(variant.label).toBe('500 ml')
  })

  it('scales pricing for larger sizes and rounds to ₹10', () => {
    // 389 * 1.8 = 700.2 → rounded to 700
    const variant = getVariant(washberry, '1 L')
    expect(variant.price).toBe(700)
    expect(variant.compareAt).toBe(1350) // 749 * 1.8 = 1348.2 → 1350
  })

  it('falls back to the first size for an unknown label', () => {
    expect(getVariant(washberry, '5 L').label).toBe('500 ml')
  })

  it('returns base pricing for size-less products (kits)', () => {
    const variant = getVariant(kit, null)
    expect(variant.price).toBe(kit.price)
    expect(variant.label).toBeNull()
    expect(defaultSizeLabel(kit)).toBeNull()
  })
})

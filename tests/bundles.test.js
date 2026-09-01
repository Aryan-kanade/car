import { describe, expect, it } from 'vitest'
import { kitCompletionCandidate } from '../src/utils/bundles'
import { getProductById } from '../src/data/catalog'

const p = (id) => getProductById(id)

describe('kitCompletionCandidate', () => {
  it('suggests a kit when 2+ of its products are in the cart', () => {
    const candidate = kitCompletionCandidate([p('pre-wash-shampoo'), p('washberry-shampoo')])
    expect(candidate).not.toBeNull()
    expect(candidate.bundle.title).toBe('WASH')
    expect(candidate.matchedCount).toBeGreaterThanOrEqual(2)
  })

  it('stays quiet when the kit itself is already in the cart', () => {
    const candidate = kitCompletionCandidate([
      p('essentials-wash-kit'),
      p('pre-wash-shampoo'),
      p('washberry-shampoo'),
    ])
    // WASH is in the cart → falls through to PRO (its includes also match)
    expect(candidate === null || candidate.bundle.productId !== 'essentials-wash-kit').toBe(true)
  })

  it('returns null for a cart that matches nothing', () => {
    expect(kitCompletionCandidate([p('grit-guard')])).toBeNull()
    expect(kitCompletionCandidate([])).toBeNull()
  })
})

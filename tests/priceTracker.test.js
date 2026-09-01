import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isLowestInWindow, trackPrice } from '../src/utils/priceTracker'

const storage = new Map()
const localStorageMock = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
}

beforeEach(() => {
  storage.clear()
  vi.stubGlobal('window', { localStorage: localStorageMock })
  vi.stubGlobal('localStorage', localStorageMock)
})

afterEach(() => vi.unstubAllGlobals())

describe('priceTracker', () => {
  it('never claims a low without 15+ days of history', () => {
    trackPrice('wheel-cleaner', '500 ml', 679)
    expect(isLowestInWindow('wheel-cleaner', '500 ml', 679)).toBe(false)
  })

  it('flags the lowest once history exists with a higher past price', () => {
    // Seed with a higher price, then age the snapshot artificially
    trackPrice('wheel-cleaner', '500 ml', 749)
    const raw = JSON.parse(localStorageMock.getItem('kmkiramyki-prices'))
    raw['wheel-cleaner|500 ml'].firstSeen = Date.now() - 20 * 24 * 60 * 60 * 1000
    storage.set('kmkiramyki-prices', JSON.stringify(raw))

    trackPrice('wheel-cleaner', '500 ml', 679)
    expect(isLowestInWindow('wheel-cleaner', '500 ml', 679)).toBe(true)
    // A price above the historical min is not a low
    expect(isLowestInWindow('wheel-cleaner', '500 ml', 699)).toBe(false)
  })

  it('tracks sizes independently', () => {
    trackPrice('wheel-cleaner', '1 L', 1220)
    const raw = JSON.parse(localStorageMock.getItem('kmkiramyki-prices'))
    raw['wheel-cleaner|1 L'].firstSeen = Date.now() - 20 * 24 * 60 * 60 * 1000
    storage.set('kmkiramyki-prices', JSON.stringify(raw))

    expect(isLowestInWindow('wheel-cleaner', '1 L', 1220)).toBe(false) // flat history, never higher
    expect(isLowestInWindow('wheel-cleaner', '500 ml', 1220)).toBe(false)
  })
})

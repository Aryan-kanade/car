import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { findOrder, getOrderStatus, readOrders, saveOrder } from '../src/utils/orders'

const storage = new Map()
const localStorageMock = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
}

beforeEach(() => {
  storage.clear()
  // The utils read window.localStorage — provide both globals for the Node env
  vi.stubGlobal('window', { localStorage: localStorageMock })
  vi.stubGlobal('localStorage', localStorageMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const cartItems = [
  {
    product: { id: 'wax-shampoo', name: 'Wax Shampoo' },
    size: '500 ml',
    plan: 'once',
    qty: 2,
    unitPrice: 439,
    lineTotal: 878,
  },
]

describe('saveOrder', () => {
  it('snapshots items, applies free shipping over the threshold', () => {
    const order = saveOrder({
      email: 'a@example.com',
      name: 'A B',
      items: cartItems,
      subtotal: 878,
      promo: null,
    })
    expect(order.number).toMatch(/^KMK-\d{6}$/)
    expect(order.shipping).toBe(199)
    expect(order.total).toBe(878 + 199)
    expect(order.items[0]).toEqual({
      id: 'wax-shampoo',
      name: 'Wax Shampoo',
      size: '500 ml',
      subscription: false,
      qty: 2,
      unitPrice: 439,
    })
    expect(readOrders()).toHaveLength(1)
  })

  it('keeps a percent discount and re-checks the shipping threshold after it', () => {
    const order = saveOrder({
      email: 'a@example.com',
      name: 'A B',
      items: cartItems,
      subtotal: 7300,
      promo: { code: 'WELCOME10', type: 'percent', value: 10 },
    })
    expect(order.discount).toBe(730)
    // 7300 - 730 = 6570 → below threshold → shipping charged
    expect(order.shipping).toBe(199)
    expect(order.total).toBe(7300 - 730 + 199)
    expect(order.promoCode).toBe('WELCOME10')
  })

  it('gives free shipping with a shipping promo under the threshold', () => {
    const order = saveOrder({
      email: 'a@example.com',
      name: 'A B',
      items: cartItems,
      subtotal: 878,
      promo: { code: 'FREESHIP', type: 'shipping', value: 0 },
    })
    expect(order.shipping).toBe(0)
    expect(order.total).toBe(878)
  })
})

describe('findOrder', () => {
  it('matches number and email case-insensitively', () => {
    const order = saveOrder({
      email: 'MiXeD@Example.com',
      name: 'A B',
      items: cartItems,
      subtotal: 878,
      promo: null,
    })
    expect(findOrder(order.number.toLowerCase(), 'mixed@example.com')).toEqual(order)
    expect(findOrder(order.number, 'wrong@example.com')).toBeUndefined()
    expect(findOrder('KMK-000000', 'mixed@example.com')).toBeUndefined()
  })
})

describe('getOrderStatus', () => {
  it('progresses from Placed to Out for delivery by age', () => {
    expect(getOrderStatus(Date.now()).label).toBe('Placed')
    expect(getOrderStatus(Date.now() - 30 * 36e5).label).toBe('Shipped')
    expect(getOrderStatus(Date.now() - 80 * 36e5).label).toBe('Out for delivery')
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  findOrder,
  getOrderStatus,
  readOrders,
  saveOrder,
  saveServerOrder,
} from '../src/utils/orders'

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

describe('saveServerOrder', () => {
  it('persists a server-confirmed order as-is (no client recompute)', () => {
    const serverOrder = {
      number: 'KMK-654321',
      email: 'paid@example.com',
      name: 'Paid Customer',
      phone: '9876543210',
      items: [
        {
          id: 'wheel-cleaner',
          name: 'Wheel Cleaner',
          size: '500 ml',
          subscription: false,
          qty: 1,
          unitPrice: 679,
        },
      ],
      subtotal: 679,
      discount: 0,
      promoCode: null,
      shipping: 199,
      total: 878,
      pointsSpent: 0,
      pointsEarned: 8,
      giftCode: null,
      giftDiscount: 0,
      placedAt: 1750000000000,
      paymentMethod: 'online',
      razorpayPaymentId: 'pay_test_123',
      shiprocketOrderId: 52791876,
      awb: 'SR123456',
    }
    const order = saveServerOrder(serverOrder)
    expect(order).toEqual(serverOrder)
    expect(readOrders()[0].number).toBe('KMK-654321')
    expect(readOrders()[0].razorpayPaymentId).toBe('pay_test_123')
    expect(findOrder('KMK-654321', 'paid@example.com')).toEqual(serverOrder)
  })

  it('caps stored orders at 20 like saveOrder', () => {
    for (let i = 0; i < 25; i += 1) {
      saveServerOrder({
        ...readOrders()[0],
        number: `KMK-${100000 + i}`,
      })
    }
    expect(readOrders()).toHaveLength(20)
    expect(readOrders()[0].number).toBe('KMK-100024')
  })
})

describe('getOrderStatus', () => {
  it('progresses from Placed to Out for delivery by age', () => {
    expect(getOrderStatus(Date.now()).label).toBe('Placed')
    expect(getOrderStatus(Date.now() - 30 * 36e5).label).toBe('Shipped')
    expect(getOrderStatus(Date.now() - 80 * 36e5).label).toBe('Out for delivery')
  })
})

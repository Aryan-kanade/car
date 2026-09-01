import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildAdhocPayload,
  mapStatusToLabel,
  normalizeServiceability,
  normalizeTracking,
} from '../api/_lib/shiprocket'

const record = () => ({
  number: 'KMK-123456',
  placedAt: new Date('2026-09-01T10:30:00Z').getTime(),
  paymentMethod: 'cod',
  customer: {
    name: 'Aryan Kanade',
    email: 'aryan@example.com',
    phone: '9876543210',
    address: '1 Test Lane',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
  },
  items: [
    {
      id: 'wheel-cleaner',
      name: 'Wheel Cleaner',
      size: '500 ml',
      subscription: false,
      qty: 2,
      unitPrice: 679,
    },
  ],
  totals: {
    subtotal: 1358,
    discount: 0,
    shipping: 199,
    pointsDiscount: 0,
    giftDiscount: 0,
    total: 1557,
  },
})

beforeEach(() => {
  delete process.env.SHIPROCKET_PICKUP_LOCATION
})

describe('buildAdhocPayload', () => {
  it('maps customer, items, totals and COD', () => {
    const payload = buildAdhocPayload(record())
    expect(payload.order_id).toBe('KMK-123456')
    expect(payload.order_date).toBe('2026-09-01 10:30:00')
    expect(payload.billing_customer_name).toBe('Aryan')
    expect(payload.billing_last_name).toBe('Kanade')
    expect(payload.billing_phone).toBe('9876543210')
    expect(payload.shipping_is_billing).toBe(true)
    expect(payload.payment_method).toBe('COD')
    expect(payload.order_items).toEqual([
      {
        name: 'Wheel Cleaner (500 ml)',
        sku: 'wheel-cleaner',
        units: 2,
        selling_price: 679,
        hsn: '3402',
      },
    ])
    expect(payload.sub_total).toBe(1557)
    expect(payload.weight).toBe(1) // 0.5 kg × 2 units
  })

  it('uses Prepaid for online orders and honors the pickup location env', () => {
    process.env.SHIPROCKET_PICKUP_LOCATION = 'Andheri Warehouse'
    const payload = buildAdhocPayload({ ...record(), paymentMethod: 'online' })
    expect(payload.payment_method).toBe('Prepaid')
    expect(payload.pickup_location).toBe('Andheri Warehouse')
  })

  it('handles single-word names and the minimum parcel weight', () => {
    const one = record()
    one.customer.name = 'Prince'
    one.items[0].qty = 1
    const payload = buildAdhocPayload(one)
    expect(payload.billing_last_name).toBe('-')
    expect(payload.weight).toBe(0.5)
  })
})

describe('mapStatusToLabel', () => {
  it('maps courier wording to our timeline stages', () => {
    expect(mapStatusToLabel('Pending')).toBe('Placed')
    expect(mapStatusToLabel('Label Generated')).toBe('Packed')
    expect(mapStatusToLabel('Pickup Queued')).toBe('Packed')
    expect(mapStatusToLabel('In Transit')).toBe('Shipped')
    expect(mapStatusToLabel('Out for Delivery')).toBe('Out for delivery')
    expect(mapStatusToLabel('Delivered')).toBe('Delivered')
  })

  it('maps terminal statuses', () => {
    expect(mapStatusToLabel('Canceled')).toBe('Cancelled')
    expect(mapStatusToLabel('RTO Delivered')).toBe('Returned to origin')
    expect(mapStatusToLabel('Lost in transit')).toBe('Lost')
  })

  it('returns null for unknown wording', () => {
    expect(mapStatusToLabel('Weird courier status')).toBeNull()
    expect(mapStatusToLabel('')).toBeNull()
  })
})

describe('normalizeServiceability', () => {
  it('normalizes courier companies into serviceable + COD + earliest EDD', () => {
    const result = normalizeServiceability({
      data: {
        available_courier_companies: [
          {
            courier_name: 'Delhivery',
            rate: 80,
            etd: '2026-09-04 17:23:34',
            cod: 0,
            cod_available: 0,
          },
          {
            courier_name: 'Bluedart',
            rate: 65,
            etd: '2026-09-03 10:00:00',
            cod: 1,
            cod_available: 1,
          },
        ],
      },
    })
    expect(result).toEqual({
      serviceable: true,
      codAvailable: true,
      edd: '2026-09-03',
      courier: 'Delhivery',
      rate: 65,
    })
  })

  it('reports prepaid-only when no courier takes COD', () => {
    const result = normalizeServiceability({
      data: {
        available_courier_companies: [
          { courier_name: 'X', rate: 70, etd: '2026-09-05 09:00:00', cod: 0 },
        ],
      },
    })
    expect(result.serviceable).toBe(true)
    expect(result.codAvailable).toBe(false)
  })

  it('handles the not-serviceable / error shapes', () => {
    expect(normalizeServiceability({ data: { available_courier_companies: [] } })).toMatchObject({
      serviceable: false,
      codAvailable: false,
    })
    expect(
      normalizeServiceability({ status: 404, message: 'No Serviceability data available' })
    ).toMatchObject({ serviceable: false })
    expect(normalizeServiceability(null)).toMatchObject({ serviceable: false })
  })
})

describe('normalizeTracking', () => {
  it('normalizes the track-by-awb shape', () => {
    const result = normalizeTracking({
      current_status: 'Delivered',
      courier_name: 'Bluedart',
      awb: 'X123',
      delivery_date: '2026-09-04 00:00:00',
      scans: [
        { date: '2026-09-04', time: '10:00:00', activity: 'Delivered', location: 'Mumbai' },
        {
          date: '2026-09-03',
          time: '18:00:00',
          activity: 'Out for delivery',
          location: 'Mumbai Hub',
        },
      ],
    })
    expect(result.status).toBe('Delivered')
    expect(result.courier).toBe('Bluedart')
    expect(result.awb).toBe('X123')
    expect(result.events).toHaveLength(2)
    expect(result.events[0]).toEqual({
      date: '2026-09-04 10:00:00',
      activity: 'Delivered',
      location: 'Mumbai',
    })
  })

  it('normalizes the track-by-order shape', () => {
    const result = normalizeTracking({
      order_id: 1,
      tracking_data: {
        courier_name: 'DTDC',
        etd: '2026-09-05 00:00:00',
        shipment_track: [{ current_status: 'In Transit', awb: 'A9' }],
        shipment_track_activities: [
          {
            date: '2026-09-02',
            time: '09:00:00',
            status: 'transit',
            activity: 'In transit',
            location: 'Pune',
          },
        ],
      },
    })
    expect(result.status).toBe('Shipped')
    expect(result.courier).toBe('DTDC')
    expect(result.awb).toBe('A9')
    expect(result.events[0].location).toBe('Pune')
  })

  it('returns null for error/empty payloads and falls back to Placed', () => {
    expect(normalizeTracking({ tracking_data: { error: 'No tracking data found.' } })).toBeNull()
    expect(normalizeTracking(null)).toBeNull()
    // No recognizable status and no activities → Placed
    const bare = normalizeTracking({ tracking_data: { shipment_track: [{}] } })
    expect(bare.status).toBe('Placed')
  })
})

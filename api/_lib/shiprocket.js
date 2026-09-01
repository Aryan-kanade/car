// ─────────────────────────────────────────────────────────────
// Shiprocket server-side helpers. Credentials stay server-side;
// the browser only ever sees normalized tracking results.
// Docs: https://apidocs.shiprocket.in (apiv2.shiprocket.in)
// ─────────────────────────────────────────────────────────────

import { getString, setString } from './db.js'

const BASE = 'https://apiv2.shiprocket.in/v1/external'

// The catalog has no weights/dimensions yet — sane defaults for
// 500 ml–1 L bottles until real values are added per product.
const DEFAULT_LENGTH_CM = 20
const DEFAULT_BREADTH_CM = 15
const DEFAULT_HEIGHT_CM = 10
const KG_PER_UNIT = 0.5
/** Surface-active washing preparations (car-care chemistry). */
const DEFAULT_HSN = '3402'

// Auth tokens live ~30 days; refresh well before that.
const TOKEN_CACHE_KEY = 'shiprocket:token'
const TOKEN_TTL_SECONDS = 10 * 24 * 60 * 60

export function shiprocketConfigured() {
  return Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD)
}

let cachedToken = null

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || !body.token) {
    throw new Error(body?.message || 'Shiprocket login failed.')
  }
  cachedToken = body.token
  // Best-effort cache so cold starts skip a login round-trip.
  try {
    await setString(TOKEN_CACHE_KEY, cachedToken, TOKEN_TTL_SECONDS)
  } catch {
    /* cache write is optional */
  }
  return cachedToken
}

async function getToken() {
  if (cachedToken) return cachedToken
  try {
    const stored = await getString(TOKEN_CACHE_KEY)
    if (stored) {
      cachedToken = stored
      return cachedToken
    }
  } catch {
    /* cache read is optional */
  }
  return login()
}

/** Authenticated Shiprocket call with one retry after token expiry. */
async function apiFetch(path, options = {}) {
  const call = async (token) =>
    fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
    })

  let res = await call(await getToken())
  if (res.status === 401) {
    cachedToken = null
    res = await call(await login())
  }
  return res
}

// ── Order creation ───────────────────────────────────────────

/** Split a full name into Shiprocket's required first/last fields. */
function splitName(fullName) {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
  return { first: parts[0] || 'Customer', last: parts.slice(1).join(' ') || '-' }
}

/**
 * Map a stored order record to Shiprocket's create-adhoc payload.
 * Pure — unit-tested in tests/shiprocket.test.js.
 */
export function buildAdhocPayload(record) {
  const { first, last } = splitName(record.customer.name)
  const totalUnits = record.items.reduce((sum, item) => sum + item.qty, 0)
  return {
    order_id: record.number,
    order_date: new Date(record.placedAt).toISOString().slice(0, 19).replace('T', ' '),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    billing_customer_name: first,
    billing_last_name: last,
    billing_address: record.customer.address,
    billing_address_2: record.customer.address2 ?? '',
    billing_city: record.customer.city,
    billing_pincode: record.customer.pincode,
    billing_state: record.customer.state,
    billing_country: 'India',
    billing_email: record.customer.email,
    billing_phone: record.customer.phone,
    shipping_is_billing: true,
    order_items: record.items.map((item) => ({
      name: item.name + (item.size ? ` (${item.size})` : ''),
      sku: item.id,
      units: item.qty,
      selling_price: item.unitPrice,
      hsn: DEFAULT_HSN,
    })),
    payment_method: record.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    sub_total: record.totals.total,
    length: DEFAULT_LENGTH_CM,
    breadth: DEFAULT_BREADTH_CM,
    height: DEFAULT_HEIGHT_CM,
    weight: Math.max(0.5, Math.round(KG_PER_UNIT * totalUnits * 100) / 100),
  }
}

/**
 * Push an order to Shiprocket. Never throws — fulfillment should not
 * block checkout; the error is recorded so it can be retried manually.
 */
export async function createShiprocketOrder(record) {
  try {
    const res = await apiFetch('/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify(buildAdhocPayload(record)),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        ok: false,
        error: body?.message || `Shiprocket order creation failed (${res.status}).`,
      }
    }
    return {
      ok: true,
      orderId: body.order_id ?? null,
      shipmentId: body.shipment_id ?? null,
      awb: body.awb_code ?? null,
      courier: body.courier_name ?? null,
      labelUrl: body.label_url ?? null,
      status: body.status ?? null,
    }
  } catch (err) {
    return { ok: false, error: err?.message || 'Shiprocket is unreachable.' }
  }
}

// ── Tracking ─────────────────────────────────────────────────

/**
 * Map any Shiprocket status string to our five timeline stages
 * (Placed / Packed / Shipped / Out for delivery / Delivered) or a
 * terminal label. Wording varies by courier, so match loosely.
 */
export function mapStatusToLabel(status) {
  const value = String(status ?? '').toLowerCase()
  if (!value) return null
  if (value.includes('cancel')) return 'Cancelled'
  if (value.includes('rto')) return 'Returned to origin'
  if (value.includes('lost')) return 'Lost'
  if (value.includes('deliver') && value.includes('out for')) return 'Out for delivery'
  if (value.includes('out for')) return 'Out for delivery'
  if (value.includes('deliver')) return 'Delivered'
  if (value.includes('transit')) return 'Shipped'
  if (
    value.includes('manifest') ||
    value.includes('pickup') ||
    value.includes('label') ||
    value.includes('packed')
  )
    return 'Packed'
  if (value.includes('pending') || value.includes('new') || value.includes('assigned'))
    return 'Placed'
  return null // unknown wording — caller falls back by activity presence
}

/**
 * Normalize Shiprocket tracking responses (track-by-order and
 * track-by-awb have different shapes). Pure — unit-tested.
 */
export function normalizeTracking(raw) {
  const data = raw?.tracking_data ?? raw
  if (!data || data.error) return null

  const awbTrack = data.current_status != null
  const activities = awbTrack
    ? Array.isArray(data.scans)
      ? data.scans
      : []
    : Array.isArray(data.shipment_track_activities)
      ? data.shipment_track_activities
      : []

  const rawStatus = awbTrack
    ? data.current_status
    : (data.shipment_track?.[0]?.current_status ?? null)

  const events = activities
    .map((scan) => ({
      date: [scan.date, scan.time].filter(Boolean).join(' '),
      activity: scan.activity || scan.status || 'Update',
      location: scan.location || '',
    }))
    .filter((event) => event.date || event.activity)

  const label = mapStatusToLabel(rawStatus) ?? (events.length > 0 ? 'Shipped' : 'Placed')

  return {
    status: label,
    rawStatus: rawStatus ?? null,
    courier: data.courier_name ?? null,
    awb: data.awb ?? data.shipment_track?.[0]?.awb ?? null,
    etd: data.etd ?? data.delivery_date ?? null,
    events,
  }
}

/** Fetch tracking for a stored order record (by AWB when we have one). */
export async function trackOrder(record) {
  const awb = record.shiprocket?.awb
  try {
    const res = awb
      ? await apiFetch(`/courier/track/awb/${encodeURIComponent(awb)}`)
      : await apiFetch(`/courier/track/order/${encodeURIComponent(record.number)}`)
    const body = await res.json().catch(() => ({}))
    if (!res.ok) return { ok: false, error: body?.message || 'Tracking unavailable.' }
    return { ok: true, tracking: normalizeTracking(body) }
  } catch (err) {
    return { ok: false, error: err?.message || 'Shiprocket is unreachable.' }
  }
}

// ── Serviceability (PIN-code check + EDD) ────────────────────

/** Parse a Shiprocket etd like '2026-09-04 17:23:34' → 'YYYY-MM-DD' or null. */
function etdDate(value) {
  const match = String(value ?? '').match(/(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : null
}

/**
 * Normalize a serviceability response to what the UI needs.
 * Pure — unit-tested in tests/shiprocket.test.js.
 */
export function normalizeServiceability(raw) {
  const companies = raw?.data?.available_courier_companies
  if (!Array.isArray(companies) || companies.length === 0) {
    return { serviceable: false, codAvailable: false, edd: null, courier: null, rate: null }
  }
  const codAvailable = companies.some((c) => Number(c.cod) === 1 || Number(c.cod_available) === 1)
  const rates = companies.map((c) => Number(c.rate)).filter((r) => Number.isFinite(r) && r > 0)
  const dates = companies
    .map((c) => etdDate(c.etd))
    .filter(Boolean)
    .sort()
  return {
    serviceable: true,
    codAvailable,
    edd: dates[0] ?? null,
    courier: companies[0].courier_name ?? null,
    rate: rates.length > 0 ? Math.min(...rates) : null,
  }
}

/**
 * Check PIN-code serviceability with a 6h Redis cache per PIN to
 * conserve Shiprocket quota. Returns null when Shiprocket or the
 * pickup PIN is not configured — callers must treat that as
 * "check unavailable", never as "not serviceable".
 */
export async function checkServiceability({ deliveryPincode, weight = 1 }) {
  if (!shiprocketConfigured()) return null
  const pickup = process.env.SHIPROCKET_PICKUP_PINCODE
  if (!/^\d{6}$/.test(pickup ?? '')) return null

  const cacheKey = `svc:${deliveryPincode}`
  try {
    const cached = await getString(cacheKey)
    if (cached) return JSON.parse(cached)
  } catch {
    /* cache read is optional */
  }

  const query = new URLSearchParams({
    pickup_postcode: pickup,
    delivery_postcode: deliveryPincode,
    weight: String(weight),
    cod: '1',
  })
  const result = await apiFetch(`/courier/serviceability/?${query}`)
  const body = await result.json().catch(() => ({}))
  const normalized = result.ok
    ? normalizeServiceability(body)
    : { serviceable: false, codAvailable: false, edd: null, courier: null, rate: null }

  try {
    await setString(cacheKey, JSON.stringify(normalized), 6 * 60 * 60)
  } catch {
    /* cache write is optional */
  }
  return normalized
}

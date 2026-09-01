// ─────────────────────────────────────────────────────────────
// Order storage: Upstash Redis (Vercel KV) via its REST API —
// plain fetch, no SDK dependency. Env vars UPSTASH_REDIS_REST_URL
// and UPSTASH_REDIS_REST_TOKEN are provisioned automatically when
// you attach a store in Vercel → Storage.
// ─────────────────────────────────────────────────────────────

const ORDER_TTL_SECONDS = 90 * 24 * 60 * 60 // keep paid orders 90 days

export function dbConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

async function command(cmd, ...args) {
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    body: JSON.stringify([cmd, ...args]),
  })
  if (!res.ok) throw new Error(`Redis ${cmd} failed: ${res.status}`)
  const body = await res.json()
  if (body.error) throw new Error(`Redis ${cmd} error: ${body.error}`)
  return body.result
}

export async function getString(key) {
  const value = await command('GET', key)
  return typeof value === 'string' ? value : null
}

export async function setString(key, value, ttlSeconds = ORDER_TTL_SECONDS) {
  return command('SET', key, value, 'EX', String(ttlSeconds))
}

export async function getJson(key) {
  const raw = await getString(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function setJson(key, value, ttlSeconds = ORDER_TTL_SECONDS) {
  return setString(key, JSON.stringify(value), ttlSeconds)
}

// ── Order records ────────────────────────────────────────────

const orderKey = (number) => `order:${number.toUpperCase()}`
/** Reverse lookup: razorpay order id → our order number (for webhooks). */
const razorpayKey = (razorpayOrderId) => `rpid:${razorpayOrderId}`
/** Sorted set of order numbers scored by placedAt — the admin list index. */
const ORDERS_INDEX_KEY = 'orders:index'
/** Rolling list of the last 100 Razorpay webhook events (admin debug tab). */
const WEBHOOK_LOG_KEY = 'webhooks:razorpay'
const WEBHOOK_LOG_MAX = 100

export async function getOrder(number) {
  return getJson(orderKey(number))
}

export async function saveOrderRecord(record) {
  const result = await setJson(orderKey(record.number), record)
  // Best-effort index + cleanup of expired members (records TTL at 90 days).
  try {
    await command('ZADD', ORDERS_INDEX_KEY, String(record.placedAt), record.number)
    await command(
      'ZREMRANGEBYSCORE',
      ORDERS_INDEX_KEY,
      '-inf',
      String(record.placedAt - ORDER_TTL_SECONDS * 1000)
    )
  } catch {
    /* index is optional */
  }
  return result
}

/** Newest-first page of order numbers from the index. */
export async function listOrderNumbers({ limit = 50, offset = 0 } = {}) {
  const page = await command(
    'ZREVRANGE',
    ORDERS_INDEX_KEY,
    String(offset),
    String(offset + limit - 1)
  )
  return Array.isArray(page) ? page : []
}

export async function countOrders() {
  const count = await command('ZCARD', ORDERS_INDEX_KEY)
  return typeof count === 'number' ? count : 0
}

export async function getOrderByRazorpayId(razorpayOrderId) {
  const number = await getString(razorpayKey(razorpayOrderId))
  return number ? getOrder(number) : null
}

export async function rememberRazorpayOrder(razorpayOrderId, number) {
  return setString(razorpayKey(razorpayOrderId), number)
}

// ── Idempotency (create-order retries) ───────────────────────

const idemKey = (key) => `idem:${key}`

/** Store the create-order response for an idempotency key. */
export async function saveIdempotent(key, payload) {
  return setJson(idemKey(key), payload, 10 * 60)
}

export async function getIdempotent(key) {
  return getJson(idemKey(key))
}

// ── COD guard (phone throttle) ───────────────────────────────

const codKey = (phone) => `cod:${phone}`

/** Count and register a COD attempt for a phone number (24h window). */
export async function countCodAttempt(phone) {
  const key = codKey(phone)
  const count = await command('INCR', key)
  if (count === 1) await command('EXPIRE', key, String(24 * 60 * 60))
  return count
}

// ── Webhook event log (admin debug) ──────────────────────────

export async function logWebhookEvent(entry) {
  try {
    await command('RPUSH', WEBHOOK_LOG_KEY, JSON.stringify({ at: Date.now(), ...entry }))
    await command('LTRIM', WEBHOOK_LOG_KEY, `-${WEBHOOK_LOG_MAX}`, '-1')
  } catch {
    /* logging is optional */
  }
}

export async function readWebhookLog() {
  const list = await command('LRANGE', WEBHOOK_LOG_KEY, '0', '-1')
  return (Array.isArray(list) ? list : [])
    .map((raw) => {
      try {
        return JSON.parse(raw)
      } catch {
        return null
      }
    })
    .filter(Boolean)
    .reverse()
}

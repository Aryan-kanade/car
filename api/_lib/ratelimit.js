// ─────────────────────────────────────────────────────────────
// Fixed-window rate limiting on Upstash Redis (INCR + EXPIRE).
// Works across serverless instances; degrades to allow-all when
// the DB is unavailable so checkout never breaks because of the
// guard itself.
// ─────────────────────────────────────────────────────────────

import { dbConfigured } from './db.js'
import { fail } from './http.js'

async function redisCommand(cmd, ...args) {
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
    body: JSON.stringify([cmd, ...args]),
  })
  if (!res.ok) throw new Error(`redis ${cmd} ${res.status}`)
  const body = await res.json()
  if (body.error) throw new Error(body.error)
  return body.result
}

/** Best-effort client IP behind Vercel's proxy. */
export function clientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress ?? 'unknown'
}

/** True when the request is over budget. Never throws. */
export async function rateLimited(req, bucket, limit, windowSeconds) {
  if (!dbConfigured()) return false
  const key = `rl:${bucket}:${clientIp(req)}`
  try {
    const count = await redisCommand('INCR', key)
    if (count === 1) await redisCommand('EXPIRE', key, String(windowSeconds))
    return count > limit
  } catch {
    return false // guard must never take checkout down
  }
}

/** Convenience presets used across the endpoints. */
export const LIMITS = {
  createOrder: { bucket: 'create', limit: 10, window: 60 },
  verifyPayment: { bucket: 'verify', limit: 20, window: 60 },
  track: { bucket: 'track', limit: 30, window: 60 },
  serviceability: { bucket: 'svc', limit: 20, window: 60 },
  resume: { bucket: 'resume', limit: 15, window: 60 },
  survey: { bucket: 'survey', limit: 15, window: 60 },
  admin: { bucket: 'admin', limit: 60, window: 60 },
}

export function tooMany(res) {
  return fail(res, 429, 'Too many requests — wait a moment and try again.')
}

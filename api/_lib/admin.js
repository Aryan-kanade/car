// ─────────────────────────────────────────────────────────────
// Admin request guard — ADMIN_TOKEN env, constant-time compare.
// Accepts the token via ?token= or the x-admin-token header.
// ─────────────────────────────────────────────────────────────

import crypto from 'node:crypto'
import { fail } from './http.js'

export function adminTokenConfigured() {
  return Boolean(process.env.ADMIN_TOKEN)
}

function extractToken(req) {
  const header = req.headers?.['x-admin-token']
  if (typeof header === 'string' && header) return header
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`)
  return url.searchParams.get('token') ?? ''
}

/** Sends a 401/missing-config response and returns true when access is denied. */
export function denyAdmin(req, res) {
  if (!adminTokenConfigured()) {
    return (fail(res, 503, 'Admin access is not configured. Set ADMIN_TOKEN.'), true)
  }
  const given = extractToken(req)
  const expected = process.env.ADMIN_TOKEN
  const a = Buffer.from(String(given))
  const b = Buffer.from(expected)
  const match = a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b)
  return match ? false : (fail(res, 401, 'Invalid admin token.'), true)
}

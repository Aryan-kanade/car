// ─────────────────────────────────────────────────────────────
// POST /api/survey — post-delivery micro-survey (😍 🙂 😕).
// Body: { number, email, rating: 1..3 }. Stored on the order
// record; visible in the admin panel.
// ─────────────────────────────────────────────────────────────

import { fail, json, readJson } from './_lib/http.js'
import { dbConfigured, getOrder, saveOrderRecord } from './_lib/db.js'
import { LIMITS, rateLimited, tooMany } from './_lib/ratelimit.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'Use POST.')
  if (await rateLimited(req, LIMITS.survey.bucket, LIMITS.survey.limit, LIMITS.survey.window))
    return tooMany(res)

  const body = await readJson(req)
  const number = String(body?.number ?? '').trim()
  const email = String(body?.email ?? '').trim()
  const rating = Number(body?.rating)

  if (!/^KMK-\d{6}$/i.test(number) || !email) {
    return fail(res, 400, 'Provide an order number and email.')
  }
  if (![1, 2, 3].includes(rating)) return fail(res, 400, 'rating must be 1, 2 or 3.')
  if (!dbConfigured()) return fail(res, 503, 'Order storage is not configured.')

  const record = await getOrder(number)
  if (!record || record.customer.email.toLowerCase() !== email.toLowerCase()) {
    return fail(res, 404, 'not-found')
  }

  record.survey = { rating, at: Date.now() }
  await saveOrderRecord(record)
  return json(res, 200, { ok: true, rating })
}

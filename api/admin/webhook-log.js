// ─────────────────────────────────────────────────────────────
// GET /api/admin/webhook-log?token= — last 100 Razorpay webhook
// events (debug tab): event name, matched order, outcome, time.
// ─────────────────────────────────────────────────────────────

import { fail, json } from '../_lib/http.js'
import { denyAdmin } from '../_lib/admin.js'
import { LIMITS, rateLimited, tooMany } from '../_lib/ratelimit.js'
import { dbConfigured, readWebhookLog } from '../_lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return fail(res, 405, 'Use GET.')
  if (denyAdmin(req, res)) return
  if (await rateLimited(req, LIMITS.admin.bucket, LIMITS.admin.limit, LIMITS.admin.window))
    return tooMany(res)
  if (!dbConfigured()) return fail(res, 503, 'Order storage is not configured.')

  return json(res, 200, { events: await readWebhookLog() })
}

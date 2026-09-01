// ─────────────────────────────────────────────────────────────
// GET /api/serviceability?pincode=560001
// PIN-code delivery check with COD availability and EDD, cached
// 6h in Redis. When Shiprocket/pickup PIN is not configured the
// response says so with available:false — checkout proceeds
// without the check, never blocks.
// ─────────────────────────────────────────────────────────────

import { fail, json } from './_lib/http.js'
import { LIMITS, rateLimited, tooMany } from './_lib/ratelimit.js'
import { checkServiceability } from './_lib/shiprocket.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return fail(res, 405, 'Use GET.')
  if (
    await rateLimited(
      req,
      LIMITS.serviceability.bucket,
      LIMITS.serviceability.limit,
      LIMITS.serviceability.window
    )
  )
    return tooMany(res)

  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`)
  const pincode = url.searchParams.get('pincode')?.trim() ?? ''
  if (!/^\d{6}$/.test(pincode)) return fail(res, 400, 'Provide a 6-digit PIN code.')

  const result = await checkServiceability({ deliveryPincode: pincode })
  if (result == null) {
    return json(res, 200, { available: false, reason: 'not-configured' })
  }
  return json(res, 200, { available: true, ...result })
}

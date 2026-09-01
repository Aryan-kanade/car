// ─────────────────────────────────────────────────────────────
// GET /api/health — one-glance answer to "why doesn't checkout
// work here?": which integrations have their env vars set.
// Booleans only; never secrets.
// ─────────────────────────────────────────────────────────────

import { json } from './_lib/http.js'
import { dbConfigured } from './_lib/db.js'
import { razorpayConfigured } from './_lib/razorpay.js'
import { shiprocketConfigured } from './_lib/shiprocket.js'

export default function handler(req, res) {
  return json(res, 200, {
    ok: true,
    integrations: {
      database: dbConfigured(),
      razorpay: razorpayConfigured(),
      shiprocket: shiprocketConfigured(),
      shiprocketPickupPin: /^\d{6}$/.test(process.env.SHIPROCKET_PICKUP_PINCODE ?? ''),
    },
    time: new Date().toISOString(),
  })
}

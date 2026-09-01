// ─────────────────────────────────────────────────────────────
// POST /api/admin/repush-shipment { token, number }
// Retry Shiprocket order creation for a paid/COD order whose
// shipment failed to create (courier outage, bad payload…).
// ─────────────────────────────────────────────────────────────

import { fail, json, readJson } from '../_lib/http.js'
import { denyAdmin } from '../_lib/admin.js'
import { dbConfigured, getOrder, saveOrderRecord } from '../_lib/db.js'
import { createShiprocketOrder, shiprocketConfigured } from '../_lib/shiprocket.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'Use POST.')
  if (denyAdmin(req, res)) return
  if (!dbConfigured()) return fail(res, 503, 'Order storage is not configured.')
  if (!shiprocketConfigured()) return fail(res, 503, 'Shiprocket is not configured.')

  const body = await readJson(req)
  const number = String(body?.number ?? '').trim()
  if (!/^KMK-\d{6}$/i.test(number)) return fail(res, 400, 'Provide an order number.')

  const record = await getOrder(number)
  if (!record) return fail(res, 404, 'Order not found.')
  if (record.status !== 'paid' && record.status !== 'cod_placed') {
    return fail(res, 422, 'Only paid or COD orders can be shipped.')
  }
  if (record.shippingMethod === 'pickup') {
    return fail(res, 422, 'Pickup order — collected at the studio, nothing to dispatch.')
  }

  record.shiprocket = await createShiprocketOrder(record)
  await saveOrderRecord(record)

  return json(res, 200, {
    number: record.number,
    shiprocket: record.shiprocket,
  })
}

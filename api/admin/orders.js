// ─────────────────────────────────────────────────────────────
// GET /api/admin/orders?token=&status=&q=&limit=&offset=&csv=1
// Merchant order list from the Redis index + KPI aggregates.
// ?csv=1 streams a CSV of the current page (no pagination cap so
// the owner can export everything).
// ─────────────────────────────────────────────────────────────

import { fail, json } from '../_lib/http.js'
import { denyAdmin } from '../_lib/admin.js'
import { LIMITS, rateLimited, tooMany } from '../_lib/ratelimit.js'
import { countOrders, getOrder, listOrderNumbers } from '../_lib/db.js'

function toRow(record) {
  return {
    number: record.number,
    placedAt: record.placedAt,
    status: record.status,
    paymentMethod: record.paymentMethod,
    name: record.customer?.name ?? '',
    email: record.customer?.email ?? '',
    phone: record.customer?.phone ?? '',
    city: record.customer?.city ?? '',
    pincode: record.customer?.pincode ?? '',
    total: record.totals?.total ?? 0,
    items: record.items?.length ?? 0,
    razorpayPaymentId: record.razorpayPaymentId ?? null,
    awb: record.shiprocket?.awb ?? null,
    shipmentOk: record.shiprocket?.ok ?? null,
    shipmentError: record.shiprocket?.error ?? null,
    gift: record.gift?.note ? true : false,
    survey: record.survey?.rating ?? null,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return fail(res, 405, 'Use GET.')
  if (denyAdmin(req, res)) return
  if (await rateLimited(req, LIMITS.admin.bucket, LIMITS.admin.limit, LIMITS.admin.window))
    return tooMany(res)

  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`)
  const status = url.searchParams.get('status') ?? ''
  const query = (url.searchParams.get('q') ?? '').trim().toLowerCase()
  const csv = url.searchParams.get('csv') === '1'
  const limit = csv ? 500 : Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 50))
  const offset = csv ? 0 : Math.max(0, Number(url.searchParams.get('offset')) || 0)

  // Walk the index newest-first, fetch records, filter in memory
  // (index sizes here are small; 500/page covers exports).
  const numbers = await listOrderNumbers({ limit: csv ? 500 : limit + offset + 50, offset: 0 })
  const records = []
  for (const number of numbers) {
    const record = await getOrder(number)
    if (!record) continue
    if (status && record.status !== status) continue
    if (
      query &&
      !`${record.number} ${record.customer?.email ?? ''} ${record.customer?.phone ?? ''} ${record.customer?.name ?? ''}`
        .toLowerCase()
        .includes(query)
    )
      continue
    records.push(record)
    if (!csv && records.length >= limit + offset) break
  }

  if (csv) {
    const header =
      'order,date,status,payment,name,email,phone,city,pincode,total,items,razorpay_ref,awb,survey'
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const lines = records.map((r) =>
      [
        r.number,
        new Date(r.placedAt).toISOString(),
        r.status,
        r.paymentMethod,
        r.customer?.name,
        r.customer?.email,
        r.customer?.phone,
        r.customer?.city,
        r.customer?.pincode,
        r.totals?.total,
        r.items?.length,
        r.razorpayPaymentId ?? '',
        r.shiprocket?.awb ?? '',
        r.survey?.rating ?? '',
      ]
        .map(escape)
        .join(',')
    )
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="kmkiramyki-orders.csv"`)
    return res.end([header, ...lines].join('\n'))
  }

  const page = records.slice(offset, offset + limit)

  // KPIs across everything we walked
  const paidRecords = records.filter((r) => r.status === 'paid' || r.status === 'cod_placed')
  const revenue = paidRecords.reduce((sum, r) => sum + (r.totals?.total ?? 0), 0)
  const online = paidRecords.filter((r) => r.paymentMethod === 'online')
  const cod = paidRecords.filter((r) => r.paymentMethod === 'cod')
  const pending = records.filter((r) => r.status === 'payment_pending')
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const revenueSince = (since) =>
    paidRecords
      .filter((r) => r.placedAt >= since)
      .reduce((sum, r) => sum + (r.totals?.total ?? 0), 0)

  const kpis = {
    orders: records.length,
    revenue,
    aov: paidRecords.length > 0 ? Math.round(revenue / paidRecords.length) : 0,
    prepaidShare:
      paidRecords.length > 0 ? Math.round((online.length / paidRecords.length) * 100) : 0,
    codShare: paidRecords.length > 0 ? Math.round((cod.length / paidRecords.length) * 100) : 0,
    pendingPayments: pending.length,
    paymentSuccessRate:
      online.length + pending.length > 0
        ? Math.round((online.length / (online.length + pending.length)) * 100)
        : 100,
    revenue24h: revenueSince(dayAgo),
    revenue7d: revenueSince(weekAgo),
    revenue30d: revenueSince(monthAgo),
  }

  // Pending-payment queue with copyable resume links (emailed manually)
  const pendingQueue = pending.slice(0, 20).map((r) => ({
    number: r.number,
    email: r.customer?.email ?? '',
    phone: r.customer?.phone ?? '',
    name: r.customer?.name ?? '',
    total: r.totals?.total ?? 0,
    placedAt: r.placedAt,
    razorpayOrderId: r.razorpayOrderId,
  }))

  return json(res, 200, {
    orders: page.map(toRow),
    total: records.length,
    offset,
    limit,
    indexed: await countOrders(),
    kpis,
    pendingQueue,
  })
}

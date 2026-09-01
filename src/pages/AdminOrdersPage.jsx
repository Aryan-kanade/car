import { useCallback, useEffect, useMemo, useState } from 'react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowClockwise'
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/csr/DownloadSimple'
import { CopyIcon } from '@phosphor-icons/react/dist/csr/Copy'
import PageHeader from '../components/PageHeader'
import { formatPrice, products } from '../data/catalog'
import { usePageMeta } from '../hooks/usePageMeta'
import { toast } from '../components/ToastStack'

const SESSION_KEY = 'kmkiramyki-admin-token'
const LOW_STOCK_THRESHOLD = 10

const STATUS_STYLES = {
  paid: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
  cod_placed: 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200',
  payment_pending: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
  failed: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
}

const STATUS_LABELS = {
  paid: 'Paid',
  cod_placed: 'COD',
  payment_pending: 'Pending',
  failed: 'Failed',
}

const inputClasses =
  'rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-white focus:outline-none'

function KpiCard({ label, value }) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-4">
      <p className="text-[11px] font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-400 uppercase">
        {label}
      </p>
      <p className="font-display mt-1.5 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  )
}

/** Merchant order dashboard — token-protected (/api/admin/orders). */
export default function AdminOrdersPage() {
  usePageMeta('Admin · Orders', 'KMKIRAMYKI order dashboard.')
  const [token, setToken] = useState(() => sessionStorage.getItem(SESSION_KEY) ?? '')
  const [authed, setAuthed] = useState(() => Boolean(sessionStorage.getItem(SESSION_KEY)))
  const [data, setData] = useState(null)
  const [webhooks, setWebhooks] = useState(null)
  const [tab, setTab] = useState('orders')
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const lowStock = useMemo(
    () => products.filter((p) => typeof p.stock === 'number' && p.stock <= LOW_STOCK_THRESHOLD),
    []
  )

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!token) return
      if (!silent) setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({ token })
        if (status) params.set('status', status)
        if (query.trim()) params.set('q', query.trim())
        const res = await fetch(`/api/admin/orders?${params}`)
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body.error || `Failed (${res.status}).`)
        setData(body)
        setAuthed(true)
        sessionStorage.setItem(SESSION_KEY, token)
      } catch (err) {
        setAuthed(false)
        sessionStorage.removeItem(SESSION_KEY)
        setError(err?.message || 'Could not load orders.')
      } finally {
        setLoading(false)
      }
    },
    [token, status, query]
  )

  useEffect(() => {
    if (!authed || tab !== 'orders') return
    // Deferred so the loading state isn't set synchronously inside the effect
    const pending = Promise.resolve().then(() => load())
    return () => {
      pending.catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    if (authed && tab === 'webhooks' && webhooks == null) {
      fetch(`/api/admin/webhook-log?token=${encodeURIComponent(token)}`)
        .then((res) => (res.ok ? res.json() : { events: [] }))
        .then((body) => setWebhooks(body.events ?? []))
        .catch(() => setWebhooks([]))
    }
  }, [authed, tab, token, webhooks])

  const repush = async (number) => {
    try {
      const res = await fetch('/api/admin/repush-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, number }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'Repush failed.')
      toast(
        body.shiprocket?.ok
          ? `Shipment created for ${number}`
          : `Still failing: ${body.shiprocket?.error}`
      )
      load({ silent: true })
    } catch (err) {
      toast(err?.message || 'Repush failed.')
    }
  }

  const copyPaymentLink = async (item) => {
    const url = `${window.location.origin}/order-lookup?number=${item.number}`
    try {
      await navigator.clipboard.writeText(
        `Complete your KMKIRAMYKI payment for ${item.number} (₹${item.total}): ${url}`
      )
      toast('Payment link copied — send it to the customer.')
    } catch {
      toast(url)
    }
  }

  if (!authed) {
    return (
      <>
        <PageHeader breadcrumb={[{ label: 'Admin' }]} title="Order Dashboard" />
        <div className="mx-auto max-w-md px-6 py-20">
          <form
            onSubmit={(event) => {
              event.preventDefault()
              load()
            }}
            className="space-y-4"
          >
            <label
              htmlFor="admin-token"
              className="block text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase"
            >
              Admin token
            </label>
            <input
              id="admin-token"
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className={`${inputClasses} w-full`}
              placeholder="ADMIN_TOKEN"
              autoComplete="off"
            />
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full cursor-pointer bg-zinc-900 dark:bg-white py-3.5 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Unlock
            </button>
            <p className="text-xs leading-relaxed text-zinc-800 dark:text-zinc-400">
              The token is the ADMIN_TOKEN environment variable. It stays in this browser session
              only.
            </p>
          </form>
        </div>
      </>
    )
  }

  const kpis = data?.kpis
  const orders = data?.orders ?? []

  return (
    <>
      <PageHeader breadcrumb={[{ label: 'Admin' }]} title="Order Dashboard" />
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {['orders', 'pending', 'webhooks', 'stock'].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold tracking-[0.15em] uppercase transition-colors ${
                tab === value
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                  : 'border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-white'
              }`}
            >
              {value === 'orders'
                ? 'Orders'
                : value === 'pending'
                  ? 'Pending payments'
                  : value === 'webhooks'
                    ? 'Webhook log'
                    : 'Low stock'}
            </button>
          ))}
          <a
            href={`/api/admin/orders?token=${encodeURIComponent(token)}&csv=1`}
            className="ml-auto inline-flex items-center gap-2 rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-xs font-semibold tracking-[0.15em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
          >
            <DownloadSimpleIcon size={13} weight="light" aria-hidden="true" />
            Export CSV
          </a>
        </div>

        {tab === 'orders' && (
          <>
            {/* KPIs */}
            {kpis && (
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <KpiCard label="Revenue (30d)" value={formatPrice(kpis.revenue30d)} />
                <KpiCard label="Revenue (7d)" value={formatPrice(kpis.revenue7d)} />
                <KpiCard label="Orders" value={kpis.orders} />
                <KpiCard label="Avg order" value={formatPrice(kpis.aov)} />
                <KpiCard
                  label="Prepaid / COD"
                  value={`${kpis.prepaidShare}% / ${kpis.codShare}%`}
                />
                <KpiCard label="Pay success" value={`${kpis.paymentSuccessRate}%`} />
              </div>
            )}

            {/* Filters */}
            <div className="mt-6 flex flex-wrap gap-2">
              <div className="relative">
                <MagnifyingGlassIcon
                  size={14}
                  weight="light"
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-800 dark:text-zinc-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && load()}
                  placeholder="Search number, email, phone…"
                  className={`${inputClasses} w-72 pl-9`}
                  aria-label="Search orders"
                />
              </div>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={`${inputClasses} cursor-pointer`}
                aria-label="Filter by status"
              >
                <option value="">All statuses</option>
                <option value="paid">Paid</option>
                <option value="cod_placed">COD</option>
                <option value="payment_pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <button
                type="button"
                onClick={() => load()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-xs font-semibold tracking-[0.15em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
              >
                <ArrowClockwiseIcon size={13} weight="light" aria-hidden="true" />
                {loading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full min-w-[880px] text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-[11px] tracking-[0.15em] text-zinc-800 dark:text-zinc-400 uppercase">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Shipment</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {orders.map((order) => (
                    <tr key={order.number} className="align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {order.number}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-800 dark:text-zinc-400">
                          {new Date(order.placedAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-zinc-800 dark:text-zinc-200">{order.name}</p>
                        <p className="mt-0.5 text-xs text-zinc-800 dark:text-zinc-400">
                          {order.email}
                        </p>
                        <p className="text-xs text-zinc-800 dark:text-zinc-400">
                          {order.phone} · {order.city} {order.pincode}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${STATUS_STYLES[order.status] ?? ''}`}
                        >
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                        {order.gift && (
                          <p className="mt-1 text-xs text-zinc-800 dark:text-zinc-400">🎁 gift</p>
                        )}
                        {order.survey != null && (
                          <p className="mt-1 text-xs text-zinc-800 dark:text-zinc-400">
                            {order.survey === 3 ? '😍' : order.survey === 2 ? '🙂' : '😕'}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-800 dark:text-zinc-400">
                        {order.awb ? (
                          <span className="text-zinc-800 dark:text-zinc-200">AWB {order.awb}</span>
                        ) : order.shipmentOk === false ? (
                          <button
                            type="button"
                            onClick={() => repush(order.number)}
                            className="cursor-pointer text-xs font-semibold tracking-wide text-amber-800 dark:text-amber-400 uppercase hover:underline"
                          >
                            Retry shipment →
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs">
                        {order.shipmentError && (
                          <span
                            className="text-red-600 dark:text-red-400"
                            title={order.shipmentError}
                          >
                            ⚠ courier error
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-zinc-800 dark:text-zinc-400"
                      >
                        No orders match{status ? ` (${STATUS_LABELS[status] ?? status})` : ''}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && (
              <p className="mt-3 text-xs text-zinc-800 dark:text-zinc-400">
                Showing {orders.length} of {data.total} records ({data.indexed} indexed).
              </p>
            )}
          </>
        )}

        {tab === 'pending' && (
          <div className="mt-6 space-y-3">
            {(data?.pendingQueue ?? []).map((item) => (
              <div
                key={item.number}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {item.number} · {formatPrice(item.total)}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-800 dark:text-zinc-300">
                    {item.name} · {item.email} · {item.phone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyPaymentLink(item)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-xs font-semibold tracking-[0.15em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
                >
                  <CopyIcon size={13} weight="light" aria-hidden="true" />
                  Copy payment link
                </button>
              </div>
            ))}
            {(data?.pendingQueue ?? []).length === 0 && (
              <p className="mt-6 text-sm text-zinc-800 dark:text-zinc-400">
                No pending payments — every checkout completed. ✨
              </p>
            )}
          </div>
        )}

        {tab === 'webhooks' && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-[11px] tracking-[0.15em] text-zinc-800 dark:text-zinc-400 uppercase">
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Razorpay ref</th>
                  <th className="px-4 py-3">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {(webhooks ?? []).map((event, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2.5 text-xs text-zinc-800 dark:text-zinc-400">
                      {new Date(event.at).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-800 dark:text-zinc-200">{event.event}</td>
                    <td className="px-4 py-2.5 text-xs text-zinc-800 dark:text-zinc-400">
                      {event.order ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-800 dark:text-zinc-300">
                      {event.outcome}
                    </td>
                  </tr>
                ))}
                {(webhooks ?? []).length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-zinc-800 dark:text-zinc-400"
                    >
                      No webhook events yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'stock' && (
          <div className="mt-6 space-y-2">
            {lowStock.length === 0 && (
              <p className="text-sm text-zinc-800 dark:text-zinc-400">
                Nothing under {LOW_STOCK_THRESHOLD} units — stock looks healthy.
              </p>
            )}
            {lowStock.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 px-5 py-3.5"
              >
                <span className="text-sm text-zinc-800 dark:text-zinc-200">{product.name}</span>
                <span
                  className={`text-sm font-semibold ${product.stock <= 3 ? 'text-red-600 dark:text-red-400' : 'text-amber-800 dark:text-amber-400'}`}
                >
                  {product.stock} left
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { TruckIcon } from '@phosphor-icons/react/dist/csr/Truck'
import { WhatsappLogoIcon } from '@phosphor-icons/react/dist/csr/WhatsappLogo'
import { ShareIcon } from '@phosphor-icons/react/dist/csr/Share'
import PageHeader from '../components/PageHeader'
import OrderTimeline from '../components/OrderTimeline'
import { formatPrice } from '../data/catalog'
import { usePageMeta } from '../hooks/usePageMeta'
import { findOrder, getOrderStatus } from '../utils/orders'
import { resumePendingPayment } from '../utils/resumePayment'
import { dayLabel } from '../utils/delivery'

const inputClasses =
  'w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600 dark:placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none'

const SURVEY_OPTIONS = [
  { rating: 3, emoji: '😍', label: 'Loved it' },
  { rating: 2, emoji: '🙂', label: 'It was fine' },
  { rating: 1, emoji: '😕', label: 'Not great' },
]

/** Order lookup — live tracking, payment recovery, share links. */
export default function OrderLookupPage() {
  const [params] = useSearchParams()
  const [orderId, setOrderId] = useState(() => params.get('number') ?? '')
  const [email, setEmail] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState(null) // 'not-found' | normalized result
  const [notice, setNotice] = useState('')
  const [paying, setPaying] = useState(false)
  const [surveySent, setSurveySent] = useState(null)
  const tokenRef = useRef(params.get('t'))
  const emailRef = useRef('')

  usePageMeta('Order Lookup', 'Track your KMKIRAMYKI order status and delivery.')

  /** Normalize a local (device) order to the same shape as /api/track. */
  const fromLocalOrder = (order) => {
    const status = getOrderStatus(order.placedAt)
    return {
      number: order.number,
      placedAt: order.placedAt,
      items: order.items,
      discount: order.discount,
      promoCode: order.promoCode,
      total: order.total,
      statusLabel: status.label,
      statusDetail: status.detail,
      events: null,
      courier: null,
      etd: null,
      awb: order.awb ?? null,
      paymentPending: order.paymentMethod === 'online' && !order.razorpayPaymentId,
      email: order.email,
      shareToken: null,
      surveyRating: order.survey ?? null,
    }
  }

  const applyServerResult = (data) => {
    setSurveySent(data.surveyRating ?? null)
    setResult({
      number: data.order.number,
      placedAt: data.order.placedAt,
      items: data.order.items,
      discount: data.order.discount,
      promoCode: data.order.promoCode,
      total: data.order.total,
      statusLabel: data.status.label,
      statusDetail: data.status.detail,
      events: data.tracking?.events ?? null,
      courier: data.tracking?.courier ?? null,
      etd: data.tracking?.etd ?? null,
      awb: data.tracking?.awb ?? null,
      paymentPending: data.paymentPending === true,
      email: emailRef.current,
      shareToken: data.shareToken,
      surveyRating: data.surveyRating ?? null,
    })
  }

  const runSearch = useCallback(
    async ({ silent = false } = {}) => {
      const number = orderId.trim()
      const mail = email.trim()
      const token = tokenRef.current
      if (!/^KMK-\d{6}$/i.test(number) || (!mail && !token)) return
      if (!silent) setSearching(true)
      try {
        const query = new URLSearchParams({ number })
        if (token) query.set('t', token)
        else query.set('email', mail)
        const res = await fetch(`/api/track?${query}`)
        if (res.ok) {
          const data = await res.json()
          if (data.found) {
            applyServerResult(data)
            return
          }
        }
        if (silent) return // silent refresh: keep showing what we have
        const local = findOrder(number, mail)
        setResult(local ? fromLocalOrder(local) : 'not-found')
      } catch {
        if (silent) return
        const local = findOrder(number, mail)
        setResult(local ? fromLocalOrder(local) : 'not-found')
      } finally {
        setSearching(false)
      }
    },
    [orderId, email]
  )

  const submit = (event) => {
    event.preventDefault()
    tokenRef.current = null // explicit search always uses email
    emailRef.current = email.trim()
    runSearch()
  }

  // Shared link (?number=KMK-…&t=token) → auto-load once
  useEffect(() => {
    if (tokenRef.current && orderId) {
      runSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Live tracking: refresh every 60s while an active order is shown
  useEffect(() => {
    if (!result || result === 'not-found' || result.statusLabel === 'Delivered') return
    const timer = setInterval(() => runSearch({ silent: true }), 60 * 1000)
    return () => clearInterval(timer)
  }, [result, runSearch])

  const payNow = async () => {
    if (!result || result === 'not-found' || paying) return
    setPaying(true)
    setNotice('')
    try {
      const outcome = await resumePendingPayment({ number: result.number, email: result.email })
      if (outcome.ok) {
        setNotice('Payment received — your order is confirmed and shipping soon.')
        runSearch({ silent: true })
      } else if (outcome.dismissed) {
        setNotice('Payment window closed — you can try again any time.')
      } else if (outcome.alreadyPaid) {
        setNotice('This order is already paid.')
        runSearch({ silent: true })
      }
    } catch (err) {
      setNotice(err?.message || 'Could not resume payment.')
    } finally {
      setPaying(false)
    }
  }

  const shareUrl =
    result && result !== 'not-found' && result.shareToken
      ? `${window.location.origin}/order-lookup?number=${result.number}&t=${result.shareToken}`
      : null

  const copyShare = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setNotice('Tracking link copied.')
    } catch {
      setNotice(`Tracking link: ${shareUrl}`)
    }
  }

  const sendSurvey = async (rating) => {
    if (!result || result === 'not-found' || !result.email) return
    setSurveySent(rating) // optimistic
    try {
      await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: result.number, email: result.email, rating }),
      })
      setNotice('Thanks for the feedback!')
    } catch {
      /* optimistic value stands; server retry on next lookup */
    }
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Order Lookup' }]}
        title="Order Lookup"
        subtext="Enter your order number and the email you used at checkout to see status and tracking."
      />

      <div className="mx-auto max-w-xl px-6 py-14 md:py-20">
        <form onSubmit={submit} className="no-print space-y-5">
          <div>
            <label
              htmlFor="order-id"
              className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase"
            >
              Order number
            </label>
            <input
              id="order-id"
              name="order-id"
              type="text"
              required
              autoComplete="off"
              placeholder="KMK-000000"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label
              htmlFor="order-email"
              className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase"
            >
              Email address
            </label>
            <input
              id="order-email"
              name="order-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="flex w-full cursor-pointer items-center justify-center gap-3 bg-zinc-900 dark:bg-white py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MagnifyingGlassIcon size={16} weight="light" />
            {searching ? 'Searching…' : 'Find my order'}
          </button>
        </form>

        {notice && (
          <p
            role="status"
            className="no-print mt-5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200"
          >
            {notice}
          </p>
        )}

        {result === 'not-found' && (
          <div
            role="status"
            className="mt-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6"
          >
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              No order found for {orderId || 'that number'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
              Double-check the order number and the email you used at checkout. Recent orders placed
              on this device are also searchable while offline.
            </p>
          </div>
        )}

        {result && result !== 'not-found' && (
          <div
            role="status"
            className="mt-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-7"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl font-bold tracking-[0.08em] text-zinc-900 dark:text-zinc-100">
                  {result.number}
                </p>
                <p className="mt-1 text-xs text-zinc-800 dark:text-zinc-400">
                  Placed{' '}
                  {new Date(result.placedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  {result.courier ? ` · ${result.courier}` : ''}
                  {result.awb ? ` · AWB ${result.awb}` : ''}
                  {result.etd ? ` · expected ${dayLabel(new Date(`${result.etd}T00:00:00Z`))}` : ''}
                </p>
              </div>
              <span className="flex items-center gap-2 rounded-full border border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white px-3.5 py-1.5 text-[11px] font-semibold tracking-wider text-white dark:text-zinc-900 uppercase">
                <TruckIcon size={14} weight="light" aria-hidden="true" />
                {result.statusLabel}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
              {result.statusDetail}
            </p>

            {/* Payment recovery */}
            {result.paymentPending && (
              <div className="no-print mt-5 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-4 py-3.5">
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  Payment for this order is still pending.
                </p>
                <button
                  type="button"
                  onClick={payNow}
                  disabled={paying}
                  className="mt-2.5 cursor-pointer bg-zinc-900 dark:bg-white px-5 py-2.5 text-xs font-semibold tracking-[0.15em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paying ? 'Opening Razorpay…' : `Pay now · ${formatPrice(result.total)}`}
                </button>
              </div>
            )}

            <OrderTimeline
              placedAt={result.placedAt}
              status={result.statusLabel}
              events={result.events}
            />

            {/* Post-delivery micro-survey */}
            {result.statusLabel === 'Delivered' && surveySent == null && result.email && (
              <div className="no-print mt-5 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <p className="text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase">
                  How was the delivery?
                </p>
                <div className="mt-2.5 flex gap-2">
                  {SURVEY_OPTIONS.map((option) => (
                    <button
                      key={option.rating}
                      type="button"
                      onClick={() => sendSurvey(option.rating)}
                      className="cursor-pointer rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-800 dark:text-zinc-200 transition-colors hover:border-zinc-900 dark:hover:border-white"
                    >
                      <span aria-hidden="true">{option.emoji}</span>
                      <span className="sr-only">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {surveySent != null && (
              <p className="no-print mt-4 text-xs text-zinc-800 dark:text-zinc-400">
                You rated this delivery {surveySent === 3 ? '😍' : surveySent === 2 ? '🙂' : '😕'} —
                thank you.
              </p>
            )}

            <ul className="mt-5 divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-zinc-200 dark:border-zinc-800">
              {result.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3.5 text-sm"
                >
                  <span className="text-zinc-800 dark:text-zinc-300">
                    {item.name}
                    {item.size && (
                      <span className="text-zinc-800 dark:text-zinc-400"> · {item.size}</span>
                    )}{' '}
                    <span className="text-zinc-800 dark:text-zinc-400">× {item.qty}</span>
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {formatPrice(item.unitPrice * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
            {result.discount > 0 && (
              <div className="mt-4 flex items-baseline justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <span className="text-sm text-zinc-800 dark:text-zinc-400">
                  Discount {result.promoCode ? `(${result.promoCode})` : ''}
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  −{formatPrice(result.discount)}
                </span>
              </div>
            )}
            <div className="mt-4 flex items-baseline justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <span className="text-sm text-zinc-800 dark:text-zinc-400">Total</span>
              <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {formatPrice(result.total)}
              </span>
            </div>

            {/* Share tracking */}
            {shareUrl && (
              <div className="no-print mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyShare}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-xs font-semibold tracking-[0.15em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
                >
                  <ShareIcon size={13} weight="light" aria-hidden="true" />
                  Copy tracking link
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Track my KMKIRAMYKI order ${result.number}: ${shareUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-xs font-semibold tracking-[0.15em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
                >
                  <WhatsappLogoIcon size={13} weight="light" aria-hidden="true" />
                  Share on WhatsApp
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

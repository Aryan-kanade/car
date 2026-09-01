import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { PrinterIcon } from '@phosphor-icons/react/dist/csr/Printer'
import PageHeader from '../components/PageHeader'
import { formatPrice } from '../data/catalog'
import { usePageMeta } from '../hooks/usePageMeta'
import { findOrder } from '../utils/orders'
import { orderWashEstimate } from '../utils/washEconomics'

/** Prices are tax-inclusive per the store's terms — the 18% GST line is a breakdown, not an addition. */
const GST_RATE = 0.18

/** Printable invoice — GST format when a GSTIN is present, packing slip when prices are hidden. */
export default function InvoicePage() {
  const { number } = useParams()
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const [order, setOrder] = useState(null)
  const [notFound, setNotFound] = useState(false)

  usePageMeta(`Invoice ${number ?? ''}`, 'KMKIRAMYKI order invoice.')

  useEffect(() => {
    let cancelled = false
    const applyLocal = () => {
      const local = findOrder(number ?? '', email)
      if (local && !cancelled) setOrder(local)
      return Boolean(local)
    }
    const load = async () => {
      try {
        const res = await fetch(
          `/api/track?number=${encodeURIComponent(number ?? '')}&email=${encodeURIComponent(email)}`
        )
        if (!cancelled && res.ok) {
          const data = await res.json()
          if (data.found) {
            setOrder({
              number: data.order.number,
              email,
              name: '',
              placedAt: data.order.placedAt,
              items: data.order.items,
              discount: data.order.discount,
              promoCode: data.order.promoCode,
              total: data.order.total,
              paymentMethod: data.order.paymentMethod,
              giftHidePrices: data.order.giftHidePrices === true,
              gstin: data.order.gstin ?? null,
              businessName: data.order.businessName ?? null,
              razorpayPaymentId: null,
            })
            return
          }
        }
        if (!applyLocal() && !cancelled) setNotFound(true)
      } catch {
        if (!applyLocal() && !cancelled) setNotFound(true)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [number, email])

  if (notFound) {
    return (
      <>
        <PageHeader
          breadcrumb={[{ label: 'Orders', to: '/orders' }, { label: 'Invoice' }]}
          title="Invoice"
        />
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <p className="text-sm text-zinc-800 dark:text-zinc-400">
            No invoice found for {number}. Check the order number and email on the lookup page.
          </p>
          <Link
            to="/order-lookup"
            className="mt-6 inline-block bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Order lookup
          </Link>
        </div>
      </>
    )
  }

  if (!order) {
    return (
      <>
        <PageHeader
          breadcrumb={[{ label: 'Orders', to: '/orders' }, { label: 'Invoice' }]}
          title="Invoice"
        />
        <div className="mx-auto max-w-xl px-6 py-24 text-center">
          <p className="text-sm text-zinc-800 dark:text-zinc-400">Loading invoice…</p>
        </div>
      </>
    )
  }

  const hidePrices = order.giftHidePrices === true
  const isTaxInvoice = Boolean(order.gstin)
  const gstPortion = Math.round((order.total / (1 + GST_RATE)) * GST_RATE)
  const washEstimate = hidePrices ? null : orderWashEstimate(order.items)

  return (
    <>
      <div className="no-print">
        <PageHeader
          breadcrumb={[{ label: 'Orders', to: '/orders' }, { label: `Invoice ${order.number}` }]}
          title={isTaxInvoice ? 'Tax Invoice' : hidePrices ? 'Packing Slip' : 'Invoice'}
        />
      </div>

      <div className="mx-auto max-w-2xl px-6 pb-20">
        <div className="no-print mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex cursor-pointer items-center gap-2 bg-zinc-900 dark:bg-white px-6 py-3 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            <PrinterIcon size={14} weight="light" aria-hidden="true" />
            {hidePrices ? 'Print slip' : 'Download invoice (PDF)'}
          </button>
        </div>

        <article className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 print:border-0 print:p-0">
          {/* Header */}
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
            <div>
              <p className="font-display text-xl font-bold tracking-[0.12em] uppercase text-zinc-900 dark:text-zinc-100">
                KMKIRAMYKI{' '}
                <span className="text-zinc-800 dark:text-zinc-400">Advanced Chemistry</span>
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-800 dark:text-zinc-400">
                Professional detailing chemistry · India
                <br />
                support@kmkiramyki.example
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold tracking-[0.25em] text-zinc-800 dark:text-zinc-400 uppercase">
                {isTaxInvoice ? 'Tax invoice' : hidePrices ? 'Packing slip' : 'Invoice'}
              </p>
              <p className="font-display mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {order.number}
              </p>
              <p className="mt-1 text-xs text-zinc-800 dark:text-zinc-400">
                {new Date(order.placedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </header>

          {/* Party block */}
          <div className="grid gap-6 border-b border-zinc-200 dark:border-zinc-800 py-6 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-zinc-800 dark:text-zinc-400 uppercase">
                Billed to
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {order.businessName || order.name || 'Customer'}
              </p>
              {isTaxInvoice && order.gstin && (
                <p className="text-xs text-zinc-800 dark:text-zinc-300">GSTIN · {order.gstin}</p>
              )}
              {order.email && (
                <p className="text-xs text-zinc-800 dark:text-zinc-400">{order.email}</p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-zinc-800 dark:text-zinc-400 uppercase">
                Payment
              </p>
              <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-200">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid online (Razorpay)'}
              </p>
              {order.razorpayPaymentId && (
                <p className="text-xs text-zinc-800 dark:text-zinc-400">
                  Ref · {order.razorpayPaymentId}
                </p>
              )}
            </div>
          </div>

          {/* Items */}
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-[11px] tracking-[0.15em] text-zinc-800 dark:text-zinc-400 uppercase">
                <th className="pb-2.5">Item</th>
                <th className="pb-2.5 text-center">Qty</th>
                {!hidePrices && <th className="pb-2.5 text-right">Amount</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-zinc-800 dark:text-zinc-200">
                    {item.name}
                    {item.size && (
                      <span className="text-zinc-800 dark:text-zinc-400"> · {item.size}</span>
                    )}
                    {item.subscription && (
                      <span className="ml-2 text-xs text-zinc-800 dark:text-zinc-400">
                        (subscription)
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center text-zinc-800 dark:text-zinc-300">{item.qty}</td>
                  {!hidePrices && (
                    <td className="py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">
                      {formatPrice(item.unitPrice * item.qty)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          {!hidePrices && (
            <div className="mt-6 space-y-2 border-t border-zinc-200 dark:border-zinc-800 pt-4 text-sm">
              {order.discount > 0 && (
                <div className="flex justify-between text-zinc-800 dark:text-zinc-400">
                  <span>Discount {order.promoCode ? `(${order.promoCode})` : ''}</span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              )}
              {isTaxInvoice ? (
                <>
                  <div className="flex justify-between text-zinc-800 dark:text-zinc-400">
                    <span>Taxable value (incl. of GST)</span>
                    <span>{formatPrice(order.total - gstPortion)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-800 dark:text-zinc-400">
                    <span>GST @ 18% (inclusive)</span>
                    <span>{formatPrice(gstPortion)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-zinc-800 dark:text-zinc-400">
                  <span>Inclusive of all taxes</span>
                  <span>—</span>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-2.5 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          )}

          {/* Economics insight */}
          {washEstimate && (
            <p className="mt-6 rounded-md bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-xs leading-relaxed text-zinc-800 dark:text-zinc-300">
              This kit covers ≈ <span className="font-semibold">{washEstimate.washes} washes</span>{' '}
              (about {washEstimate.months} months of weekend detailing at 3 washes/month).
            </p>
          )}

          <footer className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-5 text-[11px] leading-relaxed text-zinc-800 dark:text-zinc-400">
            {hidePrices
              ? 'A gift from someone who cares about your car. Enjoy!'
              : 'Prices are inclusive of GST. Thank you for choosing KMKIRAMYKI.'}
          </footer>
        </article>
      </div>
    </>
  )
}

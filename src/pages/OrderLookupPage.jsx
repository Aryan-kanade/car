import { useState } from 'react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { TruckIcon } from '@phosphor-icons/react/dist/csr/Truck'
import PageHeader from '../components/PageHeader'
import { formatPrice } from '../data/catalog'
import { usePageMeta } from '../hooks/usePageMeta'
import { findOrder, getOrderStatus } from '../utils/orders'

const inputClasses =
  'w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none'

/** Order lookup — finds real demo orders placed on this device. */
export default function OrderLookupPage() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null) // 'not-found' | order object

  usePageMeta('Order Lookup', 'Track your KMKIRAMYKI order status and delivery.')

  const submit = (event) => {
    event.preventDefault()
    const order = findOrder(orderId, email)
    setResult(order ?? 'not-found')
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Order Lookup' }]}
        title="Order Lookup"
        subtext="Enter your order number and the email you used at checkout to see status and tracking."
      />

      <div className="mx-auto max-w-xl px-6 py-14 md:py-20">
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label
              htmlFor="order-id"
              className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase"
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
              className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase"
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
            className="flex w-full cursor-pointer items-center justify-center gap-3 bg-zinc-900 dark:bg-white py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            <MagnifyingGlassIcon size={16} weight="light" />
            Find my order
          </button>
        </form>

        {result === 'not-found' && (
          <div
            role="status"
            className="mt-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6"
          >
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              No order found for {orderId || 'that number'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Orders placed through this demo storefront on this device are searchable. Double-check
              the number and email, or place a test order from the shop.
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
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Placed{' '}
                  {new Date(result.placedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <span className="flex items-center gap-2 rounded-full border border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white px-3.5 py-1.5 text-[11px] font-semibold tracking-wider text-white dark:text-zinc-900 uppercase">
                <TruckIcon size={14} weight="light" aria-hidden="true" />
                {getOrderStatus(result.placedAt).label}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {getOrderStatus(result.placedAt).detail}
            </p>

            <ul className="mt-5 divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-zinc-200 dark:border-zinc-800">
              {result.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-3.5 text-sm"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {item.name}
                    {item.size && (
                      <span className="text-zinc-500 dark:text-zinc-400"> · {item.size}</span>
                    )}{' '}
                    <span className="text-zinc-500 dark:text-zinc-400">× {item.qty}</span>
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {formatPrice(item.unitPrice * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
            {result.discount > 0 && (
              <div className="mt-4 flex items-baseline justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Discount {result.promoCode ? `(${result.promoCode})` : ''}
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  −{formatPrice(result.discount)}
                </span>
              </div>
            )}
            <div className="mt-4 flex items-baseline justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Total</span>
              <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {formatPrice(result.total)}
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

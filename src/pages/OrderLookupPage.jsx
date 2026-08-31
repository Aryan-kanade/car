import { useState } from 'react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import PageHeader from '../components/PageHeader'
import { usePageMeta } from '../hooks/usePageMeta'

const inputClasses =
  'w-full rounded-md border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-900 focus:outline-none'

/** Order lookup — demo form with a graceful "not wired to a backend" result. */
export default function OrderLookupPage() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)

  usePageMeta('Order Lookup', 'Track your KMKIRAMYKI order status and delivery.')

  const submit = (event) => {
    event.preventDefault()
    setResult('not-found')
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Order Lookup' }]}
        title="Order Lookup"
        subtext="Enter your order number and the email you used at checkout to see status and tracking."
      />

      <div className="mx-auto max-w-xl px-6 py-14 md:py-20">
        <form onSubmit={submit} className="space-y-5" noValidate={false}>
          <div>
            <label
              htmlFor="order-id"
              className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 uppercase"
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
              className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 uppercase"
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
            className="flex w-full cursor-pointer items-center justify-center gap-3 bg-zinc-900 py-4 text-xs font-semibold tracking-[0.2em] text-white uppercase transition-colors hover:bg-zinc-800"
          >
            <MagnifyingGlassIcon size={16} weight="light" />
            Find my order
          </button>
        </form>

        {result === 'not-found' && (
          <div role="status" className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
            <h2 className="text-sm font-semibold text-zinc-900">
              No order found for {orderId || 'that number'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              This is a demo storefront — order lookup is not connected to a backend yet. When it
              ships, this panel will show live status and tracking for your parcel.
            </p>
          </div>
        )}
      </div>
    </>
  )
}

import { Link } from 'react-router'
import PageHeader from '../components/PageHeader'
import { formatPrice } from '../data/catalog'
import { getOrderStatus, readOrders } from '../utils/orders'
import { usePageMeta } from '../hooks/usePageMeta'
import { EmptyBucket } from '../components/illustrations'

/** Order history — every demo order placed on this device. */
export default function OrdersPage() {
  usePageMeta('Order History', 'Every KMKIRAMYKI order placed on this device, with live status.')

  const orders = readOrders()

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Order History' }]}
        title="Order History"
        subtext="Every order placed through this demo storefront on this device — newest first."
      />

      <div className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-16 text-center">
            <EmptyBucket className="h-24 w-24 text-zinc-400 dark:text-zinc-600" />
            <h2 className="font-display mt-6 text-xl font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100">
              No orders yet
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Place a test order through checkout and it will appear here with live status.
            </p>
            <Link
              to="/shop"
              className="mt-7 bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="space-y-6">
            {orders.map((order) => {
              const status = getOrderStatus(order.placedAt)
              return (
                <li
                  key={order.number}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-7"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold tracking-[0.06em] text-zinc-900 dark:text-zinc-100">
                        {order.number}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Placed{' '}
                        {new Date(order.placedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}{' '}
                        · {order.items.length} item{order.items.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <span className="rounded-full bg-zinc-900 dark:bg-white px-3 py-1.5 text-[11px] font-semibold tracking-wider text-white dark:text-zinc-900 uppercase">
                      {status.label}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {status.detail}
                  </p>

                  <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-zinc-200 dark:border-zinc-800">
                    {order.items.map((item) => (
                      <li
                        key={item.id + (item.size ?? '')}
                        className="flex items-center justify-between gap-4 py-3 text-sm"
                      >
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {item.name}
                          {item.size && (
                            <span className="text-zinc-500 dark:text-zinc-400"> · {item.size}</span>
                          )}
                          {item.subscription && (
                            <span className="ml-2 rounded-full border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-600 dark:text-zinc-300 uppercase">
                              Subscription
                            </span>
                          )}
                          <span className="text-zinc-500 dark:text-zinc-400"> × {item.qty}</span>
                        </span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {formatPrice(item.unitPrice * item.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <Link
                      to="/order-lookup"
                      className="text-xs font-semibold tracking-[0.15em] text-zinc-500 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
                    >
                      Track this order →
                    </Link>
                    <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise'
import PageHeader from '../components/PageHeader'
import { formatPrice } from '../data/catalog'
import { getOrderStatus, readOrders } from '../utils/orders'
import OrderTimeline from '../components/OrderTimeline'
import { usePageMeta } from '../hooks/usePageMeta'
import { useCart } from '../context/CartContext'
import { toast } from '../components/ToastStack'
import { isPaymentPending, resumePendingPayment } from '../utils/resumePayment'
import { EmptyBucket } from '../components/illustrations'

/** Order history — every order placed on this device. */
export default function OrdersPage() {
  usePageMeta('Order History', 'Every KMKIRAMYKI order placed on this device, with live status.')
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [orders, setOrders] = useState(() => readOrders())
  const [payingNumber, setPayingNumber] = useState(null)
  const [notice, setNotice] = useState('')

  /** One-tap reorder: re-add every line with its size and plan. */
  const reorder = (order) => {
    order.items.forEach((item) =>
      addItem(item.id, item.qty, item.size, {
        plan: item.subscription ? 'sub' : 'once',
        openDrawer: false,
      })
    )
    toast(
      `Added ${order.items.length} item${order.items.length === 1 ? '' : 's'} from ${order.number}`
    )
    navigate('/cart')
  }

  const payNow = async (order) => {
    if (payingNumber) return
    setPayingNumber(order.number)
    setNotice('')
    try {
      const outcome = await resumePendingPayment({ number: order.number, email: order.email })
      if (outcome.ok) {
        setOrders(readOrders())
        setNotice(`Payment received for ${order.number} — it's shipping soon.`)
      } else if (outcome.dismissed) {
        setNotice('Payment window closed — you can try again any time.')
      } else if (outcome.alreadyPaid) {
        setOrders(readOrders())
        setNotice('This order is already paid.')
      }
    } catch (err) {
      setNotice(err?.message || 'Could not resume payment.')
    } finally {
      setPayingNumber(null)
    }
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Order History' }]}
        title="Order History"
        subtext="Every order you placed on this device — newest first. Live tracking on the lookup page."
      />

      <div className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        {notice && (
          <p
            role="status"
            className="mb-6 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200"
          >
            {notice}
          </p>
        )}

        {orders.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-16 text-center">
            <EmptyBucket className="h-24 w-24 text-zinc-800 dark:text-zinc-500" />
            <h2 className="font-display mt-6 text-xl font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100">
              No orders yet
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
              Place an order through checkout and it will appear here with live status.
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
              const pending = isPaymentPending(order)
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
                      <p className="mt-1 text-xs text-zinc-800 dark:text-zinc-400">
                        Placed{' '}
                        {new Date(order.placedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}{' '}
                        · {order.items.length} item{order.items.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {order.paymentMethod && (
                        <span className="rounded-full border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-[11px] font-semibold tracking-wider text-zinc-800 dark:text-zinc-300 uppercase">
                          {order.paymentMethod === 'cod' ? 'COD' : 'Paid online'}
                        </span>
                      )}
                      <span className="rounded-full bg-zinc-900 dark:bg-white px-3 py-1.5 text-[11px] font-semibold tracking-wider text-white dark:text-zinc-900 uppercase">
                        {pending ? 'Payment pending' : status.label}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
                    {status.detail}
                  </p>

                  {!pending && <OrderTimeline placedAt={order.placedAt} />}

                  {pending && (
                    <button
                      type="button"
                      onClick={() => payNow(order)}
                      disabled={payingNumber === order.number}
                      className="mt-4 cursor-pointer bg-zinc-900 dark:bg-white px-5 py-3 text-xs font-semibold tracking-[0.15em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {payingNumber === order.number
                        ? 'Opening Razorpay…'
                        : `Complete payment · ${formatPrice(order.total)}`}
                    </button>
                  )}

                  <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-zinc-200 dark:border-zinc-800">
                    {order.items.map((item) => (
                      <li
                        key={item.id + (item.size ?? '')}
                        className="flex items-center justify-between gap-4 py-3 text-sm"
                      >
                        <span className="text-zinc-800 dark:text-zinc-300">
                          {item.name}
                          {item.size && (
                            <span className="text-zinc-800 dark:text-zinc-400"> · {item.size}</span>
                          )}
                          {item.subscription && (
                            <span className="ml-2 rounded-full border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-800 dark:text-zinc-300 uppercase">
                              Subscription
                            </span>
                          )}
                          <span className="text-zinc-800 dark:text-zinc-400"> × {item.qty}</span>
                        </span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          {formatPrice(item.unitPrice * item.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="no-print mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <div className="flex flex-wrap gap-4">
                      <button
                        type="button"
                        onClick={() => reorder(order)}
                        className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
                      >
                        <ArrowCounterClockwiseIcon size={13} weight="light" aria-hidden="true" />
                        Buy again
                      </button>
                      <Link
                        to={`/order-lookup?number=${order.number}`}
                        className="text-xs font-semibold tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
                      >
                        Track →
                      </Link>
                      {!pending && !order.giftHidePrices && (
                        <Link
                          to={`/invoice/${order.number}?email=${encodeURIComponent(order.email)}`}
                          className="text-xs font-semibold tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
                        >
                          Invoice
                        </Link>
                      )}
                    </div>
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

import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { XIcon } from '@phosphor-icons/react/dist/csr/X'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../data/catalog'

const TOUCHED_KEY = 'kmkiramyki-cart-touched'
const NUDGED_KEY = 'kmkiramyki-cart-nudged'
const MIN_AGE_MS = 24 * 60 * 60 * 1000 // a day of quiet
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // give up after a week

/** Pure check — evaluated once per mount via the state initializer. */
function shouldNudge(itemCount) {
  try {
    if (itemCount === 0) return false
    if (sessionStorage.getItem(NUDGED_KEY)) return false
    const touched = Number(window.localStorage.getItem(TOUCHED_KEY))
    if (!Number.isFinite(touched)) return false
    const age = Date.now() - touched
    return age >= MIN_AGE_MS && age <= MAX_AGE_MS
  } catch {
    return false
  }
}

/**
 * Abandoned-cart nudge: one dismissible chip when a non-empty cart
 * has been sitting untouched for 1–7 days. Once per browser session,
 * never on cart/checkout pages themselves.
 */
export default function CartNudge() {
  const { items, subtotal } = useCart()
  const { pathname } = useLocation()
  const [nudgeable] = useState(() => shouldNudge(items.length))
  const [dismissed, setDismissed] = useState(false)

  const dismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem(NUDGED_KEY, '1')
    } catch {
      /* optional */
    }
  }

  if (!nudgeable || dismissed) return null
  if (pathname === '/cart' || pathname.startsWith('/checkout')) return null
  const count = items.reduce((sum, { qty }) => sum + qty, 0)

  return (
    <div role="status" className="fixed bottom-20 left-4 z-40 lg:bottom-6 print:hidden">
      <div className="flex items-center gap-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 shadow-lg">
        <p className="text-sm text-zinc-800 dark:text-zinc-300">
          Your cart is waiting —{' '}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {count} item{count === 1 ? '' : 's'} · {formatPrice(subtotal)}
          </span>
        </p>
        <Link
          to="/cart"
          onClick={dismiss}
          className="shrink-0 bg-zinc-900 dark:bg-white px-3.5 py-2 text-[11px] font-semibold tracking-[0.15em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          View cart
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss cart reminder"
          className="cursor-pointer p-1 text-zinc-800 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
        >
          <XIcon size={14} weight="light" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

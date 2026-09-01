import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, m } from 'motion/react'
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { TruckIcon } from '@phosphor-icons/react/dist/csr/Truck'
import { XIcon } from '@phosphor-icons/react/dist/csr/X'
import Placeholder from './Placeholder'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '../data/catalog'
import { useCart } from '../context/CartContext'
import { useFocusTrap } from '../hooks/useFocusTrap'

/** Slide-out cart quick view — opens on add-to-cart and from the nav cart icon. */
export default function CartDrawer() {
  const { items, count, subtotal, setQty, removeItem, drawerOpen, closeDrawer } = useCart()
  const drawerRef = useRef(null)
  const triggerRef = useRef(null)

  useFocusTrap(drawerRef, drawerOpen)

  // Lock body scroll, close on Escape, return focus to the trigger on close
  useEffect(() => {
    if (!drawerOpen) return
    triggerRef.current = document.activeElement
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      if (triggerRef.current instanceof HTMLElement) triggerRef.current.focus()
    }
  }, [drawerOpen, closeDrawer])

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-60 bg-zinc-950/40 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <m.aside
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-70 flex w-full max-w-md flex-col border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            role="dialog"
            aria-modal="true"
            aria-label="Cart quick view"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-6 py-5">
              <h2 className="font-display text-lg font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100">
                Cart <span className="text-zinc-400 dark:text-zinc-500">({count})</span>
              </h2>
              <button
                type="button"
                aria-label="Close cart"
                onClick={closeDrawer}
                className="cursor-pointer p-2.5 text-zinc-500 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                <XIcon size={20} weight="light" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Your cart is empty.</p>
                <Link
                  to="/shop"
                  onClick={closeDrawer}
                  className="mt-5 bg-zinc-900 dark:bg-white px-7 py-3.5 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
                >
                  Start shopping
                </Link>
              </div>
            ) : (
              <>
                {/* Free shipping progress */}
                <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <TruckIcon size={16} weight="light" aria-hidden="true" />
                    {freeShipping ? (
                      <span>Free shipping unlocked</span>
                    ) : (
                      <span>Add {formatPrice(remaining)} more for free shipping</span>
                    )}
                  </div>
                  <div
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progress toward free shipping"
                  >
                    <div
                      className="h-full rounded-full bg-zinc-900 dark:bg-white transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Items */}
                <ul className="flex-1 divide-y divide-zinc-200 dark:divide-zinc-800 overflow-y-auto px-6">
                  {items.map(({ product, size, plan, recurring, qty, lineTotal }) => (
                    <li key={`${product.id}|${size ?? 'kit'}|${plan}`} className="flex gap-4 py-5">
                      <Link
                        to={`/product/${product.id}`}
                        onClick={closeDrawer}
                        className="w-16 shrink-0"
                        aria-label={product.name}
                      >
                        <Placeholder
                          label={product.imageLabel}
                          iconSize={16}
                          className="aspect-[4/5] rounded-md"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {product.name}
                            {size && (
                              <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                                {size}
                              </span>
                            )}
                            {recurring && (
                              <span className="mt-0.5 block text-[10px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase">
                                Subscription · 15% off
                              </span>
                            )}
                          </p>
                          <button
                            type="button"
                            aria-label={`Remove ${product.name}${size ? ` ${size}` : ''}`}
                            onClick={() => removeItem(product.id, size, plan)}
                            className="cursor-pointer p-1 text-zinc-500 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                          >
                            <XIcon size={14} weight="light" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="flex items-center border border-zinc-200 dark:border-zinc-800">
                            <button
                              type="button"
                              aria-label={`Decrease quantity of ${product.name}`}
                              onClick={() => setQty(product.id, size, plan, qty - 1)}
                              className="cursor-pointer p-2 text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                            >
                              <MinusIcon size={12} weight="light" />
                            </button>
                            <span className="min-w-8 text-center text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                              {qty}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase quantity of ${product.name}`}
                              onClick={() => setQty(product.id, size, plan, qty + 1)}
                              className="cursor-pointer p-2 text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                            >
                              <PlusIcon size={12} weight="light" />
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {formatPrice(lineTotal)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Footer */}
                <div className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Subtotal</span>
                    <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <Link
                    to="/cart"
                    onClick={closeDrawer}
                    className="mt-4 flex w-full items-center justify-center bg-zinc-900 dark:bg-white py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
                  >
                    View full cart
                  </Link>
                </div>
              </>
            )}
          </m.aside>
        </>
      )}
    </AnimatePresence>
  )
}

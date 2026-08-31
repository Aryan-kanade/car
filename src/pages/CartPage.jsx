import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { ShoppingCartIcon } from '@phosphor-icons/react/dist/csr/ShoppingCart'
import { TruckIcon } from '@phosphor-icons/react/dist/csr/Truck'
import { XIcon } from '@phosphor-icons/react/dist/csr/X'
import PageHeader from '../components/PageHeader'
import Placeholder from '../components/Placeholder'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '../data/catalog'
import { useCart } from '../context/CartContext'
import { usePageMeta } from '../hooks/usePageMeta'

const SHIPPING_FEE = 199

/** Cart — line items, free-shipping progress and order summary. */
export default function CartPage() {
  const { items, subtotal, setQty, removeItem, clearCart } = useCart()

  usePageMeta('Your Cart', 'Review your KMKIRAMYKI order — free shipping over ₹7,155.')

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  const shipping = items.length === 0 || freeShipping ? 0 : SHIPPING_FEE

  if (items.length === 0) {
    return (
      <>
        <PageHeader breadcrumb={[{ label: 'Cart' }]} title="Your Cart" />
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center md:py-32">
          <ShoppingCartIcon size={48} weight="light" className="text-zinc-400" aria-hidden="true" />
          <h2 className="font-display mt-6 text-2xl font-bold tracking-[0.08em] uppercase text-zinc-900">
            Your cart is empty
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-600">
            Chemistry, kits and studio-tested tools are waiting. Free shipping kicks in at{' '}
            {formatPrice(FREE_SHIPPING_THRESHOLD)}.
          </p>
          <Link
            to="/shop"
            className="mt-8 bg-zinc-900 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white uppercase transition-colors hover:bg-zinc-800"
          >
            Continue shopping
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Cart' }]}
        title="Your Cart"
        subtext={`${items.length} item${items.length === 1 ? '' : 's'} ready to ship.`}
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 md:py-20 lg:grid-cols-[1.7fr_1fr] lg:gap-16">
        {/* Line items */}
        <div>
          <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
            {items.map(({ product, qty }) => (
              <motion.li
                key={product.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-5 py-6"
              >
                <Link
                  to={`/product/${product.id}`}
                  aria-label={product.name}
                  className="w-24 shrink-0 sm:w-28"
                >
                  <Placeholder label={product.imageLabel} iconSize={20} className="aspect-[4/5] rounded-lg" />
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] tracking-[0.15em] text-zinc-500 uppercase">
                        {product.category}
                      </p>
                      <h2 className="mt-1 text-sm font-medium text-zinc-900">
                        <Link
                          to={`/product/${product.id}`}
                          className="transition-colors hover:text-zinc-600"
                        >
                          {product.name}
                        </Link>
                      </h2>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${product.name} from cart`}
                      onClick={() => removeItem(product.id)}
                      className="cursor-pointer p-2 text-zinc-500 transition-colors hover:text-zinc-900"
                    >
                      <XIcon size={18} weight="light" />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                    <div className="flex items-center border border-zinc-200">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${product.name}`}
                        onClick={() => setQty(product.id, qty - 1)}
                        className="cursor-pointer p-2.5 text-zinc-600 transition-colors hover:text-zinc-900"
                      >
                        <MinusIcon size={14} weight="light" />
                      </button>
                      <span className="min-w-9 text-center text-sm font-semibold text-zinc-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${product.name}`}
                        onClick={() => setQty(product.id, qty + 1)}
                        className="cursor-pointer p-2.5 text-zinc-600 transition-colors hover:text-zinc-900"
                      >
                        <PlusIcon size={14} weight="light" />
                      </button>
                    </div>
                    <p className="flex items-baseline gap-2.5 text-sm">
                      <span className="text-zinc-500 line-through">
                        {formatPrice(product.compareAt * qty)}
                      </span>
                      <span className="font-semibold text-zinc-900">
                        {formatPrice(product.price * qty)}
                      </span>
                    </p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <Link
              to="/shop"
              className="text-xs font-medium tracking-[0.15em] text-zinc-500 uppercase transition-colors hover:text-zinc-900"
            >
              Continue shopping
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="cursor-pointer text-xs font-medium tracking-[0.15em] text-zinc-500 uppercase transition-colors hover:text-zinc-900"
            >
              Clear cart
            </button>
          </div>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-zinc-200 bg-zinc-50 p-7 lg:sticky lg:top-28">
          <h2 className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 uppercase">
            Order summary
          </h2>

          {/* Free shipping progress */}
          <div className="mt-5">
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <TruckIcon size={16} weight="light" aria-hidden="true" />
              {freeShipping ? (
                <span>Free shipping unlocked</span>
              ) : (
                <span>
                  Add {formatPrice(remaining)} more for free shipping
                </span>
              )}
            </div>
            <div
              className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-zinc-200"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progress toward free shipping"
            >
              <div
                className="h-full rounded-full bg-zinc-900 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <dl className="mt-6 space-y-3 border-t border-zinc-200 pt-5 text-sm">
            <div className="flex justify-between text-zinc-600">
              <dt>Subtotal</dt>
              <dd className="font-medium text-zinc-900">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-zinc-600">
              <dt>Shipping</dt>
              <dd className="font-medium text-zinc-900">
                {shipping === 0 ? 'Free' : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold text-zinc-900">
              <dt>Total</dt>
              <dd>{formatPrice(subtotal + shipping)}</dd>
            </div>
          </dl>

          <Link
            to="/checkout"
            className="mt-6 flex w-full bg-zinc-900 py-4 text-center text-xs font-semibold tracking-[0.2em] text-white uppercase transition-colors hover:bg-zinc-800"
          >
            Proceed to checkout
          </Link>
          <p className="mt-3 text-center text-xs text-zinc-500">
            Demo checkout — no payment is processed.
          </p>
        </aside>
      </div>
    </>
  )
}

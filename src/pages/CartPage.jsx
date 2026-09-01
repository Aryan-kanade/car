import { useState } from 'react'
import { Link } from 'react-router'
import { m } from 'motion/react'
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { TruckIcon } from '@phosphor-icons/react/dist/csr/Truck'
import { XIcon } from '@phosphor-icons/react/dist/csr/X'
import PageHeader from '../components/PageHeader'
import Placeholder from '../components/Placeholder'
import ProductCard from '../components/ProductCard'
import {
  formatPrice,
  freeSamples,
  purchasableProducts,
  FREE_SHIPPING_THRESHOLD,
} from '../data/catalog'
import { promoGivesFreeShipping } from '../utils/promos'
import { kitCompletionCandidate } from '../utils/bundles'
import { orderWashEstimate } from '../utils/washEconomics'
import OrderByCountdown from '../components/OrderByCountdown'
import { useCart } from '../context/CartContext'
import { REDEEM_THRESHOLD, REDEEM_VALUE, useLoyalty } from '../context/LoyaltyContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { EmptyBucket } from '../components/illustrations'
import { SHIPPING_FEE } from '../utils/orders'

/** Cart — line items, cross-sells, promo code, free-shipping progress and order summary. */
export default function CartPage() {
  const {
    items,
    subtotal,
    promo,
    discount,
    addItem,
    applyPromo,
    clearPromo,
    setQty,
    removeItem,
    clearCart,
  } = useCart()
  const [promoError, setPromoError] = useState(null)
  const { balance, pointsForAmount, canRedeem } = useLoyalty()
  const [redeemPoints, setRedeemPoints] = useState(false)

  usePageMeta('Your Cart', 'Review your KMKIRAMYKI order — free shipping over ₹7,155.')

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  const shipping =
    items.length === 0 || freeShipping || promoGivesFreeShipping(promo) ? 0 : SHIPPING_FEE
  const pointsDiscount = redeemPoints && canRedeem ? REDEEM_VALUE : 0
  const total = Math.max(0, subtotal - discount - pointsDiscount) + shipping
  const pointsEarned = pointsForAmount(total)

  const crossSells = purchasableProducts
    .filter((product) => !items.some((item) => item.product.id === product.id))
    .slice(0, 3)

  // Smart kit-upgrade suggestion (2+ of a kit's products in cart)
  const kitUpgrade = kitCompletionCandidate(items.map(({ product }) => product))
  const washEstimate = orderWashEstimate(
    items.map(({ product, size, qty }) => ({ id: product.id, size, qty }))
  )

  if (items.length === 0) {
    return (
      <>
        <PageHeader breadcrumb={[{ label: 'Cart' }]} title="Your Cart" />
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center md:py-32">
          <EmptyBucket className="h-28 w-28 text-zinc-800 dark:text-zinc-600" />
          <h2 className="font-display mt-6 text-2xl font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100">
            Your cart is empty
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
            Chemistry, kits and studio-tested tools are waiting. Free shipping kicks in at{' '}
            {formatPrice(FREE_SHIPPING_THRESHOLD)}.
          </p>
          <Link
            to="/shop"
            className="mt-8 bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
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
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800">
            {items.map(({ product, size, plan, recurring, qty, unitCompareAt, lineTotal }) => (
              <m.li
                key={`${product.id}|${size ?? 'kit'}|${plan}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-5 py-6"
              >
                <Link
                  to={`/product/${product.id}`}
                  aria-label={product.name}
                  className="w-24 shrink-0 sm:w-28"
                >
                  <Placeholder
                    label={product.imageLabel}
                    iconSize={20}
                    className="aspect-[4/5] rounded-lg"
                  />
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] tracking-[0.15em] text-zinc-800 dark:text-zinc-400 uppercase">
                        {product.category}
                      </p>
                      <h2 className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        <Link
                          to={`/product/${product.id}`}
                          className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-300"
                        >
                          {product.name}
                        </Link>
                        {size && (
                          <span className="ml-2 text-xs text-zinc-800 dark:text-zinc-400">
                            {size}
                          </span>
                        )}
                        {recurring && (
                          <span className="ml-2 rounded-full border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-zinc-800 dark:text-zinc-300 uppercase">
                            Subscription · 15% off
                          </span>
                        )}
                      </h2>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${product.name}${size ? ` ${size}` : ''} from cart`}
                      onClick={() => removeItem(product.id, size, plan)}
                      className="cursor-pointer p-2 text-zinc-800 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                    >
                      <XIcon size={18} weight="light" />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                    <div className="flex items-center border border-zinc-200 dark:border-zinc-800">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${product.name}`}
                        onClick={() => setQty(product.id, size, plan, qty - 1)}
                        className="cursor-pointer p-2.5 text-zinc-800 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                      >
                        <MinusIcon size={14} weight="light" />
                      </button>
                      <span className="min-w-9 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {qty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${product.name}`}
                        onClick={() => setQty(product.id, size, plan, qty + 1)}
                        className="cursor-pointer p-2.5 text-zinc-800 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                      >
                        <PlusIcon size={14} weight="light" />
                      </button>
                    </div>
                    <p className="flex items-baseline gap-2.5 text-sm">
                      <span className="text-zinc-800 dark:text-zinc-400 line-through">
                        {formatPrice(unitCompareAt * qty)}
                      </span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatPrice(lineTotal)}
                      </span>
                    </p>
                  </div>
                </div>
              </m.li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <Link
              to="/shop"
              className="text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              Continue shopping
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="cursor-pointer text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              Clear cart
            </button>
          </div>

          {/* Free sample picker */}
          {!items.some((item) => item.product.category === 'Free Sample') && (
            <div className="mt-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-7">
              <h2 className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
                Choose a complimentary sample
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
                One free 50 ml vial with every order — try a formula before you commit to a bottle.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {freeSamples.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => addItem(sample.id)}
                    className="cursor-pointer rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-800 dark:text-zinc-300 transition-colors hover:border-zinc-900 dark:hover:border-white"
                  >
                    {sample.name.replace(' Sample · 50 ml', '')}
                    <span className="ml-2 text-xs text-zinc-800 dark:text-zinc-400">Free</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Smart kit completion */}
          {kitUpgrade && (
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900 px-5 py-4">
              <p className="text-sm text-zinc-800 dark:text-zinc-300">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  You&apos;re {kitUpgrade.matchedCount} products into the {kitUpgrade.bundle.title}{' '}
                  kit.
                </span>{' '}
                The full box ({kitUpgrade.bundle.product}) is {formatPrice(kitUpgrade.bundle.price)}{' '}
                — everything you&apos;re buying plus the extras, at the kit price.
              </p>
              <button
                type="button"
                onClick={() => addItem(kitUpgrade.bundle.productId)}
                className="shrink-0 cursor-pointer bg-zinc-900 dark:bg-white px-5 py-3 text-xs font-semibold tracking-[0.15em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                Add the {kitUpgrade.bundle.title} kit
              </button>
            </div>
          )}

          {/* Cross-sells */}
          {crossSells.length > 0 && (
            <div className="mt-16 border-t border-zinc-200 dark:border-zinc-800 pt-10">
              <h2 className="font-display text-lg font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100">
                Complete your routine
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3">
                {crossSells.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-7 lg:sticky lg:top-28">
          <h2 className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
            Order summary
          </h2>

          {/* Free shipping progress */}
          <div className="mt-5">
            <div className="flex items-center gap-2 text-xs text-zinc-800 dark:text-zinc-400">
              <TruckIcon size={16} weight="light" aria-hidden="true" />
              {freeShipping ? (
                <span>Free shipping unlocked</span>
              ) : (
                <span>Add {formatPrice(remaining)} more for free shipping</span>
              )}
            </div>
            <div
              className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
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
            <div className="mt-3">
              <OrderByCountdown compact />
            </div>
          </div>

          {washEstimate && (
            <p className="mt-4 rounded-md border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-xs leading-relaxed text-zinc-800 dark:text-zinc-300">
              This cart covers ≈ <span className="font-semibold">{washEstimate.washes} washes</span>{' '}
              ({washEstimate.months} months of weekend detailing).
            </p>
          )}

          <dl className="mt-6 space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-5 text-sm">
            <div className="flex justify-between text-zinc-800 dark:text-zinc-400">
              <dt>Subtotal</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                {formatPrice(subtotal)}
              </dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-zinc-800 dark:text-zinc-400">
                <dt>Discount ({promo.code})</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  −{formatPrice(discount)}
                </dd>
              </div>
            )}
            <div className="flex justify-between text-zinc-800 dark:text-zinc-400">
              <dt>Shipping</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                {shipping === 0 ? 'Free' : formatPrice(shipping)}
              </dd>
            </div>
            {pointsDiscount > 0 && (
              <div className="flex justify-between text-zinc-800 dark:text-zinc-400">
                <dt>Studio Points (−{REDEEM_THRESHOLD})</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                  −{formatPrice(pointsDiscount)}
                </dd>
              </div>
            )}
            <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>

          {/* Studio Points */}
          <div className="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3.5">
            {canRedeem ? (
              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                <span className="text-zinc-800 dark:text-zinc-300">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {balance} pts
                  </span>{' '}
                  available — redeem {REDEEM_THRESHOLD} for {formatPrice(REDEEM_VALUE)} off
                </span>
                <input
                  type="checkbox"
                  checked={redeemPoints}
                  onChange={(event) => setRedeemPoints(event.target.checked)}
                  className="h-4 w-4 shrink-0 accent-zinc-900 dark:accent-white"
                />
              </label>
            ) : (
              <p className="text-sm text-zinc-800 dark:text-zinc-400">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {balance} pts
                </span>{' '}
                — {REDEEM_THRESHOLD - balance} more unlocks {formatPrice(REDEEM_VALUE)} off
              </p>
            )}
            <p className="mt-1.5 text-xs text-zinc-800 dark:text-zinc-400">
              This order earns <span className="font-semibold">{pointsEarned} pts</span>
            </p>
          </div>

          {/* Promo code */}
          <div className="mt-5 border-t border-zinc-200 dark:border-zinc-800 pt-5">
            {promo ? (
              <p className="flex items-center justify-between gap-3 text-xs text-zinc-800 dark:text-zinc-400">
                <span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {promo.code}
                  </span>{' '}
                  · {promo.label}
                </span>
                <button
                  type="button"
                  onClick={clearPromo}
                  className="cursor-pointer p-2 text-zinc-800 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                  aria-label={`Remove promo code ${promo.code}`}
                >
                  <XIcon size={14} weight="light" />
                </button>
              </p>
            ) : (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  const input = event.currentTarget.elements['promo-code']
                  const result = applyPromo(input.value)
                  setPromoError(result.ok ? null : result.error)
                  if (result.ok) input.value = ''
                }}
                className="flex gap-2"
              >
                <label htmlFor="cart-promo" className="sr-only">
                  Promo code
                </label>
                <input
                  id="cart-promo"
                  name="promo-code"
                  type="text"
                  placeholder="Promo code"
                  className="min-w-0 flex-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="cursor-pointer rounded-md border border-zinc-300 dark:border-zinc-700 px-4 text-xs font-semibold tracking-[0.15em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
                >
                  Apply
                </button>
              </form>
            )}
            {promoError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">{promoError}</p>
            )}
          </div>

          <Link
            to="/checkout"
            className="mt-6 flex w-full bg-zinc-900 dark:bg-white py-4 text-center text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Proceed to checkout
          </Link>
          <p className="mt-3 text-center text-xs text-zinc-800 dark:text-zinc-400">
            Demo checkout — no payment is processed.
          </p>
        </aside>
      </div>
    </>
  )
}

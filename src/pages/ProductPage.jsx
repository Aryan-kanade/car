import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { AnimatePresence, m } from 'motion/react'
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { FireIcon } from '@phosphor-icons/react/dist/csr/Fire'
import { HeartIcon } from '@phosphor-icons/react/dist/csr/Heart'
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { ShoppingCartIcon } from '@phosphor-icons/react/dist/csr/ShoppingCart'
import { StarIcon } from '@phosphor-icons/react/dist/csr/Star'
import { TruckIcon } from '@phosphor-icons/react/dist/csr/Truck'
import PageHeader from '../components/PageHeader'
import Placeholder from '../components/Placeholder'
import ProductCard from '../components/ProductCard'
import ReviewSection from '../components/ReviewSection'
import NotFoundPage from './NotFoundPage'
import {
  defaultSizeLabel,
  formatPrice,
  getCategoryForProduct,
  getSizes,
  getVariant,
  getProductById,
  products,
  valueProps,
} from '../data/catalog'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { readReviews } from '../hooks/useProductReviews'

const RECENT_KEY = 'kmkiramyki-recently-viewed'

function readRecentlyViewed() {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

function QtyStepper({ qty, onChange, compact = false }) {
  const pad = compact ? 'p-2.5' : 'p-3'
  const icon = compact ? 14 : 16
  return (
    <div className="flex items-center border border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, qty - 1))}
        className={`cursor-pointer ${pad} text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white`}
      >
        <MinusIcon size={icon} weight="light" />
      </button>
      <span
        aria-live="polite"
        className={`${compact ? 'min-w-8 text-xs' : 'min-w-10 text-sm'} text-center font-semibold text-zinc-900 dark:text-zinc-100`}
      >
        {qty}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(99, qty + 1))}
        className={`cursor-pointer ${pad} text-zinc-600 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white`}
      >
        <PlusIcon size={icon} weight="light" />
      </button>
    </div>
  )
}

/** Product detail page — resolves the route, delegates to a keyed view. */
export default function ProductPage() {
  const { id } = useParams()
  const product = getProductById(id)

  usePageMeta(
    product ? product.name : 'Product not found',
    product ? product.description.slice(0, 155) : undefined
  )

  if (!product) return <NotFoundPage />

  // Keyed by product id so all view state resets naturally on navigation
  return <ProductView key={product.id} product={product} />
}

function ProductView({ product }) {
  const [qty, setQty] = useState(1)
  const [sizeLabel, setSizeLabel] = useState(() => defaultSizeLabel(product))
  const [view, setView] = useState(0)
  const [recent] = useState(() =>
    readRecentlyViewed().filter((recentId) => recentId !== product.id)
  )
  const [showStickyBar, setShowStickyBar] = useState(false)
  const buyBoxRef = useRef(null)
  const { addItem } = useCart()
  const { has, toggle } = useWishlist()

  // Track in "recently viewed" (sync with localStorage — external system)
  useEffect(() => {
    try {
      const next = [product.id, ...readRecentlyViewed().filter((r) => r !== product.id)].slice(0, 5)
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {
      /* storage unavailable */
    }
  }, [product.id])

  // Sticky add-to-cart bar appears once the buy box scrolls out of view
  useEffect(() => {
    const node = buyBoxRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [product])

  const category = getCategoryForProduct(product)
  const sizes = getSizes(product)
  const variant = getVariant(product, sizeLabel)
  const wished = has(product.id)
  const reviewCount = readReviews(product.id).length
  const rating = product.rating

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .concat(products.filter((p) => p.category !== product.category && p.id !== product.id))
    .slice(0, 3)

  const recentProducts = recent.map(getProductById).filter(Boolean)
  const views = [
    `${product.imageLabel} (front)`,
    `${product.imageLabel} (angle)`,
    `${product.imageLabel} (in use)`,
  ]

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description.slice(0, 200),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: variant.price,
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>

      <PageHeader
        breadcrumb={[
          { label: 'Shop', to: '/shop' },
          ...(category ? [{ label: category.name, to: `/shop/${category.slug}` }] : []),
          { label: product.name },
        ]}
        title={product.name}
      />

      <div className="mx-auto max-w-7xl px-6 pb-28 py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <AnimatePresence mode="popLayout">
              <m.div
                key={view}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Placeholder
                  label={views[view]}
                  iconSize={48}
                  className="aspect-square rounded-xl"
                />
              </m.div>
            </AnimatePresence>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {views.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  aria-label={`Show image ${index + 1} of 3`}
                  aria-pressed={view === index}
                  onClick={() => setView(index)}
                  className={`cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                    view === index
                      ? 'border-zinc-900 dark:border-white'
                      : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <Placeholder label={label} iconSize={20} className="aspect-square rounded-md" />
                </button>
              ))}
            </div>
          </m.div>

          {/* Buy box */}
          <m.div
            ref={buyBoxRef}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="flex flex-col"
          >
            <p className="text-[11px] tracking-[0.2em] text-zinc-500 dark:text-zinc-400 uppercase">
              {category ? (
                <Link
                  to={`/shop/${category.slug}`}
                  className="transition-colors hover:text-zinc-900 dark:hover:text-white"
                >
                  {category.name}
                </Link>
              ) : (
                product.category
              )}
            </p>

            {(rating || reviewCount > 0) && (
              <div className="mt-3 flex items-center gap-1.5">
                <span className="flex gap-0.5">
                  {Array.from({ length: rating?.stars ?? 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      size={14}
                      weight="fill"
                      className="text-zinc-900 dark:text-zinc-100"
                    />
                  ))}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  ({reviewCount} review{reviewCount === 1 ? '' : 's'})
                </span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {formatPrice(variant.price)}
              </span>
              <span className="text-base text-zinc-500 dark:text-zinc-400 line-through">
                {formatPrice(variant.compareAt)}
              </span>
              <span className="rounded-full bg-zinc-900 dark:bg-white px-2.5 py-1 text-[11px] font-semibold tracking-wider text-white dark:text-zinc-900 uppercase">
                {product.badge}
              </span>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {product.description}
            </p>

            {product.highlights && (
              <ul className="mt-6 space-y-2.5">
                {product.highlights.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    <CheckCircleIcon
                      size={18}
                      weight="light"
                      className="mt-0.5 shrink-0 text-zinc-900 dark:text-zinc-100"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            )}

            {/* Size selector */}
            {sizes && (
              <fieldset className="mt-7">
                <legend className="text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase">
                  Size
                </legend>
                <div className="mt-3 flex flex-wrap gap-2.5" role="radiogroup" aria-label="Size">
                  {sizes.map((size) => (
                    <button
                      key={size.label}
                      type="button"
                      role="radio"
                      aria-checked={sizeLabel === size.label}
                      onClick={() => setSizeLabel(size.label)}
                      className={`cursor-pointer rounded-md border px-5 py-2.5 text-sm transition-colors ${
                        sizeLabel === size.label
                          ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {product.usage && (
              <div className="mt-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5">
                <h2 className="text-[11px] font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase">
                  How to use
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {product.usage}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <QtyStepper qty={qty} onChange={setQty} />
              <button
                type="button"
                onClick={() => addItem(product.id, qty, sizeLabel)}
                className="flex flex-1 cursor-pointer items-center justify-center gap-3 bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                <ShoppingCartIcon size={16} weight="light" />
                Add to cart
              </button>
              <button
                type="button"
                aria-label={
                  wished
                    ? `Remove ${product.name} from wishlist`
                    : `Add ${product.name} to wishlist`
                }
                aria-pressed={wished}
                onClick={() => toggle(product.id)}
                className={`cursor-pointer border p-4 transition-colors ${
                  wished
                    ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-zinc-100'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-white hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <HeartIcon size={18} weight={wished ? 'fill' : 'light'} />
              </button>
            </div>

            {/* Stock urgency */}
            {product.stock <= 5 && (
              <p className="mt-4 flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                <FireIcon size={16} weight="fill" aria-hidden="true" />
                Only {product.stock} left in stock — ships while it lasts
              </p>
            )}

            {/* Delivery strip */}
            <p className="mt-5 flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
              <TruckIcon
                size={18}
                weight="light"
                className="shrink-0 text-zinc-900 dark:text-zinc-100"
                aria-hidden="true"
              />
              Ordered before 4 PM IST on working days ships the same day · Metro delivery in 2–3
              days
            </p>

            <ul className="mt-8 grid grid-cols-1 gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-6 sm:grid-cols-3">
              {valueProps.map((prop) => (
                <li
                  key={prop.title}
                  className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400"
                >
                  {prop.subtext}
                </li>
              ))}
            </ul>
          </m.div>
        </div>

        {/* Reviews */}
        <ReviewSection productId={product.id} />

        {/* Related */}
        <div className="mt-20 border-t border-zinc-200 dark:border-zinc-800 pt-14 md:mt-24">
          <h2 className="font-display text-xl font-bold tracking-[0.12em] uppercase text-zinc-900 dark:text-zinc-100 md:text-2xl">
            Complete the routine
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, index) => (
              <m.div
                key={p.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: index * 0.08, ease: 'easeOut' }}
              >
                <ProductCard product={p} />
              </m.div>
            ))}
          </div>
        </div>

        {/* Recently viewed */}
        {recentProducts.length > 0 && (
          <div className="mt-20 border-t border-zinc-200 dark:border-zinc-800 pt-14 md:mt-24">
            <h2 className="font-display text-xl font-bold tracking-[0.12em] uppercase text-zinc-900 dark:text-zinc-100 md:text-2xl">
              Recently viewed
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {recentProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky add-to-cart bar */}
      <AnimatePresence>
        {showStickyBar && (
          <m.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md"
          >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {product.name}
                  {variant.label && (
                    <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {variant.label}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 flex items-baseline gap-2 text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400 line-through">
                    {formatPrice(variant.compareAt)}
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatPrice(variant.price)}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <QtyStepper qty={qty} onChange={setQty} compact />
                <button
                  type="button"
                  onClick={() => addItem(product.id, qty, sizeLabel)}
                  className="flex cursor-pointer items-center justify-center gap-2 bg-zinc-900 dark:bg-white px-6 py-3 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
                >
                  <ShoppingCartIcon size={14} weight="light" />
                  Add to cart
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { HeartIcon } from '@phosphor-icons/react/dist/csr/Heart'
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { ShoppingCartIcon } from '@phosphor-icons/react/dist/csr/ShoppingCart'
import { StarIcon } from '@phosphor-icons/react/dist/csr/Star'
import PageHeader from '../components/PageHeader'
import Placeholder from '../components/Placeholder'
import ProductCard from '../components/ProductCard'
import NotFoundPage from './NotFoundPage'
import {
  formatPrice,
  getCategoryForProduct,
  getProductById,
  products,
  valueProps,
} from '../data/catalog'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { usePageMeta } from '../hooks/usePageMeta'

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

function QtyStepper({ qty, onChange }) {
  return (
    <div className="flex items-center border border-zinc-200">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, qty - 1))}
        className="cursor-pointer p-3 text-zinc-600 transition-colors hover:text-zinc-900"
      >
        <MinusIcon size={16} weight="light" />
      </button>
      <span aria-live="polite" className="min-w-10 text-center text-sm font-semibold text-zinc-900">
        {qty}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(99, qty + 1))}
        className="cursor-pointer p-3 text-zinc-600 transition-colors hover:text-zinc-900"
      >
        <PlusIcon size={16} weight="light" />
      </button>
    </div>
  )
}

/** Product detail page — gallery, buy box, specs, recently viewed and related products. */
export default function ProductPage() {
  const { id } = useParams()
  const product = getProductById(id)
  const [qty, setQty] = useState(1)
  const [recent, setRecent] = useState([])
  const { addItem } = useCart()
  const { has, toggle } = useWishlist()

  const wished = product ? has(product.id) : false

  usePageMeta(
    product ? product.name : 'Product not found',
    product ? product.description.slice(0, 155) : undefined,
  )

  // Track this product in "recently viewed" (max 5, most recent first)
  useEffect(() => {
    if (!product) return
    setRecent(readRecentlyViewed().filter((recentId) => recentId !== product.id))
    try {
      const next = [product.id, ...readRecentlyViewed().filter((r) => r !== product.id)].slice(0, 5)
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {
      /* storage unavailable */
    }
  }, [product])

  if (!product) return <NotFoundPage />

  const category = getCategoryForProduct(product)
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .concat(products.filter((p) => p.category !== product.category && p.id !== product.id))
    .slice(0, 3)

  const recentProducts = recent.map(getProductById).filter(Boolean)

  const thumbs = [
    `${product.imageLabel} (front)`,
    `${product.imageLabel} (angle)`,
    `${product.imageLabel} (in use)`,
  ]

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: 'Shop', to: '/shop' },
          ...(category ? [{ label: category.name, to: `/shop/${category.slug}` }] : []),
          { label: product.name },
        ]}
        title={product.name}
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Placeholder label={product.imageLabel} iconSize={48} className="aspect-square rounded-xl" />
            <div className="mt-4 grid grid-cols-3 gap-4" aria-hidden="true">
              {thumbs.map((label) => (
                <Placeholder key={label} label={label} iconSize={20} className="aspect-square rounded-lg" />
              ))}
            </div>
          </motion.div>

          {/* Buy box */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="flex flex-col"
          >
            <p className="text-[11px] tracking-[0.2em] text-zinc-500 uppercase">
              {category ? (
                <Link to={`/shop/${category.slug}`} className="transition-colors hover:text-zinc-900">
                  {category.name}
                </Link>
              ) : (
                product.category
              )}
            </p>

            {product.rating && (
              <div className="mt-3 flex items-center gap-1.5">
                <span className="flex gap-0.5">
                  {Array.from({ length: product.rating.stars }).map((_, i) => (
                    <StarIcon key={i} size={14} weight="fill" className="text-zinc-900" />
                  ))}
                </span>
                <span className="text-xs text-zinc-500">({product.rating.reviews} review)</span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-bold text-zinc-900">{formatPrice(product.price)}</span>
              <span className="text-base text-zinc-500 line-through">
                {formatPrice(product.compareAt)}
              </span>
              <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-white uppercase">
                {product.badge}
              </span>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-zinc-600">{product.description}</p>

            {product.highlights && (
              <ul className="mt-6 space-y-2.5">
                {product.highlights.map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-sm text-zinc-700">
                    <CheckCircleIcon size={18} weight="light" className="mt-0.5 shrink-0 text-zinc-900" />
                    {line}
                  </li>
                ))}
              </ul>
            )}

            {product.usage && (
              <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-5">
                <h2 className="text-[11px] font-semibold tracking-[0.2em] text-zinc-900 uppercase">
                  How to use
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-zinc-600">{product.usage}</p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <QtyStepper qty={qty} onChange={setQty} />
              <button
                type="button"
                onClick={() => addItem(product.id, qty)}
                className="flex flex-1 cursor-pointer items-center justify-center gap-3 bg-zinc-900 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white uppercase transition-colors hover:bg-zinc-800"
              >
                <ShoppingCartIcon size={16} weight="light" />
                Add to cart
              </button>
              <button
                type="button"
                aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                aria-pressed={wished}
                onClick={() => toggle(product.id)}
                className={`cursor-pointer border p-4 transition-colors ${
                  wished
                    ? 'border-zinc-900 text-zinc-900'
                    : 'border-zinc-300 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900'
                }`}
              >
                <HeartIcon size={18} weight={wished ? 'fill' : 'light'} />
              </button>
            </div>

            <ul className="mt-8 grid grid-cols-1 gap-3 border-t border-zinc-200 pt-6 sm:grid-cols-3">
              {valueProps.map((prop) => (
                <li key={prop.title} className="text-xs leading-relaxed text-zinc-500">
                  {prop.subtext}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Related */}
        <div className="mt-24 border-t border-zinc-200 pt-14 md:mt-32">
          <h2 className="font-display text-xl font-bold tracking-[0.12em] uppercase text-zinc-900 md:text-2xl">
            Complete the routine
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: index * 0.08, ease: 'easeOut' }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recently viewed */}
        {recentProducts.length > 0 && (
          <div className="mt-20 border-t border-zinc-200 pt-14 md:mt-24">
            <h2 className="font-display text-xl font-bold tracking-[0.12em] uppercase text-zinc-900 md:text-2xl">
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
    </>
  )
}

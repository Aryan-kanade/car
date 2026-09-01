import { Link } from 'react-router'
import { HeartIcon } from '@phosphor-icons/react/dist/csr/Heart'
import PageHeader from '../components/PageHeader'
import ProductCard from '../components/ProductCard'
import { products } from '../data/catalog'
import { useWishlist } from '../context/WishlistContext'
import { usePageMeta } from '../hooks/usePageMeta'

/** Wishlist — saved products with a graceful empty state. */
export default function WishlistPage() {
  const { ids } = useWishlist()

  usePageMeta('Wishlist', 'Your saved KMKIRAMYKI formulas and kits, ready when you are.')

  const saved = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean)

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Wishlist' }]}
        title="Wishlist"
        subtext={
          saved.length > 0
            ? `${saved.length} saved product${saved.length === 1 ? '' : 's'}.`
            : 'Tap the heart on any product to save it for later.'
        }
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        {saved.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-20 text-center">
            <HeartIcon
              size={44}
              weight="light"
              className="text-zinc-400 dark:text-zinc-500"
              aria-hidden="true"
            />
            <h2 className="font-display mt-6 text-2xl font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100">
              Nothing saved yet
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Browse the range and tap the heart on anything worth a second look. Your list stays on
              this device.
            </p>
            <Link
              to="/shop"
              className="mt-8 bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

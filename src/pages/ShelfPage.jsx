import { useState } from 'react'
import { Link } from 'react-router'
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import PageHeader from '../components/PageHeader'
import ProductCard from '../components/ProductCard'
import { formatPrice, getProductById, purchasableProducts } from '../data/catalog'
import { getRoutine } from '../data/quiz'
import { useCart } from '../context/CartContext'
import { usePageMeta } from '../hooks/usePageMeta'

const SHELF_KEY = 'kmkiramyki-shelf'

function readShelf() {
  try {
    const raw = window.localStorage.getItem(SHELF_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

/**
 * Virtual Shelf — products you already own, and the gaps in your routine.
 */
export default function ShelfPage() {
  usePageMeta('My Shelf', 'Track the products you own and see what is missing from your routine.')
  const [shelf, setShelf] = useState(readShelf)
  const { addItem } = useCart()

  const persist = (next) => {
    setShelf(next)
    try {
      window.localStorage.setItem(SHELF_KEY, JSON.stringify(next))
    } catch {
      /* storage unavailable */
    }
  }

  const toggle = (id) => {
    persist(shelf.includes(id) ? shelf.filter((item) => item !== id) : [...shelf, id])
  }

  const routine = getRoutine({ goal: 'maintain', focus: 'paint', method: 'any' })
  const missing = routine.items
    .map((item) => item.productId)
    .filter((id) => !shelf.includes(id))
    .map((id) => getProductById(id))
    .filter(Boolean)

  const owned = shelf.map((id) => getProductById(id)).filter(Boolean)

  const addMissing = () => {
    missing.forEach((product, index) => {
      addItem(product.id, 1, null, { openDrawer: index === missing.length - 1 })
    })
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'My Shelf' }]}
        title="My Shelf"
        subtext="Mark what you already own — the studio checks it against a complete routine and shows the gaps."
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        {/* Missing analysis */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-7">
          <h2 className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
            Missing from your routine
          </h2>
          {missing.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              Nothing — your shelf covers the full maintenance routine. A detailer after our own
              heart.
            </p>
          ) : (
            <>
              <ul className="mt-4 space-y-2.5">
                {missing.map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-4 text-sm">
                    <Link
                      to={`/product/${product.id}`}
                      className="text-zinc-700 dark:text-zinc-300 underline-offset-4 hover:underline"
                    >
                      {product.name}
                    </Link>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {formatPrice(product.price)}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={addMissing}
                className="mt-5 cursor-pointer bg-zinc-900 dark:bg-white px-6 py-3 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                Fill the gaps ({formatPrice(missing.reduce((total, p) => total + p.price, 0))})
              </button>
            </>
          )}
        </div>

        {/* Ownership grid */}
        <h2 className="font-display mt-14 text-xl font-bold tracking-[0.12em] uppercase text-zinc-900 dark:text-zinc-100">
          Tap what you own
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {purchasableProducts.map((product) => {
            const ownedHere = shelf.includes(product.id)
            return (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                <button
                  type="button"
                  onClick={() => toggle(product.id)}
                  aria-pressed={ownedHere}
                  aria-label={
                    ownedHere
                      ? `Remove ${product.name} from shelf`
                      : `Mark ${product.name} as owned`
                  }
                  className={`absolute -top-2 -right-2 z-10 flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase transition-colors ${
                    ownedHere
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-white'
                  }`}
                >
                  <CheckCircleIcon
                    size={13}
                    weight={ownedHere ? 'fill' : 'light'}
                    aria-hidden="true"
                  />
                  {ownedHere ? 'Owned' : 'Own it'}
                </button>
              </div>
            )
          })}
        </div>

        {owned.length > 0 && (
          <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-300">
            {owned.length} product{owned.length === 1 ? '' : 's'} on your shelf ·{' '}
            {formatPrice(owned.reduce((total, p) => total + p.price, 0))} invested in shine.
          </p>
        )}
      </div>
    </>
  )
}

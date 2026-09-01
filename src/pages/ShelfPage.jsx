import { useState } from 'react'
import { Link } from 'react-router'
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { FlaskIcon } from '@phosphor-icons/react/dist/csr/Flask'
import PageHeader from '../components/PageHeader'
import ProductCard from '../components/ProductCard'
import { formatPrice, getProductById, purchasableProducts } from '../data/catalog'
import { getRoutine } from '../data/quiz'
import { useCart } from '../context/CartContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { dayLabel, estimatedDelivery } from '../utils/delivery'

const SHELF_KEY = 'kmkiramyki-shelf'
/** Products marked as used up — the restock list. */
const EMPTY_KEY = 'kmkiramyki-shelf-empty'

function readShelf() {
  try {
    const raw = window.localStorage.getItem(SHELF_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

function readEmpty() {
  try {
    const raw = window.localStorage.getItem(EMPTY_KEY)
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
  const [empty, setEmpty] = useState(readEmpty)
  const { addItem } = useCart()

  const persist = (next) => {
    setShelf(next)
    try {
      window.localStorage.setItem(SHELF_KEY, JSON.stringify(next))
    } catch {
      /* storage unavailable */
    }
  }

  const persistEmpty = (next) => {
    setEmpty(next)
    try {
      window.localStorage.setItem(EMPTY_KEY, JSON.stringify(next))
    } catch {
      /* storage unavailable */
    }
  }

  const toggleEmpty = (id) => {
    persistEmpty(empty.includes(id) ? empty.filter((item) => item !== id) : [...empty, id])
  }

  const toggle = (id) => {
    const next = shelf.includes(id) ? shelf.filter((item) => item !== id) : [...shelf, id]
    persist(next)
    // Un-owning a product clears it from the restock list too
    if (!next.includes(id)) persistEmpty(empty.filter((item) => item !== id))
  }

  const restock = empty.map((id) => getProductById(id)).filter(Boolean)
  const arrivesBy = dayLabel(estimatedDelivery(null))

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
        {/* Restock list — products marked as used up */}
        {restock.length > 0 && (
          <div className="mb-8 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-7">
            <h2 className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.25em] text-amber-900 dark:text-amber-200 uppercase">
              <FlaskIcon size={15} weight="light" aria-hidden="true" />
              Time to restock
            </h2>
            <ul className="mt-4 space-y-2.5">
              {restock.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-wrap items-center justify-between gap-3 text-sm"
                >
                  <Link
                    to={`/product/${product.id}`}
                    className="text-amber-900 dark:text-amber-200 underline-offset-4 hover:underline"
                  >
                    {product.name}
                  </Link>
                  <span className="flex items-center gap-3">
                    <span className="font-medium text-amber-900 dark:text-amber-100">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        addItem(product.id)
                        persistEmpty(empty.filter((item) => item !== product.id))
                      }}
                      className="cursor-pointer bg-zinc-900 dark:bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.15em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
                    >
                      Reorder
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-amber-800 dark:text-amber-300">
              Order today — arrives by {arrivesBy}, before your usual wash weekend.
            </p>
          </div>
        )}

        {/* Missing analysis */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-7">
          <h2 className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
            Missing from your routine
          </h2>
          {missing.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-800 dark:text-zinc-300">
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
                      className="text-zinc-800 dark:text-zinc-300 underline-offset-4 hover:underline"
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
          {purchasableProducts.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
              {shelf.includes(product.id) ? (
                <div className="absolute -top-2 -right-2 z-10 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleEmpty(product.id)}
                    aria-pressed={empty.includes(product.id)}
                    aria-label={
                      empty.includes(product.id)
                        ? `${product.name} is being restocked — remove from restock list`
                        : `Mark ${product.name} as empty to restock it`
                    }
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase transition-colors ${
                      empty.includes(product.id)
                        ? 'bg-amber-500 text-white'
                        : 'border border-amber-400 dark:border-amber-700 bg-white dark:bg-zinc-950 text-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950'
                    }`}
                  >
                    <FlaskIcon size={13} weight="light" aria-hidden="true" />
                    {empty.includes(product.id) ? 'Restocking' : 'Empty'}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(product.id)}
                    aria-pressed
                    aria-label={`Remove ${product.name} from shelf`}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full bg-zinc-900 dark:bg-white px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white dark:text-zinc-900 uppercase"
                  >
                    <CheckCircleIcon size={13} weight="fill" aria-hidden="true" />
                    Owned
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => toggle(product.id)}
                  aria-pressed={false}
                  aria-label={`Mark ${product.name} as owned`}
                  className="absolute -top-2 -right-2 z-10 flex cursor-pointer items-center gap-1.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-zinc-800 dark:text-zinc-400 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
                >
                  <CheckCircleIcon size={13} weight="light" aria-hidden="true" />
                  Own it
                </button>
              )}
            </div>
          ))}
        </div>

        {owned.length > 0 && (
          <p className="mt-10 text-sm text-zinc-800 dark:text-zinc-300">
            {owned.length} product{owned.length === 1 ? '' : 's'} on your shelf ·{' '}
            {formatPrice(owned.reduce((total, p) => total + p.price, 0))} invested in shine.
          </p>
        )}
      </div>
    </>
  )
}

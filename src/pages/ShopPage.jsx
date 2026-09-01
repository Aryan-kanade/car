import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { m } from 'motion/react'
import { PackageIcon } from '@phosphor-icons/react/dist/csr/Package'
import PageHeader from '../components/PageHeader'
import ProductCard from '../components/ProductCard'
import NotFoundPage from './NotFoundPage'
import { categoryRoutes, products } from '../data/catalog'
import { usePageMeta } from '../hooks/usePageMeta'

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
  { value: 'saving', label: 'Biggest saving' },
]

function sortProducts(list, sort) {
  const sorted = [...list]
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'saving':
      return sorted.sort((a, b) => b.compareAt - b.price - (a.compareAt - a.price))
    default:
      return sorted
  }
}

/** Shop listing — /shop shows everything, /shop/:slug filters to one category. */
export default function ShopPage() {
  const { slug } = useParams()
  const category = slug ? categoryRoutes.find((c) => c.slug === slug) : null
  const [sort, setSort] = useState('featured')

  usePageMeta(
    category ? category.name : 'Shop All',
    category ? category.description : 'Every KMKIRAMYKI formula and tool in one place.'
  )

  // Unknown category slug → 404 (after all hooks have run)
  if (slug && !category) return <NotFoundPage />

  const visible = sortProducts(
    category ? products.filter((p) => p.category === category.productCategory) : products,
    sort
  )
  const isEmpty = visible.length === 0

  return (
    <>
      <PageHeader
        breadcrumb={category ? [{ label: 'Shop', to: '/shop' }] : []}
        title={category ? category.name : 'Shop All'}
        subtext={
          category ? category.description : 'Every formula and tool in the KMKIRAMYKI range.'
        }
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        {/* Category filter pills */}
        <nav aria-label="Filter by category" className="flex flex-wrap gap-2.5">
          <Link
            to="/shop"
            aria-current={!category ? 'page' : undefined}
            className={`cursor-pointer rounded-full border px-4 py-2 text-[11px] font-medium tracking-[0.15em] uppercase transition-colors ${
              !category
                ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All
          </Link>
          {categoryRoutes.map((c) => (
            <Link
              key={c.slug}
              to={`/shop/${c.slug}`}
              aria-current={category?.slug === c.slug ? 'page' : undefined}
              className={`cursor-pointer rounded-full border px-4 py-2 text-[11px] font-medium tracking-[0.15em] uppercase transition-colors ${
                category?.slug === c.slug
                  ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {isEmpty
              ? 'No products yet'
              : `${visible.length} product${visible.length === 1 ? '' : 's'}`}
          </p>
          {!isEmpty && (
            <label className="flex items-center gap-3 text-xs tracking-[0.15em] text-zinc-500 dark:text-zinc-400 uppercase">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="cursor-pointer rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2.5 text-sm tracking-normal text-zinc-900 dark:text-zinc-100 normal-case transition-colors hover:border-zinc-400 dark:hover:border-zinc-600 focus:border-zinc-900 dark:focus:border-white focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {isEmpty ? (
          /* Designed empty state (Accessories today) */
          <div className="mt-14 flex flex-col items-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-20 text-center">
            <PackageIcon
              size={44}
              weight="light"
              className="text-zinc-400 dark:text-zinc-500"
              aria-hidden="true"
            />
            <h2 className="font-display mt-6 text-2xl font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100">
              Dropping soon
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Studio-tested microfibres, applicators and brushes are in final testing. Join the
              waitlist and we will tell you the moment they land.
            </p>
            <Link
              to="/contact"
              className="mt-8 bg-zinc-900 dark:bg-white px-7 py-3.5 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Join the waitlist
            </Link>
          </div>
        ) : (
          <>
            <h2 className="sr-only">Products</h2>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((product, index) => (
                <m.div
                  key={product.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: 'easeOut' }}
                >
                  <ProductCard product={product} />
                </m.div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

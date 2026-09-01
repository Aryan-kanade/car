import { Link } from 'react-router'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import Placeholder from './Placeholder'
import { categoryRoutes, formatPrice, getProductById } from '../data/catalog'

const FEATURED_ID = 'complete-detail-kit'

/**
 * Desktop mega menu — opens on hover/focus of the Shop trigger.
 * Category grid on the left, featured kit on the right.
 */
export default function MegaMenu() {
  const featured = getProductById(FEATURED_ID)

  return (
    <div className="invisible absolute top-full left-0 z-50 w-[46rem] translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
      <div className="grid grid-cols-[1.25fr_1fr] overflow-hidden rounded-b-2xl bg-white dark:bg-zinc-950 shadow-2xl">
        {/* Categories */}
        <nav aria-label="Shop categories" className="p-6">
          <p className="px-3 text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
            Shop by category
          </p>
          <ul className="mt-3">
            {categoryRoutes.slice(0, 5).map((category) => (
              <li key={category.slug}>
                <Link
                  to={`/shop/${category.slug}`}
                  className="block rounded-lg px-3 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {category.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                    {category.tagline}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between px-3">
            <Link
              to="/shop"
              className="group/all flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-zinc-600 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              View all products
              <ArrowRightIcon
                size={13}
                weight="light"
                className="transition-transform duration-300 group-hover/all:translate-x-1"
              />
            </Link>
            <span className="flex items-center gap-4">
              <Link
                to="/quiz"
                className="text-[11px] font-semibold tracking-[0.2em] text-zinc-600 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                Find your routine
              </Link>
              <Link
                to="/builder"
                className="text-[11px] font-semibold tracking-[0.2em] text-zinc-600 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                Build your kit
              </Link>
              <Link
                to="/calculator"
                className="text-[11px] font-semibold tracking-[0.2em] text-zinc-600 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                Dilution calculator
              </Link>
            </span>
          </div>
        </nav>

        {/* Featured kit */}
        {featured && (
          <div className="border-l border-zinc-200 dark:border-zinc-800 p-6">
            <p className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
              Featured kit
            </p>
            <Link to={`/product/${featured.id}`} className="group mt-4 block">
              <Placeholder
                label={featured.imageLabel}
                iconSize={28}
                className="aspect-[4/3] rounded-lg transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {featured.name}
              </p>
              <p className="mt-1.5 flex items-baseline gap-2 text-sm">
                <span className="text-zinc-500 dark:text-zinc-400 line-through">
                  {formatPrice(featured.compareAt)}
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatPrice(featured.price)}
                </span>
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-zinc-600 dark:text-zinc-400 uppercase transition-colors group-hover:text-zinc-900 dark:group-hover:text-white dark:hover:text-white">
                View the kit
                <ArrowRightIcon size={13} weight="light" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

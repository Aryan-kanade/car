import { Link } from 'react-router'
import { m } from 'motion/react'
import { ArmchairIcon } from '@phosphor-icons/react/dist/csr/Armchair'
import { CarIcon } from '@phosphor-icons/react/dist/csr/Car'
import { SparkleIcon } from '@phosphor-icons/react/dist/csr/Sparkle'
import { SprayBottleIcon } from '@phosphor-icons/react/dist/csr/SprayBottle'
import { ToolboxIcon } from '@phosphor-icons/react/dist/csr/Toolbox'
import { categoryRoutes } from '../data/catalog'

const icons = {
  'clean-protect': SprayBottleIcon,
  'wheel-tire': CarIcon,
  interior: ArmchairIcon,
  glass: SparkleIcon,
  accessories: ToolboxIcon,
}

/** Quick category tiles — icon + name cards linking into the shop. */
export default function CategoryTiles() {
  const tiles = categoryRoutes.slice(0, 5)

  return (
    <section aria-label="Shop by category" className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((category, index) => {
          const Icon = icons[category.slug] ?? SprayBottleIcon
          return (
            <m.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' }}
            >
              <Link
                to={`/shop/${category.slug}`}
                className="group flex h-full flex-col items-center gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-8 text-center transition-colors hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-900"
              >
                <Icon
                  size={28}
                  weight="light"
                  aria-hidden="true"
                  className="text-zinc-900 dark:text-zinc-100 transition-transform duration-300 group-hover:scale-110"
                />
                <span className="text-xs font-semibold tracking-[0.12em] uppercase text-zinc-900 dark:text-zinc-100">
                  {category.name}
                </span>
              </Link>
            </m.div>
          )
        })}
      </div>
    </section>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/csr/ArrowUpRight'
import SectionHeader from './SectionHeader'
import Placeholder from './Placeholder'
import { categories } from '../data/catalog'

/**
 * Shop by Category — numbered editorial list. Hovering a row crossfades a
 * large image placeholder in behind the list, behind the row content.
 */
export default function CategoryList() {
  const [active, setActive] = useState(null)

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <SectionHeader title="Shop by Category" subtext="Every surface. Covered." />

      <div className="relative" onMouseLeave={() => setActive(null)}>
        {/* Hover preview — appears behind the list on large screens */}
        <div className="pointer-events-none absolute inset-y-6 right-0 hidden w-[52%] lg:block">
          <AnimatePresence mode="popLayout">
            {active !== null && (
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <Placeholder
                  label={categories[active].imageLabel}
                  iconSize={36}
                  className="h-full w-full rounded-lg opacity-90"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* The list */}
        <ul className="relative">
          {categories.map((category, index) => {
            const isActive = active === index
            return (
              <motion.li
                key={category.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.06, ease: 'easeOut' }}
              >
                <Link
                  to={category.to}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  className={`group relative z-10 flex items-center gap-6 border-t border-zinc-200 dark:border-zinc-800 px-2 py-7 transition-colors duration-300 md:gap-10 md:px-4 md:py-9 ${
                    isActive ? 'border-zinc-400 dark:border-zinc-600' : 'last:border-b'
                  }`}
                >
                  <span
                    className={`text-xs font-medium tracking-[0.2em] transition-colors duration-300 md:text-sm ${
                      isActive
                        ? 'text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {category.number}
                  </span>
                  <span
                    className={`font-display text-xl font-semibold tracking-[0.05em] uppercase transition-all duration-300 md:text-3xl lg:text-4xl ${
                      isActive
                        ? 'translate-x-2 text-zinc-900 dark:text-zinc-100 md:translate-x-3'
                        : 'text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white dark:hover:text-white'
                    }`}
                  >
                    {category.name}
                  </span>
                  <ArrowUpRightIcon
                    size={26}
                    weight="light"
                    className={`ml-auto shrink-0 transition-all duration-300 ${
                      isActive
                        ? 'translate-x-0 text-zinc-900 dark:text-zinc-100 opacity-100'
                        : '-translate-x-2 text-zinc-500 dark:text-zinc-400 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                    }`}
                  />
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

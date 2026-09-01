import { Link } from 'react-router'
import { m } from 'motion/react'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import Placeholder from './Placeholder'
import ScrubManifesto from './ScrubManifesto'
import { formatPrice, getProductById } from '../data/catalog'

const FEATURED_ID = 'complete-detail-kit'

/** Full-width featured banner for the flagship PRO kit. */
export default function FeaturedBanner() {
  const kit = getProductById(FEATURED_ID)
  if (!kit) return null

  const saving = kit.compareAt - kit.price

  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <m.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="grid overflow-hidden rounded-2xl lg:grid-cols-2"
      >
        {/* Copy */}
        <div className="flex flex-col justify-center gap-6 bg-zinc-900 dark:bg-white p-9 text-white dark:text-zinc-900 md:p-14">
          <h2 className="font-display text-3xl font-bold tracking-[0.06em] uppercase md:text-5xl">
            Everything.
            <br />
            One box.
          </h2>
          <ScrubManifesto className="text-zinc-300 dark:text-zinc-600" />
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-bold">{formatPrice(kit.price)}</span>
            <span className="text-sm text-zinc-300 dark:text-zinc-400 line-through">
              {formatPrice(kit.compareAt)}
            </span>
            <span className="rounded-full border border-white/40 dark:border-zinc-900/30 px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase">
              Save {formatPrice(saving)}
            </span>
          </div>
          <Link
            to={`/product/${kit.id}`}
            className="group mt-2 inline-flex w-fit items-center gap-3 bg-white dark:bg-zinc-900 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-white uppercase transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            Shop the PRO kit
            <ArrowRightIcon
              size={14}
              weight="light"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Image */}
        <div className="relative min-h-[280px] lg:min-h-[420px]">
          <Placeholder
            label={kit.imageLabel}
            iconSize={44}
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </m.div>
    </section>
  )
}

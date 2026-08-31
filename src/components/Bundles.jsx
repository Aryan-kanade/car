import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import SectionHeader from './SectionHeader'
import Placeholder from './Placeholder'
import { bundles, formatPrice } from '../data/catalog'

/** Curated Bundles — two large side-by-side split cards (WASH / PRO). */
export default function Bundles() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
      <SectionHeader
        title="Curated Bundles"
        subtext="Start with a kit. Finish faster."
        to="/kits"
      />

      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {bundles.map((bundle, index) => (
          <motion.div
            key={bundle.title}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: index * 0.12, ease: 'easeOut' }}
          >
            <Link
              to="/kits"
              className="group grid h-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 transition-colors duration-300 hover:bg-zinc-100/70"
            >
              {/* Copy */}
              <div className="order-2 flex flex-col justify-between gap-12 p-8 md:order-1 md:p-12">
                <div>
                  <h3 className="font-display text-6xl font-bold tracking-tight text-zinc-900 uppercase md:text-7xl">
                    {bundle.title}
                  </h3>
                  <p className="mt-7 text-sm text-zinc-600 md:text-base">{bundle.product}</p>
                  <p className="mt-3 flex items-baseline gap-3 text-sm md:text-base">
                    <span className="text-zinc-500 line-through">
                      {formatPrice(bundle.compareAt)}
                    </span>
                    <span className="font-semibold text-zinc-900">{formatPrice(bundle.price)}</span>
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.25em] text-zinc-600 uppercase transition-colors group-hover:text-zinc-900">
                  Shop Kit
                  <ArrowRightIcon
                    size={14}
                    weight="light"
                    className="transition-transform duration-300 group-hover:translate-x-1.5"
                  />
                </span>
              </div>

              {/* Image */}
              <div className="relative order-1 min-h-[260px] md:order-2 md:min-h-full">
                <Placeholder
                  label={bundle.imageLabel}
                  iconSize={36}
                  className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

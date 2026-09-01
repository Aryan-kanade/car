import { Link } from 'react-router'
import { m } from 'motion/react'
import { DropIcon } from '@phosphor-icons/react/dist/csr/Drop'
import BeadingSimulator from './BeadingSimulator'

/** "Only a detailing brand could make this" — the beading demo section. */
export default function BeadingSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <m.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <BeadingSimulator />
        </m.div>
        <m.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          <DropIcon
            size={30}
            weight="light"
            className="text-zinc-900 dark:text-zinc-100"
            aria-hidden="true"
          />
          <h2 className="font-display mt-5 text-2xl font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100 md:text-4xl">
            Watch water decide
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-base">
            On untreated paint, water spreads flat, clings, and dries into spots. On a hydrophobic
            layer it beads high, rolls off, and takes dirt with it. Toggle the treatment and see the
            physics our chemistry is built around.
          </p>
          <Link
            to="/shop/clean-protect"
            className="mt-8 inline-flex items-center gap-3 bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Shop protection
          </Link>
        </m.div>
      </div>
    </section>
  )
}

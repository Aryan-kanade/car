import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { motion } from 'framer-motion'

/** Shared section header: display-font title, muted subtext and a "View All →" link. */
export default function SectionHeader({ title, subtext, to = '/shop' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="mb-14 flex items-end justify-between gap-6 md:mb-20"
    >
      <div>
        <h2 className="font-display text-2xl font-bold tracking-[0.12em] uppercase text-zinc-900 md:text-4xl">
          {title}
        </h2>
        {subtext && <p className="mt-3 text-sm text-zinc-500 md:text-base">{subtext}</p>}
      </div>
      {to && (
        <Link
          to={to}
          className="group flex shrink-0 items-center gap-2 text-[11px] font-medium tracking-[0.2em] text-zinc-500 uppercase transition-colors hover:text-zinc-900"
        >
          View All
          <ArrowRightIcon
            size={14}
            weight="light"
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
      )}
    </motion.div>
  )
}

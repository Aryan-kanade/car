import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'

const steps = [
  {
    number: '01',
    title: 'Pre-Wash',
    body: 'Loosen traffic film without touching paint.',
    to: '/product/pre-wash-shampoo',
  },
  {
    number: '02',
    title: 'Contact Wash',
    body: 'Two buckets, plush mitt, pH-balanced shampoo.',
    to: '/shop/clean-protect',
  },
  {
    number: '03',
    title: 'Decontaminate',
    body: 'Dissolve bonded iron and brake dust.',
    to: '/shop/wheel-tire',
  },
  {
    number: '04',
    title: 'Protect & Dress',
    body: 'Lock in the finish for the season ahead.',
    to: '/kits',
  },
]

/** The Routine — four-step editorial strip linking the wash process to products. */
export default function RoutineStrip() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
          >
            <Link
              to={step.to}
              className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-zinc-50 p-7 transition-colors hover:bg-white hover:border-zinc-400"
            >
              <span className="text-xs font-medium tracking-[0.2em] text-zinc-400">{step.number}</span>
              <span className="font-display mt-4 text-lg font-bold tracking-[0.04em] uppercase text-zinc-900">
                {step.title}
              </span>
              <span className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">{step.body}</span>
              <ArrowRightIcon
                size={16}
                weight="light"
                className="mt-5 text-zinc-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-zinc-900"
              />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

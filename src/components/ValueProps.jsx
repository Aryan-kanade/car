import { motion } from 'framer-motion'
import { DropIcon } from '@phosphor-icons/react/dist/csr/Drop'
import { SealCheckIcon } from '@phosphor-icons/react/dist/csr/SealCheck'
import { ShieldCheckIcon } from '@phosphor-icons/react/dist/csr/ShieldCheck'
import { valueProps } from '../data/catalog'

const icons = {
  droplets: DropIcon,
  shield: ShieldCheckIcon,
  guarantee: SealCheckIcon,
}

/** Value proposition trio — hairline-divided row of icon, title and subtext. */
export default function ValueProps() {
  return (
    <section className="border-y border-zinc-200 bg-zinc-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-zinc-200 px-6 py-16 sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:py-20">
        {valueProps.map((prop, index) => {
          const Icon = icons[prop.icon]
          return (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: index * 0.12, ease: 'easeOut' }}
              className="flex flex-col items-center px-6 py-10 text-center sm:py-0 sm:first:pl-0 sm:last:pr-0"
            >
              <Icon size={30} weight="light" className="text-zinc-900" aria-hidden="true" />
              <h3 className="mt-6 text-xs font-semibold tracking-[0.2em] text-zinc-900 uppercase">
                {prop.title}
              </h3>
              <p className="mt-2.5 text-sm text-zinc-500">{prop.subtext}</p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

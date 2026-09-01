import { Link } from 'react-router'
import { m } from 'motion/react'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import Placeholder from './Placeholder'
import { about } from '../data/content'

/** Brand story strip — image, story intro and stats, linking to About. */
export default function StoryStrip() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <m.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Placeholder
            label={about.sections[1].imageLabel}
            iconSize={44}
            className="aspect-[4/3] rounded-xl"
          />
        </m.div>
        <m.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          <h2 className="font-display text-2xl font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100 md:text-4xl">
            {about.headline}
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-zinc-800 dark:text-zinc-400 md:text-base">
            {about.intro}
          </p>

          <dl className="mt-8 grid grid-cols-3 gap-6 border-t border-zinc-200 dark:border-zinc-800 pt-7">
            {about.stats.map((stat) => (
              <div key={stat.label}>
                <dd className="font-display text-3xl font-bold text-zinc-900 dark:text-zinc-100 md:text-4xl">
                  {stat.value}
                </dd>
                <dt className="mt-1.5 text-xs text-zinc-800 dark:text-zinc-400">{stat.label}</dt>
              </div>
            ))}
          </dl>

          <Link
            to="/about"
            className="group mt-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase"
          >
            <span className="border-b border-zinc-300 dark:border-zinc-700 pb-1 transition-colors group-hover:border-zinc-900 dark:group-hover:border-white">
              Our story
            </span>
            <ArrowRightIcon
              size={14}
              weight="light"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </m.div>
      </div>
    </section>
  )
}

import { Link } from 'react-router'
import { m } from 'motion/react'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import PageHeader from '../components/PageHeader'
import Placeholder from '../components/Placeholder'
import { about } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'

/** About — brand story with alternating image/text sections and a stats row. */
export default function AboutPage() {
  usePageMeta(
    'About Us',
    'KMKIRAMYKI formulates, not relabels — in-house detailing chemistry tested on real paint.'
  )
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'About Us' }]}
        title={about.headline}
        subtext={about.intro}
      />

      {/* Stats */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <dl className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-zinc-200 dark:divide-zinc-800 px-6 py-10 sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:py-12">
          {about.stats.map((stat) => (
            <div key={stat.label} className="px-6 py-6 text-center sm:py-0">
              <dt className="order-2 mt-2 text-xs tracking-[0.15em] text-zinc-800 dark:text-zinc-400 uppercase sm:mt-3">
                {stat.label}
              </dt>
              <dd className="font-display order-1 text-4xl font-bold text-zinc-900 dark:text-zinc-100 md:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Story sections */}
      <div className="mx-auto max-w-7xl space-y-20 px-6 py-16 md:space-y-28 md:py-24">
        {about.sections.map((section, index) => (
          <m.div
            key={section.title}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="grid items-center gap-10 md:grid-cols-2 md:gap-16"
          >
            <div className={index % 2 === 1 ? 'md:order-2' : ''}>
              <Placeholder
                label={section.imageLabel}
                iconSize={44}
                className="aspect-[4/3] rounded-xl"
              />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100 md:text-3xl">
                {section.title}
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-zinc-800 dark:text-zinc-400 md:text-base">
                {section.body}
              </p>
            </div>
          </m.div>
        ))}
      </div>

      {/* CTA */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-16 text-center md:py-20">
          <h2 className="font-display text-2xl font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100 md:text-3xl">
            Try the chemistry
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
            Every bottle carries the 60-day performance guarantee. If it does not outperform what
            you use today, it is on us.
          </p>
          <Link
            to="/shop"
            className="group mt-8 inline-flex items-center gap-3 bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Shop the range
            <ArrowRightIcon
              size={14}
              weight="light"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </>
  )
}

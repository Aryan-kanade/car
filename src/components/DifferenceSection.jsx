import { Link } from 'react-router'
import { m } from 'motion/react'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import BeforeAfterSlider from './BeforeAfterSlider'
import SectionHeader from './SectionHeader'

/** "The KMKIRAMYKI difference" — before/after comparison showcase. */
export default function DifferenceSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24">
      <SectionHeader
        title="The Difference"
        subtext="Drag the handle. Same panel, same light — one KMKIRAMYKI session apart."
        to="/shop"
      />

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-center">
        <m.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <BeforeAfterSlider
            beforeLabel="Swirl-marked, dull paint under harsh light before detailing"
            afterLabel="Glossy, corrected paint reflecting light after a KMKIRAMYKI session"
          />
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          <ul className="space-y-6">
            {[
              {
                title: 'Correct, do not cover',
                body: 'Our chemistry cleans at the surface level — no fillers, no glazes pretending to be fixes.',
              },
              {
                title: 'Gloss that survives weeks',
                body: 'pH-balanced protection layers beading water long after the drive home.',
              },
              {
                title: 'Photograph-honest results',
                body: 'Every before/after on this site is shot in the same light, same angle, zero retouching.',
              },
            ].map((item) => (
              <li key={item.title} className="border-l-2 border-zinc-900 dark:border-white pl-5">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>

          <Link
            to="/shop"
            className="group mt-8 inline-flex items-center gap-3 bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Shop the formulas
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

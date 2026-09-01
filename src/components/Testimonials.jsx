import { m } from 'motion/react'
import { QuotesIcon } from '@phosphor-icons/react/dist/csr/Quotes'
import { StarIcon } from '@phosphor-icons/react/dist/csr/Star'
import SectionHeader from './SectionHeader'
import { testimonials } from '../data/content'

/** Social proof — three enthusiast quotes between bundles and value props. */
export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
      <SectionHeader
        title="Loved by Detailers"
        subtext="Real cars. Real paint. Real results."
        to="/about"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <m.figure
            key={testimonial.name}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: index * 0.1, ease: 'easeOut' }}
            className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-8"
          >
            <QuotesIcon
              size={28}
              weight="light"
              className="text-zinc-800 dark:text-zinc-500"
              aria-hidden="true"
            />
            <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-zinc-800 dark:text-zinc-300">
              {testimonial.quote}
            </blockquote>
            <figcaption className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-5">
              <span
                role="img"
                className="flex gap-0.5"
                aria-label={`Rated ${testimonial.stars} out of 5 stars`}
              >
                {Array.from({ length: testimonial.stars }).map((_, i) => (
                  <StarIcon
                    key={i}
                    size={12}
                    weight="fill"
                    className="text-zinc-900 dark:text-zinc-100"
                  />
                ))}
              </span>
              <p className="mt-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {testimonial.name}
              </p>
              <p className="mt-0.5 text-xs text-zinc-800 dark:text-zinc-400">{testimonial.car}</p>
            </figcaption>
          </m.figure>
        ))}
      </div>
    </section>
  )
}

import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import PageHeader from '../components/PageHeader'
import NotFoundPage from './NotFoundPage'
import { getNoteBySlug } from '../data/notes'
import { usePageMeta } from '../hooks/usePageMeta'

/** A single Lab Notes guide. */
export default function NotePage() {
  const { slug } = useParams()
  const note = getNoteBySlug(slug)

  usePageMeta(note ? note.title : 'Guide not found', note ? note.dek : undefined)

  if (!note) return <NotFoundPage />

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: note.title,
    description: note.dek,
    datePublished: note.date,
    author: { '@type': 'Organization', name: 'KMKIRAMYKI' },
  }

  return (
    <>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>

      <PageHeader
        breadcrumb={[{ label: 'Lab Notes', to: '/notes' }, { label: note.title }]}
        title={note.title}
        subtext={`${note.dek} · ${note.readingTime}`}
      />

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mx-auto max-w-3xl px-6 py-14 md:py-20"
      >
        {note.sections.map((section) => (
          <section
            key={section.heading}
            className="border-t border-zinc-200 py-9 first:border-t-0 first:pt-0"
          >
            <h2 className="font-display text-lg font-bold tracking-[0.06em] uppercase text-zinc-900 md:text-xl">
              {section.heading}
            </h2>
            <div className="mt-4 space-y-4">
              {section.body.map((paragraph, index) => (
                <p
                  key={index}
                  className="max-w-[70ch] text-sm leading-relaxed text-zinc-600 md:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
          <h2 className="font-display text-lg font-bold tracking-[0.08em] uppercase text-zinc-900">
            Shop the formulas in this guide
          </h2>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-zinc-600">
            Every routine in Lab Notes runs on KMKIRAMYKI chemistry — coating-safe and pH-balanced
            by default.
          </p>
          <Link
            to="/shop"
            className="group mt-6 inline-flex items-center gap-3 bg-zinc-900 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white uppercase transition-colors hover:bg-zinc-800"
          >
            Browse products
            <ArrowRightIcon
              size={14}
              weight="light"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </motion.article>
    </>
  )
}

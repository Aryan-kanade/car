import { Link } from 'react-router'
import { m } from 'motion/react'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import PageHeader from '../components/PageHeader'
import Placeholder from '../components/Placeholder'
import { notes } from '../data/notes'
import { usePageMeta } from '../hooks/usePageMeta'

/** Lab Notes index — detailing guides from the studio. */
export default function NotesIndexPage() {
  usePageMeta(
    'Lab Notes',
    'Detailing guides from the KMKIRAMYKI studio — wash method, decontamination, coating prep.'
  )

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Lab Notes' }]}
        title="Lab Notes"
        subtext="Field guides from the studio: the routines, the chemistry and the small details that separate clean from flawless."
      />

      <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {notes.map((note, index) => (
            <m.article
              key={note.slug}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: index * 0.08, ease: 'easeOut' }}
              className="group flex flex-col"
            >
              <Link to={`/notes/${note.slug}`} aria-label={note.title} className="block">
                <Placeholder
                  label={`Editorial photo for: ${note.title}`}
                  iconSize={32}
                  className="aspect-[16/10] rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </Link>
              <div className="mt-5 flex flex-1 flex-col">
                <p className="text-[11px] tracking-[0.2em] text-zinc-600 dark:text-zinc-400 uppercase">
                  {note.category} · {note.readingTime}
                </p>
                <h2 className="font-display mt-2.5 text-lg font-bold tracking-[0.04em] uppercase text-zinc-900 dark:text-zinc-100">
                  <Link
                    to={`/notes/${note.slug}`}
                    className="transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {note.title}
                  </Link>
                </h2>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {note.dek}
                </p>
                <Link
                  to={`/notes/${note.slug}`}
                  className="group/link mt-5 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-zinc-600 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
                >
                  Read the guide
                  <ArrowRightIcon
                    size={14}
                    weight="light"
                    className="transition-transform duration-300 group-hover/link:translate-x-1"
                  />
                </Link>
              </div>
            </m.article>
          ))}
        </div>
      </div>
    </>
  )
}

import PageHeader from '../components/PageHeader'
import NotFoundPage from './NotFoundPage'
import { contentPages } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * Generic content page driven by data/content.js — powers shipping,
 * returns, accessibility, terms and privacy without duplicating layouts.
 */
export default function ContentPage({ slug }) {
  const page = contentPages[slug]

  usePageMeta(page ? page.title : 'Page not found', page ? page.intro.slice(0, 155) : undefined)

  if (!page) return <NotFoundPage />

  return (
    <>
      <PageHeader breadcrumb={[{ label: page.title }]} title={page.title} subtext={page.intro} />

      <div className="mx-auto max-w-3xl px-6 py-14 md:py-20">
        {page.sections.map((section) => (
          <section
            key={section.heading}
            className="border-t border-zinc-200 dark:border-zinc-800 py-8 first:border-t-0 first:pt-0"
          >
            <h2 className="font-display text-lg font-bold tracking-[0.06em] uppercase text-zinc-900 dark:text-zinc-100">
              {section.heading}
            </h2>
            <div className="mt-4 space-y-4">
              {section.body.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
        <p className="mt-10 text-xs text-zinc-500 dark:text-zinc-400">
          Last updated: {page.updated}
        </p>
      </div>
    </>
  )
}

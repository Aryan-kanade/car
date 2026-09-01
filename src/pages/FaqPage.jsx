import { useState } from 'react'
import { Link } from 'react-router'
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import PageHeader from '../components/PageHeader'
import { faqs } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'

/**
 * Native <details> accordion — zero JS per item, height-animated with
 * ::details-content (Baseline Sept 2025) where supported.
 */
function AccordionItem({ q, a, index }) {
  return (
    <details
      open={index === 0}
      className="faq-item group border-t border-zinc-200 dark:border-zinc-800 last:border-b"
    >
      <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 md:text-base">
          {q}
        </span>
        <span className="shrink-0 rounded-full border border-zinc-200 dark:border-zinc-800 p-2 text-zinc-800 dark:text-zinc-400">
          <span className="block group-open:hidden">
            <PlusIcon size={14} weight="light" />
          </span>
          <span className="hidden group-open:block">
            <MinusIcon size={14} weight="light" />
          </span>
        </span>
      </summary>
      <p className="max-w-[70ch] pb-6 text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
        {a}
      </p>
    </details>
  )
}

/** Help & FAQ — accessible accordion with live filter. */
export default function FaqPage() {
  const [query, setQuery] = useState('')

  usePageMeta(
    'Help & FAQ',
    'Dilutions, shipping, coating safety and the 60-day guarantee — answered.'
  )

  const needle = query.trim().toLowerCase()
  const visibleFaqs = needle
    ? faqs.filter(
        (faq) => faq.q.toLowerCase().includes(needle) || faq.a.toLowerCase().includes(needle)
      )
    : faqs

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Help & FAQ' }]}
        title="Help & FAQ"
        subtext="Dilutions, shipping, safety and the 60-day guarantee — answered. Anything else, the contact page reaches a human."
      />
      <div className="mx-auto max-w-2xl px-6 py-14 md:py-20">
        <div>
          <label
            htmlFor="faq-filter"
            className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase"
          >
            Search questions
          </label>
          <input
            id="faq-filter"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Shipping, dilution, guarantee…"
            className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none"
          />
          <p aria-live="polite" className="mt-2.5 text-xs text-zinc-800 dark:text-zinc-400">
            {visibleFaqs.length} question{visibleFaqs.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="mt-8">
          {visibleFaqs.length === 0 ? (
            <p className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-5 py-8 text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
              Nothing matches “{query.trim()}”. Try a broader word, or ask us directly via the{' '}
              <Link
                to="/contact"
                className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4"
              >
                contact page
              </Link>
              .
            </p>
          ) : (
            visibleFaqs.map((faq) => (
              <AccordionItem key={faq.q} q={faq.q} a={faq.a} index={faqs.indexOf(faq)} />
            ))
          )}
        </div>
      </div>
    </>
  )
}

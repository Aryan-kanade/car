import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import PageHeader from '../components/PageHeader'
import { faqs } from '../data/content'
import { usePageMeta } from '../hooks/usePageMeta'

function AccordionItem({ q, a, index }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 last:border-b">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
        className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left"
      >
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 md:text-base">
          {q}
        </span>
        <span className="shrink-0 rounded-full border border-zinc-200 dark:border-zinc-800 p-2 text-zinc-600 dark:text-zinc-400">
          {open ? <MinusIcon size={14} weight="light" /> : <PlusIcon size={14} weight="light" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-answer-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="max-w-[70ch] pb-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Help & FAQ — accessible accordion with real answers. */
export default function FaqPage() {
  usePageMeta(
    'Help & FAQ',
    'Dilutions, shipping, coating safety and the 60-day guarantee — answered.'
  )
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Help & FAQ' }]}
        title="Help & FAQ"
        subtext="Dilutions, shipping, safety and the 60-day guarantee — answered. Anything else, the contact page reaches a human."
      />
      <div className="mx-auto max-w-2xl px-6 py-14 md:py-20">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.q} q={faq.q} a={faq.a} index={index} />
        ))}
      </div>
    </>
  )
}

import { useState } from 'react'
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt'
import { SealCheckIcon } from '@phosphor-icons/react/dist/csr/SealCheck'
import PageHeader from '../components/PageHeader'
import { usePageMeta } from '../hooks/usePageMeta'

const inputClasses =
  'w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none'

/** Contact — visible labels, inline success state. */
export default function ContactPage() {
  const [sent, setSent] = useState(false)

  usePageMeta(
    'Contact Us',
    'Product advice, order help and accessibility reports — straight to the studio.'
  )

  if (sent) {
    return (
      <>
        <PageHeader breadcrumb={[{ label: 'Contact Us' }]} title="Contact Us" />
        <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center md:py-32">
          <SealCheckIcon
            size={48}
            weight="light"
            className="text-zinc-900 dark:text-zinc-100"
            aria-hidden="true"
          />
          <h2 className="font-display mt-6 text-2xl font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100">
            Message received
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Thanks for writing in. A human from the studio replies within one working day —
            accessibility reports jump the queue.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-8 cursor-pointer border border-zinc-300 dark:border-zinc-700 px-7 py-3.5 text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
          >
            Send another message
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Contact Us' }]}
        title="Contact Us"
        subtext="Product advice, order help, accessibility reports or the accessories waitlist — this form reaches the studio directly."
      />
      <div className="mx-auto max-w-xl px-6 py-14 md:py-20">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSent(true)
          }}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="contact-name"
              className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase"
            >
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Your name"
              className={inputClasses}
            />
          </div>
          <div>
            <label
              htmlFor="contact-email"
              className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase"
            >
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={inputClasses}
            />
          </div>
          <div>
            <label
              htmlFor="contact-message"
              className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              rows={5}
              placeholder="How can we help?"
              className={`${inputClasses} resize-y`}
            />
          </div>
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-center gap-3 bg-zinc-900 dark:bg-white py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            <PaperPlaneTiltIcon size={16} weight="light" />
            Send message
          </button>
        </form>
      </div>
    </>
  )
}

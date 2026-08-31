import { useState } from 'react'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { SealCheckIcon } from '@phosphor-icons/react/dist/csr/SealCheck'

/** Footer newsletter — labelled email form with inline success state. */
export default function Newsletter() {
  const [subscribed, setSubscribed] = useState(false)

  if (subscribed) {
    return (
      <div
        role="status"
        className="flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3.5"
      >
        <SealCheckIcon
          size={20}
          weight="light"
          className="shrink-0 text-zinc-900"
          aria-hidden="true"
        />
        <p className="text-sm text-zinc-700">You are on the list. Welcome to the studio.</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        setSubscribed(true)
      }}
      className="flex w-full max-w-sm flex-col gap-2.5"
    >
      <label
        htmlFor="newsletter-email"
        className="text-xs font-medium tracking-[0.15em] text-zinc-700 uppercase"
      >
        Join the studio list
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="min-w-0 flex-1 rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-900 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Subscribe to the newsletter"
          className="group flex cursor-pointer items-center justify-center rounded-md bg-zinc-900 px-5 text-white transition-colors hover:bg-zinc-800"
        >
          <ArrowRightIcon
            size={16}
            weight="light"
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </button>
      </div>
      <p className="text-xs text-zinc-500">Drops, restocks and lab notes. No spam, ever.</p>
    </form>
  )
}

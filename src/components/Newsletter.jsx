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
        className="flex items-center gap-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3.5"
      >
        <SealCheckIcon
          size={20}
          weight="light"
          className="shrink-0 text-zinc-900 dark:text-zinc-100"
          aria-hidden="true"
        />
        <p className="text-sm text-zinc-800 dark:text-zinc-300">
          You are on the list. Welcome to the studio.
        </p>
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
        className="text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase"
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
          className="min-w-0 flex-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Subscribe to the newsletter"
          className="group flex cursor-pointer items-center justify-center rounded-md bg-zinc-900 dark:bg-white px-5 text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          <ArrowRightIcon
            size={16}
            weight="light"
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </button>
      </div>
      <p className="text-xs text-zinc-800 dark:text-zinc-400">
        Drops, restocks and lab notes. No spam, ever.
      </p>
    </form>
  )
}

import { Link } from 'react-router'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { usePageMeta } from '../hooks/usePageMeta'

/** 404 — on-brand, with a route back into the store. */
export default function NotFoundPage() {
  usePageMeta('Page Not Found', 'The page you are looking for has been polished away.')

  return (
    <div className="relative flex min-h-[calc(100svh-5rem)] flex-col items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-900 px-6 py-24 text-center">
      <p className="text-xs font-medium tracking-[0.35em] text-zinc-500 dark:text-zinc-400 uppercase">
        Error 404
      </p>
      <h1 className="font-display mt-4 text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase md:text-9xl">
        Lost the gloss
      </h1>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        The page you are looking for has been polished away. The rest of the studio is exactly where
        you left it.
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          to="/"
          className="group inline-flex items-center justify-center gap-3 bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          Back home
          <ArrowRightIcon
            size={14}
            weight="light"
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </Link>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center border border-zinc-300 dark:border-zinc-700 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
        >
          Shop the range
        </Link>
      </div>
    </div>
  )
}

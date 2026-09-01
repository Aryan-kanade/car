import { Link } from 'react-router'

/**
 * Brand lockup — wordmark + "Advanced Chemistry" subline.
 */
export default function Logo() {
  return (
    <Link to="/" aria-label="KMKIRAMYKI — home" className="flex flex-col leading-none select-none">
      <span className="font-display text-base font-bold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 md:text-lg">
        KMKIRAMYKI
      </span>
      <span className="mt-1.5 text-[9px] font-medium tracking-[0.32em] text-zinc-500 dark:text-zinc-400 uppercase">
        Advanced Chemistry
      </span>
    </Link>
  )
}

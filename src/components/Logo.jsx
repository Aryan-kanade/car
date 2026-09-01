import { Link } from 'react-router'

/** K monogram badge — same geometry as the favicon, theme-aware. */
function Monogram({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="shrink-0 rounded-[22%] bg-zinc-900 dark:bg-white"
    >
      <path
        d="M21 14 V50 M21 33 L39 14 M26 31 L43 50"
        stroke="#fafafa"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="dark:[stroke:#09090b]"
      />
    </svg>
  )
}

/**
 * Brand lockup — monogram badge + wordmark + "Advanced Chemistry" subline.
 * Matches the favicon and og-image identity.
 */
export default function Logo() {
  return (
    <Link to="/" aria-label="KMKIRAMYKI — home" className="flex items-center gap-3 select-none">
      <Monogram size={36} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-bold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 md:text-lg">
          KMKIRAMYKI
        </span>
        <span className="mt-1.5 text-[9px] font-medium tracking-[0.32em] text-zinc-500 dark:text-zinc-400 uppercase">
          Advanced Chemistry
        </span>
      </span>
    </Link>
  )
}

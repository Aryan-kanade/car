/** Shimmering block used by the route-loading skeleton. */
function Shimmer({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 ${className}`}
      aria-hidden="true"
    />
  )
}

/**
 * Route-loading skeleton — mirrors a typical page shape (header band +
 * content grid) so lazy route swaps feel instant instead of blank.
 */
export default function RouteFallback() {
  return (
    <div role="status" aria-label="Loading page" className="mx-auto max-w-7xl px-6 py-14 md:py-20">
      <span className="sr-only">Loading…</span>

      {/* Page header band */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-8 md:p-12">
        <Shimmer className="h-3 w-40" />
        <Shimmer className="mt-5 h-10 w-72 max-w-full" />
        <Shimmer className="mt-4 h-4 w-96 max-w-full" />
      </div>

      {/* Content grid */}
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-4">
            <Shimmer className="aspect-[4/5]" />
            <Shimmer className="h-3 w-24" />
            <Shimmer className="h-4 w-40 max-w-full" />
            <Shimmer className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  )
}

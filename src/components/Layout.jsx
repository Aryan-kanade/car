import { Suspense, useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import Navbar from './Navbar'
import Footer from './Footer'
import SearchOverlay from './SearchOverlay'
import CartDrawer from './CartDrawer'
import BackToTop from './BackToTop'
import BottomNav from './BottomNav'
import ErrorBoundary from './ErrorBoundary'
import { useCart } from '../context/CartContext'
import { prefetchRoutes } from '../utils/prefetch'

/** Resets scroll on every route change so new pages open at the top. */
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

/** Minimal route fallback while lazy pages load. */
function RouteFallback() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-label="Loading page"
    >
      <span className="font-display text-sm font-bold tracking-[0.4em] text-zinc-300 dark:text-zinc-600 uppercase select-none">
        KMKIRAMYKI
      </span>
    </div>
  )
}

/** Shared chrome: fixed navbar, routed page content, footer, overlays. */
export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { announcement } = useCart()

  // Warm lazy route chunks once the browser is idle
  useEffect(() => {
    prefetchRoutes()
  }, [])

  return (
    <div
      id="top"
      className="flex min-h-screen flex-col bg-white dark:bg-zinc-950 pb-16 lg:pb-0 font-sans text-zinc-900 dark:text-zinc-100 antialiased"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-100 focus:rounded-md focus:bg-zinc-900 dark:focus:bg-white focus:px-4 focus:py-2.5 focus:text-xs focus:font-semibold focus:tracking-[0.2em] focus:text-white dark:focus:text-zinc-900 focus:uppercase"
      >
        Skip to content
      </a>
      {/* Screen-reader announcements for cart changes */}
      <p aria-live="polite" className="sr-only">
        {announcement.key > 0 && <span key={announcement.key}>{announcement.message}</span>}
      </p>
      <ScrollToTop />
      <header className="fixed inset-x-0 top-0 z-50">
        <Navbar onOpenSearch={() => setSearchOpen(true)} />
      </header>

      <main id="main-content" className="flex-1 pt-16 md:pt-20">
        {/* Native View Transitions drive route fades (viewTransition on Links) */}
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
      <BottomNav onOpenSearch={() => setSearchOpen(true)} />
      <BackToTop />
    </div>
  )
}

/** Breadcrumb helper for inner pages — sentence case, sits above the page title. */
export function Breadcrumb({ items }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        ...(item.to ? { item: item.to } : {}),
      })),
    ],
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-zinc-500 dark:text-zinc-400">
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="transition-colors hover:text-zinc-900 dark:hover:text-white">
            Home
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600">
              /
            </span>
            {item.to ? (
              <Link
                to={item.to}
                className="transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-zinc-900 dark:text-zinc-100">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

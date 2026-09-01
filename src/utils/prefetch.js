// Warm the lazy route chunks once the browser is idle so that
// first navigation to any page is instant. Dynamic import
// specifiers match App.jsx, so Vite shares the same chunks.

export function prefetchRoutes() {
  if (typeof window === 'undefined') return

  const idle = window.requestIdleCallback ?? ((callback) => window.setTimeout(callback, 2000))

  idle(() => {
    const routes = [
      import('./../pages/HomePage'),
      import('./../pages/ShopPage'),
      import('./../pages/ProductPage'),
      import('./../pages/KitsPage'),
      import('./../pages/CartPage'),
      import('./../pages/CheckoutPage'),
      import('./../pages/FaqPage'),
      import('./../pages/OrderLookupPage'),
      import('./../pages/ContactPage'),
      import('./../pages/AboutPage'),
      import('./../pages/ContentPage'),
      import('./../pages/SitemapPage'),
      import('./../pages/WishlistPage'),
      import('./../pages/NotesIndexPage'),
      import('./../pages/NotePage'),
      import('./../pages/NotFoundPage'),
    ]
    Promise.allSettled(routes)
  })
}

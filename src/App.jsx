import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'

// Route-level code splitting — the home page ships eager, everything else lazy
const ShopPage = lazy(() => import('./pages/ShopPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const KitsPage = lazy(() => import('./pages/KitsPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const OrderLookupPage = lazy(() => import('./pages/OrderLookupPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContentPage = lazy(() => import('./pages/ContentPage'))
const SitemapPage = lazy(() => import('./pages/SitemapPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="shop/:slug" element={<ShopPage />} />
                <Route path="product/:id" element={<ProductPage />} />
                <Route path="kits" element={<KitsPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="help" element={<FaqPage />} />
                <Route path="order-lookup" element={<OrderLookupPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="shipping" element={<ContentPage slug="shipping" />} />
                <Route path="returns" element={<ContentPage slug="returns" />} />
                <Route path="accessibility" element={<ContentPage slug="accessibility" />} />
                <Route path="terms" element={<ContentPage slug="terms" />} />
                <Route path="privacy" element={<ContentPage slug="privacy" />} />
                <Route path="sitemap" element={<SitemapPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </BrowserRouter>
    </MotionConfig>
  )
}

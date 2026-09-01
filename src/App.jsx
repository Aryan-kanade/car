import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { LoyaltyProvider } from './context/LoyaltyContext'
import { GarageProvider } from './context/GarageContext'
import Layout from './components/Layout'

// Route-level code splitting — every page is lazy; idle prefetch warms them after load
const HomePage = lazy(() => import('./pages/HomePage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const KitsPage = lazy(() => import('./pages/KitsPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const OrderLookupPage = lazy(() => import('./pages/OrderLookupPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContentPage = lazy(() => import('./pages/ContentPage'))
const SitemapPage = lazy(() => import('./pages/SitemapPage'))
const NotesIndexPage = lazy(() => import('./pages/NotesIndexPage'))
const NotePage = lazy(() => import('./pages/NotePage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'))
const BuilderPage = lazy(() => import('./pages/BuilderPage'))
const QuizPage = lazy(() => import('./pages/QuizPage'))
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const GaragePage = lazy(() => import('./pages/GaragePage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const ReferralPage = lazy(() => import('./pages/ReferralPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        <BrowserRouter>
          <CartProvider>
            <WishlistProvider>
              <LoyaltyProvider>
                <GarageProvider>
                  <Routes>
                    <Route element={<Layout />}>
                      <Route index element={<HomePage />} />
                      <Route path="shop" element={<ShopPage />} />
                      <Route path="shop/:slug" element={<ShopPage />} />
                      <Route path="product/:id" element={<ProductPage />} />
                      <Route path="kits" element={<KitsPage />} />
                      <Route path="builder" element={<BuilderPage />} />
                      <Route path="quiz" element={<QuizPage />} />
                      <Route path="cart" element={<CartPage />} />
                      <Route path="checkout" element={<CheckoutPage />} />
                      <Route path="wishlist" element={<WishlistPage />} />
                      <Route path="calculator" element={<CalculatorPage />} />
                      <Route path="help" element={<FaqPage />} />
                      <Route path="order-lookup" element={<OrderLookupPage />} />
                      <Route path="orders" element={<OrdersPage />} />
                      <Route path="garage" element={<GaragePage />} />
                      <Route path="account" element={<AccountPage />} />
                      <Route path="referral" element={<ReferralPage />} />
                      <Route path="contact" element={<ContactPage />} />
                      <Route path="about" element={<AboutPage />} />
                      <Route path="notes" element={<NotesIndexPage />} />
                      <Route path="notes/:slug" element={<NotePage />} />
                      <Route path="shipping" element={<ContentPage slug="shipping" />} />
                      <Route path="returns" element={<ContentPage slug="returns" />} />
                      <Route path="accessibility" element={<ContentPage slug="accessibility" />} />
                      <Route path="terms" element={<ContentPage slug="terms" />} />
                      <Route path="privacy" element={<ContentPage slug="privacy" />} />
                      <Route path="sitemap" element={<SitemapPage />} />
                      <Route path="design" element={<DesignSystemPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Routes>
                </GarageProvider>
              </LoyaltyProvider>
            </WishlistProvider>
          </CartProvider>
        </BrowserRouter>
      </LazyMotion>
    </MotionConfig>
  )
}

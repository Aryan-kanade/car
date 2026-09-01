import Hero from '../components/Hero'
import ValueProps from '../components/ValueProps'
import CategoryTiles from '../components/CategoryTiles'
import FeaturedBanner from '../components/FeaturedBanner'
import StoryStrip from '../components/StoryStrip'
import DifferenceSection from '../components/DifferenceSection'
import WeatherCoach from '../components/WeatherCoach'
import CategoryList from '../components/CategoryList'
import RoutineStrip from '../components/RoutineStrip'
import BestSellers from '../components/BestSellers'
import Bundles from '../components/Bundles'
import Testimonials from '../components/Testimonials'
import ProductCard from '../components/ProductCard'
import { recommendedForYou } from '../utils/recommend'
import VelocityMarquee from '../components/VelocityMarquee'
import { usePageMeta } from '../hooks/usePageMeta'

/** The storefront landing page. */
export default function HomePage() {
  usePageMeta(
    null,
    'pH-balanced detailing chemistry, ceramic-grade protection and studio-tested tools — engineered for the enthusiast who notices every detail.'
  )

  return (
    <>
      <Hero />
      <ValueProps />
      <CategoryTiles />
      <FeaturedBanner />
      <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24" aria-label="Wash-day forecast">
        <WeatherCoach />
      </section>
      <StoryStrip />
      <DifferenceSection />
      <VelocityMarquee />
      <CategoryList />
      <RoutineStrip />
      <BestSellers />
      <Bundles />
      {recommendedForYou().length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24" aria-label="Recommended for you">
          <h2 className="font-display text-2xl font-bold tracking-[0.12em] uppercase text-zinc-900 dark:text-zinc-100 md:text-4xl">
            Recommended for you
          </h2>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 md:text-base">
            Based on the categories you have been browsing on this device.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedForYou().map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
      <Testimonials />
    </>
  )
}

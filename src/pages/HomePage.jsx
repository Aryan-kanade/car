import Hero from '../components/Hero'
import CategoryList from '../components/CategoryList'
import RoutineStrip from '../components/RoutineStrip'
import BestSellers from '../components/BestSellers'
import Bundles from '../components/Bundles'
import Testimonials from '../components/Testimonials'
import ValueProps from '../components/ValueProps'
import { usePageMeta } from '../hooks/usePageMeta'

/** The storefront landing page. */
export default function HomePage() {
  usePageMeta(
    null,
    'pH-balanced detailing chemistry, ceramic-grade protection and studio-tested tools — engineered for the enthusiast who notices every detail.',
  )

  return (
    <>
      <Hero />
      <CategoryList />
      <RoutineStrip />
      <BestSellers />
      <Bundles />
      <Testimonials />
      <ValueProps />
    </>
  )
}

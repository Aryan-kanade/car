import { m } from 'motion/react'
import SectionHeader from './SectionHeader'
import ProductCard from './ProductCard'
import { products } from '../data/catalog'

/** Best Sellers — responsive product grid with staggered scroll reveals. */
export default function BestSellers() {
  return (
    <section className="bg-zinc-50 dark:bg-zinc-900 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader title="Best Sellers" subtext="Loved by detailers." />

        <div className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 9).map((product, index) => (
            <m.div
              key={product.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: 'easeOut' }}
            >
              <ProductCard product={product} />
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}

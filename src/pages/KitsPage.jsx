import { motion } from 'framer-motion'
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { ShoppingCartIcon } from '@phosphor-icons/react/dist/csr/ShoppingCart'
import PageHeader from '../components/PageHeader'
import Placeholder from '../components/Placeholder'
import { bundles, formatPrice } from '../data/catalog'
import { useCart } from '../context/CartContext'
import { usePageMeta } from '../hooks/usePageMeta'

/** Curated Bundles — expanded split cards with full contents and add-to-cart. */
export default function KitsPage() {
  const { addItem } = useCart()

  usePageMeta(
    'Curated Bundles',
    'WASH and PRO detailing kits — complete routines priced below the sum of their parts.',
  )

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Kits & Bundles' }]}
        title="Curated Bundles"
        subtext="Start with a kit. Finish faster. Every bundle is priced below the sum of its parts and ships free."
      />

      <div className="mx-auto max-w-7xl space-y-16 px-6 py-14 md:space-y-24 md:py-20">
        {bundles.map((bundle, index) => {
          const saving = bundle.compareAt - bundle.price
          return (
            <motion.section
              key={bundle.title}
              aria-label={`${bundle.title} kit`}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="grid items-stretch gap-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 lg:grid-cols-2"
            >
              {/* Image */}
              <div className={`relative min-h-[280px] ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <Placeholder
                  label={bundle.imageLabel}
                  iconSize={48}
                  className="absolute inset-0 h-full w-full"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col p-8 md:p-12">
                <h2 className="font-display mt-4 text-5xl font-bold tracking-tight text-zinc-900 uppercase md:text-6xl">
                  {bundle.title}
                </h2>
                <p className="mt-4 text-sm text-zinc-600 md:text-base">{bundle.product}</p>

                <div className="mt-5 flex flex-wrap items-baseline gap-3">
                  <span className="text-2xl font-bold text-zinc-900">
                    {formatPrice(bundle.price)}
                  </span>
                  <span className="text-sm text-zinc-500 line-through">
                    {formatPrice(bundle.compareAt)}
                  </span>
                  <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-white uppercase">
                    Save {formatPrice(saving)}
                  </span>
                </div>

                <h3 className="mt-8 text-[11px] font-semibold tracking-[0.2em] text-zinc-900 uppercase">
                  What is inside
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {bundle.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-700">
                      <CheckCircleIcon size={18} weight="light" className="mt-0.5 shrink-0 text-zinc-900" />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-10">
                  <button
                    type="button"
                    onClick={() => addItem(bundle.productId)}
                    className="flex w-full cursor-pointer items-center justify-center gap-3 bg-zinc-900 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white uppercase transition-colors hover:bg-zinc-800 sm:w-auto"
                  >
                    <ShoppingCartIcon size={16} weight="light" />
                    Add {bundle.title} kit to cart
                  </button>
                </div>
              </div>
            </motion.section>
          )
        })}
      </div>
    </>
  )
}

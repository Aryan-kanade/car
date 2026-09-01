import { useState } from 'react'
import { m } from 'motion/react'
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { CircleIcon } from '@phosphor-icons/react/dist/csr/Circle'
import { ShoppingCartIcon } from '@phosphor-icons/react/dist/csr/ShoppingCart'
import PageHeader from '../components/PageHeader'
import Placeholder from '../components/Placeholder'
import { defaultSizeLabel, formatPrice, products } from '../data/catalog'
import { useCart } from '../context/CartContext'
import { usePageMeta } from '../hooks/usePageMeta'

const BUILDER_DISCOUNT = 0.1 // 10% off at 3+ items
const BUILDER_THRESHOLD = 3

/** Build your own kit — pick 3+ items and save 10%, add everything at once. */
export default function BuilderPage() {
  const [selected, setSelected] = useState([])
  const { addItem } = useCart()

  usePageMeta(
    'Build Your Kit',
    'Build your own KMKIRAMYKI kit — pick any three or more items and save 10% on the set.'
  )

  const selectable = products.filter((p) => p.category !== 'Kits & Bundles')

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  const chosen = selectable.filter((p) => selected.includes(p.id))
  const subtotal = chosen.reduce((total, p) => total + p.price, 0)
  const qualifies = chosen.length >= BUILDER_THRESHOLD
  const discount = qualifies ? Math.round(subtotal * BUILDER_DISCOUNT) : 0
  const total = subtotal - discount

  const addKitToCart = () => {
    if (!qualifies) return
    chosen.forEach((product, index) => {
      addItem(product.id, 1, defaultSizeLabel(product), { openDrawer: index === chosen.length - 1 })
    })
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Build Your Kit' }]}
        title="Build Your Kit"
        subtext={`Pick any ${BUILDER_THRESHOLD} or more items and the kit price drops 10% — your routine, your rules. Add everything to your cart in one tap.`}
      />

      {/* Live summary bar — sticks under the navbar while you pick */}
      <div className="sticky top-16 z-30 border-y border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 md:top-20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <p aria-live="polite" className="text-sm text-zinc-600 dark:text-zinc-400">
            {chosen.length === 0 ? (
              <>Your kit is empty — tap products to start building.</>
            ) : qualifies ? (
              <>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {chosen.length} items · {formatPrice(total)}
                </span>{' '}
                <span className="text-zinc-500 dark:text-zinc-400">
                  ({formatPrice(subtotal)} − {formatPrice(discount)} kit discount)
                </span>
              </>
            ) : (
              <>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {chosen.length} {chosen.length === 1 ? 'item' : 'items'} · {formatPrice(subtotal)}
                </span>{' '}
                — {BUILDER_THRESHOLD - chosen.length} more unlocks 10% off
              </>
            )}
          </p>
          <button
            type="button"
            onClick={addKitToCart}
            disabled={!qualifies}
            className="flex cursor-pointer items-center justify-center gap-3 bg-zinc-900 dark:bg-white px-7 py-3.5 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-500 dark:disabled:text-zinc-400 disabled:hover:bg-zinc-200 dark:disabled:hover:bg-zinc-800"
          >
            <ShoppingCartIcon size={16} weight="light" />
            {qualifies ? 'Add kit to cart' : `Pick ${BUILDER_THRESHOLD - chosen.length} more`}
          </button>
        </div>
      </div>

      {/* Product grid */}
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {selectable.map((product, index) => {
            const isSelected = selected.includes(product.id)
            return (
              <m.button
                key={product.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: (index % 6) * 0.05, ease: 'easeOut' }}
                onClick={() => toggle(product.id)}
                aria-pressed={isSelected}
                className={`group flex cursor-pointer flex-col overflow-hidden rounded-xl border text-left transition-colors ${
                  isSelected
                    ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                }`}
              >
                <span className="relative block">
                  <Placeholder
                    label={product.imageLabel}
                    iconSize={24}
                    className="aspect-[4/3] rounded-none"
                  />
                  <span
                    className={`absolute top-3 right-3 rounded-full p-2 ${
                      isSelected
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                        : 'bg-white/90 dark:bg-zinc-950/90 text-zinc-400 dark:text-zinc-500'
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected ? (
                      <CheckCircleIcon size={18} weight="fill" />
                    ) : (
                      <CircleIcon size={18} weight="light" />
                    )}
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="text-[11px] tracking-[0.15em] text-zinc-500 dark:text-zinc-400 uppercase">
                    {product.category}
                  </span>
                  <span className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {product.name}
                  </span>
                  <span className="mt-auto pt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatPrice(product.price)}
                  </span>
                </span>
              </m.button>
            )
          })}
        </div>
      </div>
    </>
  )
}

import { useState } from 'react'
import { Link } from 'react-router'
import { m } from 'motion/react'
import { FlaskIcon } from '@phosphor-icons/react/dist/csr/Flask'
import PageHeader from '../components/PageHeader'
import Placeholder from '../components/Placeholder'
import { formatPrice, products } from '../data/catalog'
import { usePageMeta } from '../hooks/usePageMeta'

const CAP_ML = 25 // one bottle cap ≈ 25 ml

const concentrates = products.filter((product) => product.dilutionMlPerLitre)

function LitresInput({ litres, onChange }) {
  return (
    <div>
      <label
        htmlFor="water-volume"
        className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase"
      >
        Water volume
      </label>
      <div className="flex items-center gap-4">
        <input
          id="water-volume"
          type="range"
          min={1}
          max={20}
          step={0.5}
          value={litres}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer accent-zinc-900 dark:accent-white"
          aria-valuetext={`${litres} litres`}
        />
        <output
          htmlFor="water-volume"
          className="font-display w-24 shrink-0 text-right text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100"
        >
          {litres.toFixed(1)} L
        </output>
      </div>
    </div>
  )
}

/** Dilution calculator — pick a concentrate, get the exact mix for your bucket. */
export default function CalculatorPage() {
  const [productId, setProductId] = useState(concentrates[0].id)
  const [litres, setLitres] = useState(10)

  usePageMeta(
    'Dilution Calculator',
    'Mix KMKIRAMYKI concentrates perfectly — pick a product, set your bucket size, get exact ml and capfuls.'
  )

  const product = concentrates.find((p) => p.id === productId) ?? concentrates[0]
  const ml = Math.round(product.dilutionMlPerLitre * litres)
  const caps = (ml / CAP_ML).toFixed(1)

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Lab Tools' }, { label: 'Dilution Calculator' }]}
        title="Dilution Calculator"
        subtext="Every KMKIRAMYKI concentrate ships with a dilution card. This is that card, alive — pick a product, set your water volume, pour with confidence."
      />

      <div className="mx-auto max-w-4xl px-6 py-14 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Controls */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-7 md:p-9"
          >
            <fieldset>
              <legend className="text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase">
                Concentrate
              </legend>
              <div
                className="mt-3 flex flex-wrap gap-2.5"
                role="radiogroup"
                aria-label="Concentrate"
              >
                {concentrates.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={productId === option.id}
                    onClick={() => setProductId(option.id)}
                    className={`cursor-pointer rounded-md border px-4 py-2.5 text-sm transition-colors ${
                      productId === option.id
                        ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600'
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-8">
              <LitresInput litres={litres} onChange={setLitres} />
            </div>

            {/* Result */}
            <div
              className="mt-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 text-center"
              aria-live="polite"
            >
              <p className="flex items-center justify-center gap-2 text-xs tracking-[0.2em] text-zinc-800 dark:text-zinc-400 uppercase">
                <FlaskIcon size={16} weight="light" aria-hidden="true" />
                Add to {litres.toFixed(1)} L of water
              </p>
              <p className="font-display mt-3 text-5xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                {ml}
                <span className="ml-2 text-xl font-semibold text-zinc-800 dark:text-zinc-400">
                  ml
                </span>
              </p>
              <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-400">
                ≈ {caps} bottle cap{caps === '1.0' ? '' : 's'} (25 ml cap)
              </p>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-zinc-800 dark:text-zinc-400">
              {product.usage}
            </p>
          </m.div>

          {/* Product card */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          >
            <Link to={`/product/${product.id}`} aria-label={product.name} className="block">
              <Placeholder
                label={product.imageLabel}
                iconSize={36}
                className="aspect-[4/5] rounded-xl"
              />
            </Link>
            <p className="mt-5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              <Link
                to={`/product/${product.id}`}
                className="transition-colors hover:text-zinc-800 dark:hover:text-zinc-300"
              >
                {product.name}
              </Link>
            </p>
            <p className="mt-1.5 text-sm text-zinc-800 dark:text-zinc-400">
              {formatPrice(product.price)} · {product.dilutionMlPerLitre} ml per litre
            </p>
            <p className="mt-4 text-xs leading-relaxed text-zinc-800 dark:text-zinc-400">
              A 500 ml bottle yields {Math.floor(500 / product.dilutionMlPerLitre)} litres of ready
              mix — roughly {Math.floor(500 / product.dilutionMlPerLitre / 10)} full bucket washes.
            </p>
          </m.div>
        </div>
      </div>
    </>
  )
}

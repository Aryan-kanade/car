import { useState } from 'react'
import { Link } from 'react-router'
import { m } from 'motion/react'
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/csr/ArrowLeft'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { ShoppingCartIcon } from '@phosphor-icons/react/dist/csr/ShoppingCart'
import PageHeader from '../components/PageHeader'
import Placeholder from '../components/Placeholder'
import { defaultSizeLabel, formatPrice, getProductById } from '../data/catalog'
import { getRoutine, quizQuestions } from '../data/quiz'
import { useCart } from '../context/CartContext'
import { usePageMeta } from '../hooks/usePageMeta'

/** Product finder — three questions, one recommended routine. */
export default function QuizPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const { addItem } = useCart()

  usePageMeta('Find Your Routine', 'Answer three questions and get your perfect detailing routine.')

  const done = step >= quizQuestions.length
  const routine = done ? getRoutine(answers) : null
  const routineProducts = routine
    ? routine.items.map((item) => ({ ...item, product: getProductById(item.productId) }))
    : []

  const choose = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }))
    setStep((current) => current + 1)
  }

  const addRoutineToCart = () => {
    routineProducts.forEach(({ product }, index) => {
      if (!product) return
      addItem(product.id, 1, defaultSizeLabel(product), {
        openDrawer: index === routineProducts.length - 1,
      })
    })
  }

  const total = routineProducts.reduce(
    (sum, { product }) => (product ? sum + product.price : sum),
    0
  )

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Find Your Routine' }]}
        title="Find Your Routine"
        subtext="Three questions. One tailored kit of formulas and tools — no guesswork, no buying the wrong bottle."
      />

      <div className="mx-auto max-w-2xl px-6 py-14 md:py-20">
        {!done && (
          <m.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Progress */}
            <p
              aria-live="polite"
              className="text-xs tracking-[0.25em] text-zinc-500 dark:text-zinc-400 uppercase"
            >
              Question {step + 1} of {quizQuestions.length}
            </p>
            <div className="mt-3 flex gap-2" aria-hidden="true">
              {quizQuestions.map((_, index) => (
                <span
                  key={index}
                  className={`h-1 flex-1 rounded-full ${
                    index < step
                      ? 'bg-zinc-900 dark:bg-white'
                      : index === step
                        ? 'bg-zinc-400 dark:bg-zinc-600'
                        : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            <h2 className="font-display mt-8 text-2xl font-bold tracking-[0.04em] uppercase text-zinc-900 dark:text-zinc-100">
              {quizQuestions[step].question}
            </h2>

            <div className="mt-8 space-y-4">
              {quizQuestions[step].choices.map((choice) => (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => choose(quizQuestions[step].id, choice.value)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-5 text-left transition-colors hover:border-zinc-900 dark:hover:border-white"
                >
                  <span>
                    <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {choice.label}
                    </span>
                    <span className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400">
                      {choice.hint}
                    </span>
                  </span>
                  <ArrowRightIcon
                    size={18}
                    weight="light"
                    className="shrink-0 text-zinc-400"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((current) => current - 1)}
                className="mt-8 flex cursor-pointer items-center gap-2 text-xs font-semibold tracking-[0.15em] text-zinc-500 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                <ArrowLeftIcon size={14} weight="light" aria-hidden="true" />
                Back
              </button>
            )}
          </m.div>
        )}

        {done && routine && (
          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <p className="flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-zinc-500 dark:text-zinc-400 uppercase">
              <CheckCircleIcon
                size={16}
                weight="fill"
                className="text-zinc-900 dark:text-white"
                aria-hidden="true"
              />
              Your routine
            </p>
            <h2 className="font-display mt-3 text-2xl font-bold tracking-[0.04em] uppercase text-zinc-900 dark:text-zinc-100">
              {routine.title}
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {routine.summary}
            </p>

            <ol className="mt-10 space-y-6">
              {routineProducts.map(({ product, reason }, index) =>
                product ? (
                  <li key={product.id} className="flex gap-5">
                    <span className="font-display w-7 shrink-0 pt-1 text-sm font-bold text-zinc-400">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <Link
                      to={`/product/${product.id}`}
                      className="w-20 shrink-0"
                      aria-label={product.name}
                    >
                      <Placeholder
                        label={product.imageLabel}
                        iconSize={16}
                        className="aspect-[4/5] rounded-md"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        <Link
                          to={`/product/${product.id}`}
                          className="transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
                        >
                          {product.name}
                        </Link>
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {reason}
                      </p>
                      <p className="mt-auto pt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </li>
                ) : null
              )}
            </ol>

            <div className="mt-10 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-7">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Routine total ({routineProducts.length} items)
                </span>
                <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatPrice(total)}
                </span>
              </div>
              <button
                type="button"
                onClick={addRoutineToCart}
                className="mt-5 flex w-full cursor-pointer items-center justify-center gap-3 bg-zinc-900 dark:bg-white py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                <ShoppingCartIcon size={16} weight="light" />
                Add routine to cart
              </button>
              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setAnswers({})
                    setStep(0)
                  }}
                  className="cursor-pointer text-xs font-semibold tracking-[0.15em] text-zinc-500 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
                >
                  Start over
                </button>
                <Link
                  to="/builder"
                  className="text-xs font-semibold tracking-[0.15em] text-zinc-500 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
                >
                  Customise in the builder →
                </Link>
              </div>
            </div>
          </m.div>
        )}
      </div>
    </>
  )
}

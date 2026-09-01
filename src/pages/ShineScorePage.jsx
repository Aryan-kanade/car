import { useState } from 'react'
import { Link } from 'react-router'
import { m } from 'motion/react'
import PageHeader from '../components/PageHeader'
import { purchasableProducts } from '../data/catalog'
import { getRoutine } from '../data/quiz'
import { usePageMeta } from '../hooks/usePageMeta'

const QUESTIONS = [
  {
    id: 'beading',
    question: 'Hose down the roof. What does the water do?',
    options: [
      { label: 'Sheets flat, dries into spots', score: 0 },
      { label: 'Loose blobs, half-hearted roll', score: 5 },
      { label: 'Tight beads that slide off', score: 10 },
    ],
  },
  {
    id: 'swirls',
    question: 'Under direct sunlight or a torch, the paint shows…',
    options: [
      { label: 'A spider-web of fine scratches', score: 0 },
      { label: 'A few swirls on the doors', score: 5 },
      { label: 'Clean, uniform reflection', score: 10 },
    ],
  },
  {
    id: 'gloss',
    question: 'Stand at an angle — how sharp is the reflection?',
    options: [
      { label: 'Dull, milky, matte-ish', score: 0 },
      { label: 'Visible but soft', score: 5 },
      { label: 'Mirror-sharp with depth', score: 10 },
    ],
  },
  {
    id: 'touch',
    question: 'Run the back of your hand over the bonnet. It feels…',
    options: [
      { label: 'Gritty, like fine sandpaper', score: 0 },
      { label: 'Smooth with rough patches', score: 5 },
      { label: 'Glass-smooth everywhere', score: 10 },
    ],
  },
  {
    id: 'water-spots',
    question: 'After a rain, dried spots are…',
    options: [
      { label: 'Etched into the paint', score: 0 },
      { label: 'Present but they wipe off', score: 5 },
      { label: 'Barely form at all', score: 10 },
    ],
  },
  {
    id: 'routine',
    question: 'How often does the car actually get washed?',
    options: [
      { label: 'When it embarrasses me', score: 0 },
      { label: 'Every couple of months', score: 5 },
      { label: 'Weekly or bi-weekly ritual', score: 10 },
    ],
  },
]

const BANDS = [
  {
    min: 50,
    label: 'Showroom Ready',
    note: 'Maintain it — this is the level the studio works to keep.',
  },
  { min: 30, label: 'Nearly There', note: 'Solid base with a few fixable weak spots.' },
  {
    min: 15,
    label: 'Needs Attention',
    note: 'Contamination and neglect are winning — time for a reset.',
  },
  {
    min: 0,
    label: 'Rescue Mission',
    note: 'Start with decontamination before anything else touches the paint.',
  },
]

/** Shine Score — interactive paint assessment mapped to a product plan. */
export default function ShineScorePage() {
  usePageMeta(
    'Shine Score',
    'A six-question paint assessment that scores your finish and prescribes the fix.'
  )
  const [answers, setAnswers] = useState({})
  const [step, setStep] = useState(0)

  const answered = Object.keys(answers).length
  const done = answered === QUESTIONS.length
  const score = Object.values(answers).reduce((total, value) => total + value, 0)
  const band = BANDS.find((b) => score >= b.min)

  const choose = (id, score) => {
    setAnswers((current) => ({ ...current, [id]: score }))
    setStep((current) => Math.min(QUESTIONS.length - 1, current + 1))
  }

  // Map score to a routine key: low scores -> deep routine
  const routine = getRoutine({
    goal: score < 30 ? 'deep' : score < 50 ? 'protect' : 'maintain',
    focus: 'paint',
    method: 'any',
  })

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Shine Score' }]}
        title="Shine Score"
        subtext="Six honest questions about your paint. Sixty seconds. A score, a diagnosis and the exact products that fix it."
      />

      <div className="mx-auto max-w-2xl px-6 py-14 md:py-20">
        {!done ? (
          <m.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <p
              aria-live="polite"
              className="text-xs font-medium tracking-[0.25em] text-zinc-500 dark:text-zinc-300 uppercase"
            >
              Question {answered + 1} of {QUESTIONS.length}
            </p>
            <div className="mt-3 flex gap-2" aria-hidden="true">
              {QUESTIONS.map((q, index) => (
                <span
                  key={q.id}
                  className={`h-1 flex-1 rounded-full ${
                    answers[q.id] !== undefined
                      ? 'bg-zinc-900 dark:bg-white'
                      : index === step
                        ? 'bg-zinc-400 dark:bg-zinc-600'
                        : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            <h2 className="font-display mt-8 text-2xl font-bold tracking-[0.04em] uppercase text-zinc-900 dark:text-zinc-100">
              {QUESTIONS[step].question}
            </h2>

            <div className="mt-8 space-y-4">
              {QUESTIONS[step].options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => choose(QUESTIONS[step].id, option.score)}
                  className="w-full cursor-pointer rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-5 text-left text-sm font-medium text-zinc-900 dark:text-zinc-100 transition-colors hover:border-zinc-900 dark:hover:border-white"
                >
                  {option.label}
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                className="mt-8 cursor-pointer text-xs font-semibold tracking-[0.15em] text-zinc-500 dark:text-zinc-300 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                ← Back
              </button>
            )}
          </m.div>
        ) : (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Animated gauge */}
            <div className="flex flex-col items-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-12 text-center">
              <div className="relative" role="img" aria-label={`Shine score ${score} out of 60`}>
                <svg width="180" height="180" viewBox="0 0 120 120" aria-hidden="true">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    strokeWidth="8"
                    className="stroke-zinc-200 dark:stroke-zinc-800"
                  />
                  <m.circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="stroke-zinc-900 dark:stroke-white"
                    strokeDasharray={2 * Math.PI * 54}
                    initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - score / 60) }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <span className="font-display absolute inset-0 flex items-center justify-center text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                  {score}
                </span>
              </div>
              <h2 className="font-display mt-6 text-2xl font-bold tracking-[0.06em] uppercase text-zinc-900 dark:text-zinc-100">
                {band.label}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {band.note}
              </p>
            </div>

            <h3 className="font-display mt-10 text-lg font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100">
              Your prescription · {routine.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {routine.items.map((item) => {
                const product = purchasableProducts.find((p) => p.id === item.productId)
                return product ? (
                  <li key={item.productId}>
                    <Link
                      to={`/product/${product.id}`}
                      className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm transition-colors hover:border-zinc-900 dark:hover:border-white"
                    >
                      <span className="text-zinc-700 dark:text-zinc-300">{product.name}</span>
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {item.reason.split(' — ')[0]}
                      </span>
                    </Link>
                  </li>
                ) : null
              })}
            </ul>

            <button
              type="button"
              onClick={() => {
                setAnswers({})
                setStep(0)
              }}
              className="mt-8 cursor-pointer text-xs font-semibold tracking-[0.15em] text-zinc-500 dark:text-zinc-300 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
            >
              Retake assessment
            </button>
          </m.div>
        )}
      </div>
    </>
  )
}

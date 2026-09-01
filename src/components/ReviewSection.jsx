import { useState } from 'react'
import { m } from 'motion/react'
import { StarIcon } from '@phosphor-icons/react/dist/csr/Star'
import { useProductReviews } from '../hooks/useProductReviews'

function Stars({ value = 5, size = 12 }) {
  return (
    <span className="flex gap-0.5" aria-label={`Rated ${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          size={size}
          weight={i < value ? 'fill' : 'light'}
          className={
            i < value ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-300 dark:text-zinc-600'
          }
        />
      ))}
    </span>
  )
}

function WriteForm({ onSubmit }) {
  const [name, setName] = useState('')
  const [stars, setStars] = useState(5)
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const submit = (event) => {
    event.preventDefault()
    if (!name.trim() || text.trim().length < 10) {
      setError('Add your name and at least a sentence of thoughts.')
      return
    }
    onSubmit({ name: name.trim(), stars, text: text.trim() })
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="review-name"
            className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase"
          >
            Name
          </label>
          <input
            id="review-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none"
          />
        </div>
        <div>
          <span className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase">
            Rating
          </span>
          <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={stars === value}
                aria-label={`${value} star${value === 1 ? '' : 's'}`}
                onClick={() => setStars(value)}
                className="cursor-pointer p-1.5 transition-transform hover:scale-110"
              >
                <StarIcon
                  size={22}
                  weight={value <= stars ? 'fill' : 'light'}
                  className={
                    value <= stars
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }
                />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label
          htmlFor="review-text"
          className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase"
        >
          Review
        </label>
        <textarea
          id="review-text"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How did it perform on your car?"
          className="w-full resize-y rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none"
        />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        className="cursor-pointer bg-zinc-900 dark:bg-white px-7 py-3.5 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
      >
        Submit review
      </button>
    </form>
  )
}

/** Product reviews — summary breakdown, list, and a write form. */
export default function ReviewSection({ productId }) {
  const { reviews, addReview, average, breakdown } = useProductReviews(productId)
  const [writing, setWriting] = useState(false)
  const [justPosted, setJustPosted] = useState(false)

  return (
    <section
      aria-label="Reviews"
      className="mt-20 border-t border-zinc-200 dark:border-zinc-800 pt-14 md:mt-24"
    >
      <h2 className="font-display text-xl font-bold tracking-[0.12em] uppercase text-zinc-900 dark:text-zinc-100 md:text-2xl">
        Reviews
      </h2>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        {/* Summary */}
        <div>
          <div className="flex items-end gap-4">
            <p className="font-display text-5xl font-bold text-zinc-900 dark:text-zinc-100">
              {average > 0 ? average.toFixed(1) : '—'}
            </p>
            <div className="pb-1.5">
              <Stars value={Math.round(average)} size={14} />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {reviews.length} review{reviews.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <ul className="mt-6 space-y-2">
            {breakdown.map(({ stars, count }) => (
              <li
                key={stars}
                className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400"
              >
                <span className="w-6 tabular-nums">{stars}★</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <span
                    className="block h-full rounded-full bg-zinc-900 dark:bg-white transition-all duration-500"
                    style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                  />
                </span>
                <span className="w-4 text-right tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
          {!writing ? (
            <button
              type="button"
              onClick={() => setWriting(true)}
              className="mt-7 cursor-pointer border border-zinc-300 dark:border-zinc-700 px-7 py-3.5 text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
            >
              Write a review
            </button>
          ) : justPosted ? (
            <p
              role="status"
              className="mt-7 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300"
            >
              Thanks — your review is live below.
            </p>
          ) : (
            <div className="mt-7 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5">
              <WriteForm
                onSubmit={(review) => {
                  addReview(review)
                  setJustPosted(true)
                  setWriting(false)
                }}
              />
            </div>
          )}
        </div>

        {/* List */}
        <ul className="space-y-8">
          {reviews.length === 0 && (
            <li className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              No reviews yet. Be the first to tell the next detailer how it performed.
            </li>
          )}
          {reviews.map((review, index) => (
            <m.li
              key={`${review.at}-${index}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="border-b border-zinc-200 dark:border-zinc-800 pb-8 last:border-b-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {review.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(review.at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="mt-2">
                <Stars value={review.stars} />
              </div>
              <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {review.text}
              </p>
            </m.li>
          ))}
        </ul>
      </div>
    </section>
  )
}

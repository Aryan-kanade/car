import { useCallback, useState } from 'react'

const KEY = 'kmkiramyki-reviews'

const SEEDS = {
  'complete-detail-kit': [
    {
      name: 'Rahul S.',
      stars: 5,
      text: 'Bought the PRO kit two months ago and it replaced my entire shelf. The dilution cards alone are worth it — every product tells you exactly how to use it.',
      at: Date.parse('2026-07-14'),
    },
  ],
}

export function readReviews(productId) {
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    const stored = Array.isArray(parsed[productId]) ? parsed[productId] : []
    return [...(SEEDS[productId] ?? []), ...stored]
  } catch {
    return SEEDS[productId] ?? []
  }
}

/** Per-product reviews persisted to localStorage, merged with seeded content. */
export function useProductReviews(productId) {
  const [reviews, setReviews] = useState(() => readReviews(productId))

  const addReview = useCallback(
    (review) => {
      const entry = { ...review, at: Date.now() }
      try {
        const raw = window.localStorage.getItem(KEY)
        const parsed = raw ? JSON.parse(raw) : {}
        const stored = Array.isArray(parsed[productId]) ? parsed[productId] : []
        parsed[productId] = [...stored, entry]
        window.localStorage.setItem(KEY, JSON.stringify(parsed))
      } catch {
        /* storage unavailable — review shows for this session only */
      }
      setReviews(readReviews(productId))
    },
    [productId]
  )

  const average =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.stars, 0) / reviews.length
      : 0

  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((review) => review.stars === stars).length,
  }))

  return { reviews, addReview, average, breakdown }
}

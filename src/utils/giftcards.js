import { useState } from 'react'
import { readOrders, saveOrder, SHIPPING_FEE } from './orders'

const KEY = 'kmkiramyki-giftcards'

/** Demo gift-card pool: codes are validated against this list. */
const GIFT_POOL = ['GIFT-2026-KMKI', 'GIFT-2026-KMKP']

export function lookupGiftCard(code) {
  const normalized = (code ?? '').toString().trim().toUpperCase()
  if (!GIFT_POOL.includes(normalized)) return null
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    const spent = Number.isFinite(parsed[normalized]) ? parsed[normalized] : 0
    return { code: normalized, balance: Math.max(0, 2500 - spent), faceValue: 2500 }
  } catch {
    return { code: normalized, balance: 2500, faceValue: 2500 }
  }
}

/** Record a redemption amount against a code. */
export function redeemGiftCard(code, amount) {
  const normalized = (code ?? '').toString().trim().toUpperCase()
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    const spent = Number.isFinite(parsed[normalized]) ? parsed[normalized] : 0
    parsed[normalized] = spent + amount
    window.localStorage.setItem(KEY, JSON.stringify(parsed))
  } catch {
    /* storage unavailable */
  }
}

export { readOrders, saveOrder, SHIPPING_FEE }

/** Hook-shaped helper for checkout gift-card state. */
export function useGiftCard() {
  const [appliedCode, setAppliedCode] = useState(null)
  const [error, setError] = useState(null)

  const apply = (code) => {
    const card = lookupGiftCard(code)
    if (!card) {
      setError('Invalid code. Try GIFT-2026-KMKI for a ₹2,500 demo card.')
      return { ok: false }
    }
    if (card.balance <= 0) {
      setError('This card has no remaining balance.')
      return { ok: false }
    }
    setAppliedCode(card.code)
    setError(null)
    return { ok: true, card }
  }

  const clear = () => {
    setAppliedCode(null)
    setError(null)
  }

  return { appliedCode, error, apply, clear }
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'kmkiramyki-loyalty'
const LoyaltyContext = createContext(null)

/** 1 point per ₹100 spent. */
export const POINTS_PER_100 = 1
/** Redemption: 500 points = ₹250 off. */
export const REDEEM_THRESHOLD = 500
export const REDEEM_VALUE = 250

function readStoredLoyalty() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    const balance = Number.isInteger(parsed.balance) && parsed.balance >= 0 ? parsed.balance : 500
    return { balance }
  } catch {
    return { balance: 500 }
  }
}

/**
 * Studio Points loyalty: balance persisted to localStorage, earned on every
 * order, redeemable at 500+ for ₹250 off. Starts every device at 500 pts
 * (welcome bonus) so the redemption flow is demoable immediately.
 */
export function LoyaltyProvider({ children }) {
  const [balance, setBalance] = useState(() => readStoredLoyalty().balance)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance }))
    } catch {
      /* storage unavailable */
    }
  }, [balance])

  const pointsForAmount = useCallback((amount) => Math.floor((amount / 100) * POINTS_PER_100), [])

  const addPoints = useCallback((points) => {
    setBalance((current) => Math.max(0, current + points))
  }, [])

  const spendPoints = useCallback((points) => {
    setBalance((current) => Math.max(0, current - points))
  }, [])

  const value = useMemo(
    () => ({
      balance,
      pointsForAmount,
      addPoints,
      spendPoints,
      canRedeem: balance >= REDEEM_THRESHOLD,
      redeemableUnits: Math.floor(balance / REDEEM_THRESHOLD),
    }),
    [balance, pointsForAmount, addPoints, spendPoints]
  )

  return <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>
}

export function useLoyalty() {
  const context = useContext(LoyaltyContext)
  if (!context) {
    throw new Error('useLoyalty must be used within a LoyaltyProvider')
  }
  return context
}

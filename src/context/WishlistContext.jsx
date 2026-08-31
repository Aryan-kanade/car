import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'kmkiramyki-wishlist'
const WishlistContext = createContext(null)

function readStoredWishlist() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []
  } catch {
    return []
  }
}

/** App-wide wishlist: an array of product ids, persisted to localStorage. */
export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(readStoredWishlist)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      /* storage unavailable — wishlist simply won't persist */
    }
  }, [ids])

  const toggle = useCallback((id) => {
    setIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }, [])

  const value = useMemo(
    () => ({ ids, count: ids.length, toggle, has: (id) => ids.includes(id) }),
    [ids, toggle]
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

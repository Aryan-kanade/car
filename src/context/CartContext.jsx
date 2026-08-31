import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getProductById } from '../data/catalog'

const STORAGE_KEY = 'kmkiramyki-cart'
const CartContext = createContext(null)

function readStoredCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    // Guard against tampered/stale ids: keep only entries that resolve to products
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item.id === 'string' && getProductById(item.id))
      : []
  } catch {
    return []
  }
}

/**
 * App-wide cart: items are {id, qty} pairs resolved against the catalog,
 * so product data is never duplicated into storage. Persists to localStorage.
 * Also owns the quick-view drawer UI state so any add-to-cart can open it.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [announcement, setAnnouncement] = useState({ key: 0, message: '' })

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* storage unavailable — cart simply won't persist */
    }
  }, [items])

  const addItem = useCallback((id, qty = 1, { openDrawer = true } = {}) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === id)
      if (existing) {
        return current.map((item) =>
          item.id === id ? { ...item, qty: Math.min(item.qty + qty, 99) } : item,
        )
      }
      return [...current, { id, qty }]
    })
    const product = getProductById(id)
    if (product) {
      setAnnouncement({ key: Date.now(), message: `${product.name} added to cart` })
    }
    if (openDrawer) setDrawerOpen(true)
  }, [])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const setQty = useCallback((id, qty) => {
    setItems((current) =>
      qty <= 0
        ? current.filter((item) => item.id !== id)
        : current.map((item) => (item.id === id ? { ...item, qty: Math.min(qty, 99) } : item)),
    )
  }, [])

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const value = useMemo(() => {
    const detailed = items
      .map(({ id, qty }) => {
        const product = getProductById(id)
        return product ? { product, qty } : null
      })
      .filter(Boolean)

    const count = detailed.reduce((total, { qty }) => total + qty, 0)
    const subtotal = detailed.reduce((total, { product, qty }) => total + product.price * qty, 0)

    return {
      items: detailed,
      count,
      subtotal,
      addItem,
      setQty,
      removeItem,
      clearCart,
      drawerOpen,
      openDrawer,
      closeDrawer,
      announcement,
    }
  }, [items, addItem, setQty, removeItem, clearCart, drawerOpen, openDrawer, closeDrawer, announcement])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

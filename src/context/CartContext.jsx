import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { defaultSizeLabel, getProductById, getVariant } from '../data/catalog'

const STORAGE_KEY = 'kmkiramyki-cart'
const CartContext = createContext(null)

function readStoredCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    // Guard against tampered/stale entries and coerce legacy items (no size) to defaults
    return parsed
      .map((item) => {
        if (!item || typeof item.id !== 'string') return null
        const product = getProductById(item.id)
        if (!product) return null
        const size = item.size ?? defaultSizeLabel(product)
        const qty = Number.isInteger(item.qty) && item.qty > 0 ? item.qty : 1
        return { id: item.id, size, qty }
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

/**
 * App-wide cart: items are {id, size, qty} resolved against the catalog, so
 * product data and pricing are never duplicated into storage. Persists to
 * localStorage and owns the quick-view drawer UI state.
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

  const addItem = useCallback((id, qty = 1, sizeLabel = null, { openDrawer = true } = {}) => {
    const product = getProductById(id)
    if (!product) return
    const size = sizeLabel ?? defaultSizeLabel(product)

    setItems((current) => {
      const existing = current.find((item) => item.id === id && item.size === size)
      if (existing) {
        return current.map((item) =>
          item.id === id && item.size === size
            ? { ...item, qty: Math.min(item.qty + qty, 99) }
            : item
        )
      }
      return [...current, { id, size, qty }]
    })
    const variant = getVariant(product, size)
    setAnnouncement({
      key: Date.now(),
      message: `${product.name}${variant.label ? ` (${variant.label})` : ''} added to cart`,
    })
    if (openDrawer) setDrawerOpen(true)
  }, [])

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const setQty = useCallback((id, size, qty) => {
    setItems((current) =>
      qty <= 0
        ? current.filter((item) => !(item.id === id && item.size === size))
        : current.map((item) =>
            item.id === id && item.size === size ? { ...item, qty: Math.min(qty, 99) } : item
          )
    )
  }, [])

  const removeItem = useCallback((id, size) => {
    setItems((current) => current.filter((item) => !(item.id === id && item.size === size)))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const value = useMemo(() => {
    const detailed = items
      .map(({ id, size, qty }) => {
        const product = getProductById(id)
        if (!product) return null
        const variant = getVariant(product, size)
        return {
          product,
          size: variant.label,
          qty,
          unitPrice: variant.price,
          unitCompareAt: variant.compareAt,
          lineTotal: variant.price * qty,
        }
      })
      .filter(Boolean)

    const count = detailed.reduce((total, { qty }) => total + qty, 0)
    const subtotal = detailed.reduce((total, { lineTotal }) => total + lineTotal, 0)

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
  }, [
    items,
    addItem,
    setQty,
    removeItem,
    clearCart,
    drawerOpen,
    openDrawer,
    closeDrawer,
    announcement,
  ])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

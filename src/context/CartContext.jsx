import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { defaultSizeLabel, getProductById, getVariant } from '../data/catalog'
import { lookupPromo, promoDiscount } from '../utils/promos'
import { toast } from '../components/ToastStack'

const STORAGE_KEY = 'kmkiramyki-cart'

export const SUBSCRIBE_DISCOUNT = 0.15
export const subscribePrice = (price) => Math.round(price * (1 - SUBSCRIBE_DISCOUNT))
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
        const plan = item.plan === 'sub' ? 'sub' : 'once'
        return { id: item.id, size, plan, qty }
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

  const addItem = useCallback(
    (id, qty = 1, sizeLabel = null, { openDrawer = true, plan = 'once' } = {}) => {
      const product = getProductById(id)
      if (!product) return
      const size = sizeLabel ?? defaultSizeLabel(product)

      setItems((current) => {
        const existing = current.find(
          (item) => item.id === id && item.size === size && item.plan === plan
        )
        if (existing) {
          return current.map((item) =>
            item.id === id && item.size === size && item.plan === plan
              ? { ...item, qty: Math.min(item.qty + qty, 99) }
              : item
          )
        }
        return [...current, { id, size, plan, qty }]
      })
      const variant = getVariant(product, size)
      const suffix = variant.label ? ` (${variant.label})` : ''
      const planText = plan === 'sub' ? ' subscription' : ''
      setAnnouncement({
        key: Date.now(),
        message: `${product.name}${suffix}${planText} added to cart`,
      })
      if (openDrawer) setDrawerOpen(true)
      toast(`${product.name} added to cart`)
    },
    []
  )

  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const setQty = useCallback((id, size, plan, qty) => {
    setItems((current) =>
      qty <= 0
        ? current.filter((item) => !(item.id === id && item.size === size && item.plan === plan))
        : current.map((item) =>
            item.id === id && item.size === size && item.plan === plan
              ? { ...item, qty: Math.min(qty, 99) }
              : item
          )
    )
  }, [])

  const removeItem = useCallback((id, size, plan) => {
    setItems((current) =>
      current.filter((item) => !(item.id === id && item.size === size && item.plan === plan))
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const [promoCode, setPromoCode] = useState(null)

  /** Validates and applies a promo code; returns {ok, error|promo}. */
  const applyPromo = useCallback((code) => {
    const promo = lookupPromo(code)
    if (!promo) {
      return { ok: false, error: 'That code is not valid. Try WELCOME10 or FREESHIP.' }
    }
    setPromoCode(promo.code)
    return { ok: true, promo }
  }, [])

  const clearPromo = useCallback(() => setPromoCode(null), [])

  const value = useMemo(() => {
    const detailed = items
      .map(({ id, size, plan, qty }) => {
        const product = getProductById(id)
        if (!product) return null
        const variant = getVariant(product, size)
        const base = variant.price
        const unitPrice = plan === 'sub' ? subscribePrice(base) : base
        return {
          product,
          size: variant.label,
          plan,
          recurring: plan === 'sub',
          qty,
          unitPrice,
          unitCompareAt: variant.compareAt,
          lineTotal: unitPrice * qty,
        }
      })
      .filter(Boolean)

    const count = detailed.reduce((total, { qty }) => total + qty, 0)
    const subtotal = detailed.reduce((total, { lineTotal }) => total + lineTotal, 0)
    const promo = promoCode ? lookupPromo(promoCode) : null
    const discount = promoDiscount(promo, subtotal)

    return {
      items: detailed,
      count,
      subtotal,
      promo,
      discount,
      applyPromo,
      clearPromo,
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
    promoCode,
    applyPromo,
    clearPromo,
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

import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'

/**
 * Toast stack — bottom-right notifications for cart/wishlist/promo actions.
 * Global `window.kmkToast(message)` API; aria-live announced.
 */
let pushToast = () => {}

export function toast(message) {
  pushToast(message)
}

let nextId = 0

export default function ToastStack() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    pushToast = (message) => {
      const id = ++nextId
      setToasts((current) => [...current.slice(-2), { id, message }])
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id))
      }, 2600)
    }
    return () => {
      pushToast = () => {}
    }
  }, [])

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-6 bottom-24 z-50 flex w-64 flex-col gap-2 md:bottom-6"
    >
      <AnimatePresence>
        {toasts.map((entry) => (
          <m.div
            key={entry.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center gap-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 shadow-lg"
          >
            <CheckCircleIcon
              size={16}
              weight="fill"
              className="shrink-0 text-zinc-900 dark:text-zinc-100"
              aria-hidden="true"
            />
            <p className="min-w-0 flex-1 truncate text-sm text-zinc-900 dark:text-zinc-100">
              {entry.message}
            </p>
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

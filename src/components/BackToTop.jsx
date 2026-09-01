import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { ArrowUpIcon } from '@phosphor-icons/react/dist/csr/ArrowUp'

/** Floating back-to-top button, appears after meaningful scroll. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <m.button
          type="button"
          aria-label="Back to top"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed right-6 bottom-24 z-30 cursor-pointer rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-3.5 text-zinc-600 dark:text-zinc-300 shadow-lg backdrop-blur-md transition-colors hover:text-zinc-900 dark:hover:text-white md:bottom-6"
        >
          <ArrowUpIcon size={18} weight="light" />
        </m.button>
      )}
    </AnimatePresence>
  )
}

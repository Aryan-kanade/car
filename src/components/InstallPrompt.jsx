import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { DeviceMobileIcon } from '@phosphor-icons/react/dist/csr/DeviceMobile'
import { XIcon } from '@phosphor-icons/react/dist/csr/X'

const DISMISS_KEY = 'kmkiramyki-install-dismissed'

/**
 * Custom PWA install prompt — tasteful card after 30s once the browser
 * has a beforeinstallprompt event available.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY)) return
    } catch {
      /* storage unavailable */
    }

    const onPrompt = (event) => {
      event.preventDefault()
      setDeferred(event)
      setTimeout(() => setVisible(true), 30000)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      window.localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* storage unavailable */
    }
  }

  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    dismiss()
  }

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-24 left-6 z-50 flex w-[calc(100vw-3rem)] max-w-xs items-center gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-2xl md:bottom-6"
          role="dialog"
          aria-label="Install app"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
            <DeviceMobileIcon size={20} weight="light" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Keep the studio close
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-zinc-800 dark:text-zinc-400">
              Install KMKIRAMYKI for offline browsing.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={install}
                className="cursor-pointer bg-zinc-900 dark:bg-white px-4 py-2 text-[11px] font-semibold tracking-[0.15em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                Install
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="cursor-pointer px-3 py-2 text-[11px] font-semibold tracking-[0.15em] text-zinc-800 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            type="button"
            aria-label="Dismiss install prompt"
            onClick={dismiss}
            className="absolute top-2.5 right-2.5 cursor-pointer p-1.5 text-zinc-800 transition-colors hover:text-zinc-900 dark:hover:text-white"
          >
            <XIcon size={14} weight="light" />
          </button>
        </m.div>
      )}
    </AnimatePresence>
  )
}

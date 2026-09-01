import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, m } from 'motion/react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { XIcon } from '@phosphor-icons/react/dist/csr/X'
import { MicrophoneIcon } from '@phosphor-icons/react/dist/csr/Microphone'
import { formatPrice } from '../data/catalog'
import { searchProducts } from '../utils/search'
import { useFocusTrap } from '../hooks/useFocusTrap'

/**
 * Full-screen search overlay — live type-ahead across product names
 * and categories. Esc or backdrop click closes; results link to PDPs.
 */
export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [listening, setListening] = useState(false)
  const [recent, setRecent] = useState(() => {
    try {
      const raw = window.localStorage.getItem('kmkiramyki-recent-searches')
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.slice(0, 5) : []
    } catch {
      return []
    }
  })
  const inputRef = useRef(null)
  const panelRef = useRef(null)

  useFocusTrap(panelRef, open)

  // Focus the input on open, lock body scroll, close on Escape
  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const results = useMemo(() => searchProducts(query, 8), [query])

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? ''
      if (transcript) setQuery(transcript)
    }
    recognition.start()
  }

  const rememberSearch = (term) => {
    const q = term.trim().toLowerCase()
    if (!q) return
    setRecent((current) => {
      const next = [q, ...current.filter((item) => item !== q)].slice(0, 5)
      try {
        window.localStorage.setItem('kmkiramyki-recent-searches', JSON.stringify(next))
      } catch {
        /* storage unavailable */
      }
      return next
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-60 bg-zinc-950/40 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Search products"
        >
          <m.div
            ref={panelRef}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mx-auto mt-20 w-[calc(100%-3rem)] max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 shadow-2xl md:mt-28"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input row */}
            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 px-5">
              <MagnifyingGlassIcon
                size={20}
                weight="light"
                className="shrink-0 text-zinc-500 dark:text-zinc-400"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search shampoos, wheels, kits…"
                aria-label="Search products"
                className="w-full bg-transparent py-5 text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
              />
              {typeof window !== 'undefined' &&
                (window.SpeechRecognition ?? window.webkitSpeechRecognition) && (
                  <button
                    type="button"
                    aria-label={listening ? 'Listening — speak now' : 'Search by voice'}
                    aria-pressed={listening}
                    onClick={startVoice}
                    className={`cursor-pointer p-2 transition-colors ${
                      listening
                        ? 'text-zinc-900 dark:text-white animate-pulse'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <MicrophoneIcon size={18} weight={listening ? 'fill' : 'light'} />
                  </button>
                )}
              <button
                type="button"
                aria-label="Close search"
                onClick={onClose}
                className="cursor-pointer p-2 text-zinc-500 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                <XIcon size={18} weight="light" />
              </button>
            </div>

            {/* Results */}
            {!query.trim() && recent.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 px-5 py-3">
                <span className="text-[11px] font-medium tracking-[0.2em] text-zinc-500 dark:text-zinc-400 uppercase">
                  Recent
                </span>
                {recent.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="cursor-pointer rounded-full border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 capitalize transition-colors hover:border-zinc-900 dark:hover:border-white"
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}
            <div className="max-h-[55vh] overflow-y-auto p-2">
              <p
                aria-live="polite"
                className="px-3 pt-2 pb-1 text-[11px] tracking-[0.2em] text-zinc-600 dark:text-zinc-400 uppercase"
              >
                {query.trim()
                  ? `${results.length} result${results.length === 1 ? '' : 's'}`
                  : 'Popular right now'}
              </p>
              {results.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Nothing matches “{query.trim()}”. Try a category like “wheel” or “shampoo”.
                  </p>
                  <Link
                    to="/shop"
                    onClick={onClose}
                    className="mt-4 inline-block text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase underline underline-offset-4"
                  >
                    Browse everything
                  </Link>
                </div>
              ) : (
                <ul>
                  {results.map((product) => (
                    <li key={product.id}>
                      <Link
                        to={`/product/${product.id}`}
                        onClick={() => {
                          rememberSearch(query)
                          onClose()
                        }}
                        className="flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      >
                        <span>
                          <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {product.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">
                            {product.category}
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatPrice(product.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

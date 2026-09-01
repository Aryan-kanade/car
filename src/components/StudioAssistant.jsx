import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { m } from 'motion/react'
import { ChatsCircleIcon } from '@phosphor-icons/react/dist/csr/ChatsCircle'
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt'
import { XIcon } from '@phosphor-icons/react/dist/csr/X'
import { formatPrice, purchasableProducts } from '../data/catalog'
import { searchProducts } from '../utils/search'
import { useFocusTrap } from '../hooks/useFocusTrap'

const QUICK_REPLIES = [
  'Best shampoo?',
  'Something for wheels',
  'Under ₹500',
  'Gift ideas',
  'I am a beginner',
]

const INTENTS = [
  {
    id: 'price',
    match: /(under|below|less than|cheap|budget)\s*(₹)?\s*(\d+)/i,
    reply: (message) => {
      const amount = Number(message.match(/(\d{3,5})/)?.[1] ?? 500)
      const picks = purchasableProducts
        .filter((p) => p.price <= amount && p.price > 0)
        .sort((a, b) => b.price - a.price)
        .slice(0, 3)
      return picks.length
        ? { text: `Everything here is under ₹${amount}:`, products: picks }
        : { text: 'Nothing under that price yet — the samples are free with any order though.' }
    },
  },
  {
    id: 'gift',
    match: /gift|present|birthday|diwali/i,
    reply: () => ({
      text: 'Gifts always land well here — the PRO kit is the flagship, and gift cards never expire:',
      products: [
        ...purchasableProducts.filter((p) => p.category === 'Gift Cards').slice(0, 1),
        ...purchasableProducts.filter((p) => p.id === 'complete-detail-kit'),
      ].filter(Boolean),
    }),
  },
  {
    id: 'wheel',
    match: /wheel|tyre|tire|brake|rim/i,
    reply: () => ({
      text: 'For wheels and tyres, this is the sequence the studio recommends:',
      products: purchasableProducts.filter((p) => p.category === 'Wheel Care'),
    }),
  },
  {
    id: 'shampoo',
    match: /shampoo|wash|soap|foam/i,
    reply: () => ({
      text: 'Three wash-stage formulas, three jobs — pick by your paint:',
      products: purchasableProducts.filter((p) =>
        ['pre-wash-shampoo', 'washberry-shampoo', 'wax-shampoo'].includes(p.id)
      ),
    }),
  },
  {
    id: 'beginner',
    match: /beginner|start|new|first/i,
    reply: () => ({
      text: 'Start simple — the quiz builds a routine for your exact car in three questions, or grab the starter kit:',
      products: purchasableProducts.filter((p) => p.id === 'essentials-wash-kit'),
      link: { to: '/quiz', label: 'Take the 3-question quiz' },
    }),
  },
  {
    id: 'interior',
    match: /interior|dash|cabin|inside|seat/i,
    reply: () => ({
      text: 'For the cabin, these are the studio picks:',
      products: purchasableProducts.filter((p) => p.category === 'Interior Care'),
    }),
  },
]

function respond(message) {
  for (const intent of INTENTS) {
    if (intent.match.test(message)) return intent.reply(message)
  }
  const results = searchProducts(message, 3)
  if (results.length > 0) {
    return { text: 'Closest matches from the shelf:', products: results }
  }
  return {
    text: 'I did not catch that — try "best shampoo", "wheel care", "under ₹500" or "gift".',
  }
}

function ProductRow({ product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 transition-colors hover:border-zinc-900 dark:hover:border-white"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {product.name}
        </span>
        <span className="text-xs text-zinc-800 dark:text-zinc-400">{product.category}</span>
      </span>
      <span className="shrink-0 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {product.price === 0 ? 'Free' : formatPrice(product.price)}
      </span>
    </Link>
  )
}

/**
 * "Ask the Studio" — a rule-based shopping assistant. Keyword-intent
 * matching over the catalog with quick replies; feels like AI, runs on
 * keywords entirely client-side.
 */
export default function StudioAssistant() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    { role: 'studio', text: 'Studio here — ask about products, routines, gifts or budgets.' },
  ])
  const scrollRef = useRef(null)
  const panelRef = useRef(null)

  useFocusTrap(panelRef, open)

  useEffect(() => {
    if (!open) return
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = (text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setInput('')
    const answer = respond(trimmed)
    setMessages((current) => [
      ...current,
      { role: 'you', text: trimmed },
      { role: 'studio', ...answer },
    ])
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        aria-label={open ? 'Close the studio assistant' : 'Ask the studio'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="fixed right-6 bottom-24 z-50 flex cursor-pointer items-center gap-2.5 rounded-full bg-zinc-900 dark:bg-white py-3.5 pl-4 pr-5 text-xs font-semibold tracking-[0.15em] text-white dark:text-zinc-900 uppercase shadow-lg transition-transform hover:scale-105 md:bottom-6"
      >
        {open ? (
          <XIcon size={18} weight="light" aria-hidden="true" />
        ) : (
          <ChatsCircleIcon size={18} weight="light" aria-hidden="true" />
        )}
        {open ? 'Close' : 'Ask the studio'}
      </button>

      {/* Panel */}
      <m.div
        ref={panelRef}
        role="dialog"
        aria-label="Studio assistant"
        initial={false}
        animate={
          open
            ? { opacity: 1, y: 0, pointerEvents: 'auto' }
            : { opacity: 0, y: 16, pointerEvents: 'none' }
        }
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed right-6 bottom-40 z-50 flex max-h-[26rem] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 shadow-2xl md:bottom-24"
      >
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-3">
            {messages.map((message, index) => (
              <li key={index}>
                <p
                  className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    message.role === 'you'
                      ? 'ml-auto bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  {message.text}
                </p>
                {message.products?.length > 0 && (
                  <div className="mt-2.5 space-y-2">
                    {message.products.map((product) => (
                      <ProductRow key={product.id} product={product} />
                    ))}
                  </div>
                )}
                {message.link && (
                  <Link
                    to={message.link.to}
                    onClick={() => setOpen(false)}
                    className="mt-2.5 inline-block text-xs font-semibold tracking-[0.15em] text-zinc-900 dark:text-zinc-100 uppercase underline underline-offset-4"
                  >
                    {message.link.label} →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick replies */}
        <div className="flex gap-2 overflow-x-auto border-t border-zinc-200 dark:border-zinc-800 px-4 py-2.5">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => send(reply)}
              className="shrink-0 cursor-pointer rounded-full border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-300 transition-colors hover:border-zinc-900 dark:hover:border-white"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            send(input)
          }}
          className="flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-800 px-4 py-3"
        >
          <label htmlFor="studio-input" className="sr-only">
            Ask the studio
          </label>
          <input
            id="studio-input"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about products…"
            className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="cursor-pointer rounded-md bg-zinc-900 dark:bg-white p-2 text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            <PaperPlaneTiltIcon size={14} weight="light" />
          </button>
        </form>
      </m.div>
    </>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, m } from 'motion/react'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { CommandIcon } from '@phosphor-icons/react/dist/csr/Command'
import { GearSixIcon } from '@phosphor-icons/react/dist/csr/GearSix'
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { NotebookIcon } from '@phosphor-icons/react/dist/csr/Notebook'
import { PackageIcon } from '@phosphor-icons/react/dist/csr/Package'
import { PaletteIcon } from '@phosphor-icons/react/dist/csr/Palette'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { SparkleIcon } from '@phosphor-icons/react/dist/csr/Sparkle'
import { categoryRoutes, formatPrice, purchasableProducts } from '../data/catalog'
import { notes } from '../data/notes'
import { useCart } from '../context/CartContext'
import { useTheme } from '../hooks/useTheme'
import { useFocusTrap } from '../hooks/useFocusTrap'

/** Simple subsequence fuzzy match — higher score = better match; -1 = no match. */
function fuzzyScore(haystack, needle) {
  const h = haystack.toLowerCase()
  const n = needle.toLowerCase()
  let score = 0
  let hi = 0
  for (const char of n) {
    const found = h.indexOf(char, hi)
    if (found === -1) return -1
    score += found === hi ? 2 : 1
    hi = found + 1
  }
  return score
}

/**
 * Command palette (Ctrl/Cmd+K) — keyboard-first launcher across pages,
 * products, categories and actions. Complements the product search overlay.
 */
export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()
  const { toggle: toggleTheme } = useTheme()
  const { openDrawer } = useCart()
  const inputRef = useRef(null)
  const panelRef = useRef(null)
  const listRef = useRef(null)

  useFocusTrap(panelRef, open)

  const commands = useMemo(
    () => [
      { label: 'Toggle dark mode', hint: 'Action', icon: PaletteIcon, run: toggleTheme },
      { label: 'Open cart', hint: 'Action', icon: PackageIcon, run: openDrawer },
      { label: 'Home', hint: 'Page', icon: ArrowRightIcon, to: '/' },
      { label: 'Shop All', hint: 'Page', icon: MagnifyingGlassIcon, to: '/shop' },
      { label: 'Build Your Kit', hint: 'Builder', icon: PlusIcon, to: '/builder' },
      { label: 'Find Your Routine', hint: 'Quiz', icon: SparkleIcon, to: '/quiz' },
      { label: 'Dilution Calculator', hint: 'Tool', icon: GearSixIcon, to: '/calculator' },
      { label: 'Lab Notes', hint: 'Blog', icon: NotebookIcon, to: '/notes' },
      { label: 'Order History', hint: 'Orders', icon: PackageIcon, to: '/orders' },
      ...categoryRoutes.map((c) => ({
        label: `Shop: ${c.name}`,
        hint: 'Category',
        icon: MagnifyingGlassIcon,
        to: `/shop/${c.slug}`,
      })),
      ...notes.map((note) => ({
        label: `Guide: ${note.title}`,
        hint: 'Lab Notes',
        icon: NotebookIcon,
        to: `/notes/${note.slug}`,
      })),
      ...purchasableProducts.map((p) => ({
        label: p.name,
        hint: `${p.category} · ${formatPrice(p.price)}`,
        icon: PackageIcon,
        to: `/product/${p.id}`,
      })),
    ],
    [toggleTheme, openDrawer]
  )

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return commands.slice(0, 9)
    return commands
      .map((command) => ({ command, score: fuzzyScore(command.label, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 9)
      .map((entry) => entry.command)
  }, [commands, query])

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

  const execute = (command) => {
    onClose()
    if (command.run) command.run()
    if (command.to) navigate(command.to)
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
    } else if (event.key === 'Enter' && filtered[activeIndex]) {
      event.preventDefault()
      execute(filtered[activeIndex])
    }
  }

  useEffect(() => {
    const items = listRef.current?.querySelectorAll('[data-command-index]')
    items?.[activeIndex]?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <AnimatePresence>
      {open && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-60 bg-zinc-950/40"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <m.div
            ref={panelRef}
            initial={{ opacity: 0, y: -12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mx-auto mt-24 w-[calc(100%-3rem)] max-w-xl overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 px-5">
              <MagnifyingGlassIcon size={18} weight="light" className="shrink-0 text-zinc-800" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={onKeyDown}
                placeholder="Search pages, products, actions…"
                aria-label="Search commands"
                className="w-full bg-transparent py-4.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none"
              />
              <kbd className="shrink-0 rounded border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-800 dark:text-zinc-400">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <ul ref={listRef} className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
              {filtered.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-zinc-800 dark:text-zinc-400">
                  Nothing matches “{query.trim()}”.
                </li>
              ) : (
                filtered.map((command, index) => {
                  const Icon = command.icon
                  const isActive = index === activeIndex
                  return (
                    <li key={command.label} role="option" aria-selected={isActive}>
                      <button
                        type="button"
                        data-command-index={index}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => execute(command)}
                        className={`flex w-full cursor-pointer items-center gap-3.5 rounded-lg px-4 py-3 text-left transition-colors ${
                          isActive
                            ? 'bg-zinc-100 dark:bg-zinc-900'
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60'
                        }`}
                      >
                        <Icon
                          size={17}
                          weight="light"
                          className="shrink-0 text-zinc-800"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-zinc-900 dark:text-zinc-100">
                          {command.label}
                        </span>
                        <span className="shrink-0 text-xs text-zinc-800 dark:text-zinc-400">
                          {command.hint}
                        </span>
                        {isActive && (
                          <ArrowRightIcon
                            size={13}
                            weight="light"
                            className="shrink-0 text-zinc-800"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>

            {/* Footer hint */}
            <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 px-5 py-2.5 text-[11px] text-zinc-800 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <CommandIcon size={12} weight="light" aria-hidden="true" />K to open · ↑↓ navigate ·
                ↵ select
              </span>
              <span>
                {filtered.length} result{filtered.length === 1 ? '' : 's'}
              </span>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

import { AnimatePresence, m } from 'motion/react'
import Placeholder from '../Placeholder'

/** Product gallery — switchable views with cursor-tracking zoom. */
export default function Gallery({ views, view, onViewChange }) {
  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <AnimatePresence mode="popLayout">
        <m.div
          key={view}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="group relative cursor-zoom-in overflow-hidden rounded-xl"
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect()
              const x = ((event.clientX - rect.left) / rect.width) * 100
              const y = ((event.clientY - rect.top) / rect.height) * 100
              event.currentTarget.style.setProperty('--zoom-origin', `${x}% ${y}%`)
            }}
          >
            <div
              className="transition-transform duration-300 group-hover:scale-[1.6]"
              style={{ transformOrigin: 'var(--zoom-origin, 50% 50%)' }}
            >
              <Placeholder label={views[view]} iconSize={48} className="aspect-square" />
            </div>
          </div>
        </m.div>
      </AnimatePresence>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {views.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-label={`Show image ${index + 1} of 3`}
            aria-pressed={view === index}
            onClick={() => onViewChange(index)}
            className={`cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
              view === index
                ? 'border-zinc-900 dark:border-white'
                : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
            }`}
          >
            <Placeholder label={label} iconSize={20} className="aspect-square rounded-md" />
          </button>
        ))}
      </div>
    </m.div>
  )
}

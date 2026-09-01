import { AnimatePresence, m } from 'motion/react'
import { PlayCircleIcon } from '@phosphor-icons/react/dist/csr/PlayCircle'
import Placeholder from '../Placeholder'
import BottleViewer from '../BottleViewer'

/** Product gallery — switchable views with zoom and a demo-video slot. */
export default function Gallery({ views, view, onViewChange }) {
  const isVideo = view === views.length - 1 && views.length > 3

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
          {view === 0 ? (
            <BottleViewer label={views[0]} className="aspect-square" />
          ) : (
            <div
              className={`group relative overflow-hidden rounded-xl ${isVideo ? 'cursor-pointer' : 'cursor-zoom-in'}`}
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
              {isVideo && (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950/30 text-white">
                  <PlayCircleIcon size={56} weight="fill" aria-hidden="true" />
                  <span className="text-xs font-semibold tracking-[0.25em] uppercase">
                    Watch the demo
                  </span>
                </span>
              )}
            </div>
          )}
        </m.div>
      </AnimatePresence>
      <div className={`mt-4 grid gap-4 ${views.length > 3 ? 'grid-cols-4' : 'grid-cols-3'}`}>
        {views.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-label={
              index === views.length - 1 && views.length > 3
                ? 'Show product demo video'
                : index === 0
                  ? 'Show interactive 3D view'
                  : `Show image ${index} of ${views.length - (views.length > 3 ? 1 : 0)}`
            }
            aria-pressed={view === index}
            onClick={() => onViewChange(index)}
            className={`relative cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
              view === index
                ? 'border-zinc-900 dark:border-white'
                : 'border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
            }`}
          >
            <Placeholder label={label} iconSize={20} className="aspect-square rounded-md" />
            {index === views.length - 1 && views.length > 3 && (
              <span
                className="absolute inset-0 flex items-center justify-center bg-zinc-950/30 text-white"
                aria-hidden="true"
              >
                <PlayCircleIcon size={20} weight="fill" />
              </span>
            )}
          </button>
        ))}
      </div>
    </m.div>
  )
}

import { useCallback, useRef, useState } from 'react'
import { ArrowsLeftRightIcon } from '@phosphor-icons/react/dist/csr/ArrowsLeftRight'
import Placeholder from './Placeholder'

/**
 * Accessible before/after comparison slider. Drag the center handle (or
 * anywhere on the image) to sweep; a native range input mirrors the value
 * so it stays keyboard-operable (WCAG 2.5.7).
 */
export default function BeforeAfterSlider({
  beforeLabel,
  afterLabel,
  className = '',
  iconSize = 40,
}) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef(null)
  const draggingRef = useRef(false)

  const positionFromClientX = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return 50
    const ratio = ((clientX - rect.left) / rect.width) * 100
    return Math.min(100, Math.max(0, Math.round(ratio)))
  }, [])

  const onPointerDown = (event) => {
    draggingRef.current = true
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setPosition(positionFromClientX(event.clientX))
  }

  const onPointerMove = (event) => {
    if (!draggingRef.current) return
    event.preventDefault()
    setPosition(positionFromClientX(event.clientX))
  }

  const onPointerUp = () => {
    draggingRef.current = false
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`group relative cursor-ew-resize touch-none overflow-hidden rounded-xl select-none ${className}`}
    >
      {/* After layer (bottom) */}
      <Placeholder label={afterLabel} iconSize={iconSize} className="aspect-[16/10] rounded-none" />

      {/* Before layer, clipped by the slider position */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        aria-hidden="true"
      >
        <Placeholder
          label={beforeLabel}
          iconSize={iconSize}
          className="h-full w-full rounded-none grayscale"
        />
      </div>

      {/* Labels */}
      <span
        aria-hidden="true"
        className="absolute top-4 left-4 rounded-full bg-zinc-950/80 px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-white uppercase"
        style={{ opacity: position > 15 ? 1 : 0 }}
      >
        Before
      </span>
      <span
        aria-hidden="true"
        className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-zinc-900 uppercase"
        style={{ opacity: position < 85 ? 1 : 0 }}
      >
        After
      </span>

      {/* Handle — draggable, grows on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)] transition-all duration-300 group-hover:w-1"
        style={{ left: `${position}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg ring-1 ring-zinc-900/10 transition-transform duration-300 group-hover:scale-125">
          <ArrowsLeftRightIcon size={20} weight="bold" />
        </span>
      </div>

      {/* Accessible keyboard control (mirrors the drag value) */}
      <label
        className="absolute inset-x-0 bottom-0 z-10 flex cursor-default items-center gap-3 bg-gradient-to-t from-zinc-950/70 to-transparent px-5 pb-4 pt-10"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <span className="sr-only">Reveal the after state</span>
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-valuetext={`${position}% after`}
          className="h-1.5 w-full cursor-pointer accent-white"
        />
      </label>
    </div>
  )
}

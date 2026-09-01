import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowsLeftRightIcon } from '@phosphor-icons/react/dist/csr/ArrowsLeftRight'
import Placeholder from './Placeholder'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

/**
 * Accessible before/after comparison slider. Drag the center handle (or
 * anywhere on the image) to sweep — position updates are written straight
 * to the DOM inside a rAF pass, so dragging causes zero React re-renders
 * and the handle tracks the pointer 1:1. A native range input mirrors the
 * value for keyboard users (WCAG 2.5.7).
 */
export default function BeforeAfterSlider({
  beforeLabel,
  afterLabel,
  className = '',
  iconSize = 40,
}) {
  const [position, setPosition] = useState(50)

  const containerRef = useRef(null)
  const beforeRef = useRef(null)
  const lineRef = useRef(null)
  const beforeLabelRef = useRef(null)
  const afterLabelRef = useRef(null)
  const draggingRef = useRef(false)
  const rafRef = useRef(null)

  /** Paint a position (0–100) directly to the DOM — no React involved. */
  const paint = useCallback((value) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      if (beforeRef.current) {
        beforeRef.current.style.clipPath = `inset(0 ${100 - value}% 0 0)`
      }
      if (lineRef.current) {
        lineRef.current.style.left = `${value}%`
      }
      if (beforeLabelRef.current) {
        beforeLabelRef.current.style.opacity = value > 15 ? '1' : '0'
      }
      if (afterLabelRef.current) {
        afterLabelRef.current.style.opacity = value < 85 ? '1' : '0'
      }
    })
  }, [])

  useEffect(() => () => rafRef.current && cancelAnimationFrame(rafRef.current), [])

  const positionFromClientX = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return 50
    return Math.round(clamp(((clientX - rect.left) / rect.width) * 100, 0, 100))
  }, [])

  const onPointerDown = (event) => {
    draggingRef.current = true
    event.currentTarget.setPointerCapture?.(event.pointerId)
    paint(positionFromClientX(event.clientX))
  }

  const onPointerMove = (event) => {
    if (!draggingRef.current) return
    event.preventDefault()
    paint(positionFromClientX(event.clientX))
  }

  const onPointerUp = (event) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    // Sync React state once, at rest — keeps the accessible input truthful
    setPosition(positionFromClientX(event.clientX))
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
        ref={beforeRef}
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
        ref={beforeLabelRef}
        aria-hidden="true"
        className="absolute top-4 left-4 rounded-full bg-zinc-950/80 px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-white uppercase"
        style={{ opacity: position > 15 ? 1 : 0 }}
      >
        Before
      </span>
      <span
        ref={afterLabelRef}
        aria-hidden="true"
        className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-zinc-900 uppercase"
        style={{ opacity: position < 85 ? 1 : 0 }}
      >
        After
      </span>

      {/* Handle — draggable; only the hover width-growth transitions, never the position */}
      <div
        ref={lineRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)] transition-[width] duration-300 group-hover:w-1 will-change-[left]"
        style={{ left: `${position}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg ring-1 ring-zinc-900/10 transition-transform duration-300 group-hover:scale-125">
          <ArrowsLeftRightIcon size={20} weight="bold" />
        </span>
      </div>

      {/* Accessible keyboard control (invisible; drag is the primary interaction) */}
      <label className="sr-only" onPointerDown={(event) => event.stopPropagation()}>
        <span className="sr-only">Reveal the after state</span>
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => {
            const next = Number(event.target.value)
            setPosition(next)
            paint(next)
          }}
          aria-valuetext={`${position}% after`}
          className="h-1.5 w-full cursor-pointer accent-white"
        />
      </label>
    </div>
  )
}

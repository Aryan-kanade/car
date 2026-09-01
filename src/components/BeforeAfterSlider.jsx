import { useState } from 'react'
import { ArrowsLeftRightIcon } from '@phosphor-icons/react/dist/csr/ArrowsLeftRight'
import Placeholder from './Placeholder'

/**
 * Accessible before/after comparison slider. A native range input drives
 * the clip position, so it is keyboard-operable out of the box (WCAG 2.5.7).
 * Hovering the panel — or the slider track — lifts the divider and scales
 * the handle so the interaction is discoverable.
 */
export default function BeforeAfterSlider({
  beforeLabel,
  afterLabel,
  className = '',
  iconSize = 40,
}) {
  const [position, setPosition] = useState(50)

  return (
    <div className={`group/slider relative overflow-hidden rounded-xl select-none ${className}`}>
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
        className="absolute top-4 left-4 rounded-full bg-zinc-950/80 px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-white uppercase transition-opacity duration-200"
        style={{ opacity: position > 15 ? 1 : 0 }}
      >
        Before
      </span>
      <span
        aria-hidden="true"
        className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-zinc-900 uppercase transition-opacity duration-200"
        style={{ opacity: position < 85 ? 1 : 0 }}
      >
        After
      </span>

      {/* Handle — divider line + circle; lifts on hover of panel or track */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.15)] transition-all duration-200 group-hover/slider:w-1 group-hover/slider:bg-white"
        style={{ left: `${position}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg transition-all duration-200 group-hover/slider:scale-110 group-hover/slider:shadow-xl">
          <ArrowsLeftRightIcon size={20} weight="bold" />
        </span>
      </div>

      {/* Accessible control — hovering it also lifts the divider */}
      <label className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-zinc-950/70 to-transparent px-5 pb-4 pt-10">
        <span className="sr-only">Reveal the after state</span>
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-valuetext={`${position}% after`}
          className="h-1.5 w-full cursor-pointer accent-white transition-all duration-200 hover:h-2.5 group-hover/slider:h-2.5"
        />
      </label>
    </div>
  )
}

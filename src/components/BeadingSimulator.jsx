import { useEffect, useRef, useState } from 'react'

const DROP_COUNT = 60

/**
 * Hydrophobic beading simulator — a painted panel where rain beads grow,
 * merge and either cling (untreated) or sheet off (ceramic-coated).
 * Only a detailing brand could make this. Canvas + rAF, ~120 lines.
 */
export default function BeadingSimulator({ className = '' }) {
  const canvasRef = useRef(null)
  const coatedRef = useRef(true)
  const [coated, setCoated] = useState(true)

  useEffect(() => {
    coatedRef.current = coated
  }, [coated])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frame = null
    let drops = []

    const reset = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      drops = Array.from({ length: DROP_COUNT }).map(() => spawn())
    }

    const spawn = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1 + Math.random() * 2,
      vy: 0,
      life: 0,
    })

    const tick = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // panel
      const gradient = ctx.createLinearGradient(0, 0, 0, h)
      if (coatedRef.current) {
        gradient.addColorStop(0, '#1c1c1f')
        gradient.addColorStop(1, '#0a0a0b')
      } else {
        gradient.addColorStop(0, '#4a4a52')
        gradient.addColorStop(1, '#2c2c31')
      }
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, w, h)

      for (const drop of drops) {
        drop.life++
        if (coatedRef.current) {
          // coated: beads grow then sheet downward quickly
          drop.r += 0.08
          drop.vy += 0.05
          drop.y += drop.vy
          if (drop.y > h || drop.r > 14) Object.assign(drop, spawn(), { y: 0 })
        } else {
          // untreated: water spreads flat and clings
          drop.r += 0.05
          drop.vy += 0.004
          drop.y += drop.vy
          if (drop.y > h || drop.r > 22) Object.assign(drop, spawn(), { y: 0 })
        }

        ctx.beginPath()
        ctx.arc(drop.x, drop.y, drop.r, 0, Math.PI * 2)
        ctx.fillStyle = coatedRef.current
          ? 'rgba(245, 245, 247, 0.85)'
          : 'rgba(220, 220, 226, 0.45)'
        ctx.fill()
        // highlight
        ctx.beginPath()
        ctx.arc(drop.x - drop.r * 0.25, drop.y - drop.r * 0.25, drop.r * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.fill()
      }

      frame = requestAnimationFrame(tick)
    }

    reset()
    tick()
    window.addEventListener('resize', reset)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', reset)
    }
  }, [])

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-xl">
        <canvas ref={canvasRef} className="block aspect-[16/9] w-full" aria-hidden="true" />
      </div>
      <div
        className="mt-4 flex items-center justify-center gap-3"
        role="radiogroup"
        aria-label="Panel treatment"
      >
        {[
          { value: false, label: 'Untreated paint' },
          { value: true, label: 'Ceramic-coated' },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={coated === option.value}
            onClick={() => setCoated(option.value)}
            className={`cursor-pointer rounded-md border px-5 py-2.5 text-sm transition-colors ${
              coated === option.value
                ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

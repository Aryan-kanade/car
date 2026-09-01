import { useEffect, useRef, useState } from 'react'

const BRUSH_RADIUS = 42

/**
 * Foam-wipe reveal — a canvas of soap suds over any content; visitors wipe
 * it away with pointer (mouse/touch) using destination-out compositing.
 * Auto-completes once ~70% is cleared. Reduced-motion users see no foam.
 */
export default function FoamWipe({ children, className = '' }) {
  const canvasRef = useRef(null)
  const [revealed, setRevealed] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const wipingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return // foam never paints

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    let foamTimer = null

    const sizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      paintFoam()
    }

    const paintFoam = () => {
      const { width: w, height: h } = canvas
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, w, h)
      // frosted base
      ctx.fillStyle = 'rgba(228, 228, 231, 0.96)'
      ctx.fillRect(0, 0, w, h)
      // suds clusters
      ctx.fillStyle = 'rgba(250, 250, 250, 0.9)'
      for (let i = 0; i < w * h * 0.0025; i++) {
        const x = Math.random() * w
        const y = Math.random() * h
        const r = 4 + Math.random() * 14
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const wipe = (x, y) => {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2)
      ctx.fill()
    }

    const checkProgress = () => {
      // Sample alpha on a sparse grid
      const { width: w, height: h } = canvas
      const data = ctx.getImageData(0, 0, w, h).data
      let clear = 0
      const total = 40
      for (let i = 0; i < total; i++) {
        const x = Math.floor((((i * 7) % 10) / 10) * w)
        const y = Math.floor((Math.floor((i * 7) / 10) / 4) * h)
        const alpha = data[(y * w + x) * 4 + 3]
        if (alpha < 40) clear++
      }
      if (clear / total >= 0.7) {
        setRevealed(true)
      }
    }

    const pointerPos = (event) => {
      const rect = canvas.getBoundingClientRect()
      const source = event.touches ? event.touches[0] : event
      return { x: source.clientX - rect.left, y: source.clientY - rect.top }
    }

    const onDown = (event) => {
      wipingRef.current = true
      const { x, y } = pointerPos(event)
      wipe(x, y)
    }
    const onMove = (event) => {
      if (!wipingRef.current) return
      event.preventDefault()
      const { x, y } = pointerPos(event)
      wipe(x, y)
      if (foamTimer) clearTimeout(foamTimer)
      foamTimer = setTimeout(checkProgress, 120)
    }
    const onUp = () => {
      wipingRef.current = false
      checkProgress()
    }

    sizeCanvas()
    window.addEventListener('resize', sizeCanvas)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    canvas.addEventListener('touchstart', onDown, { passive: false })
    canvas.addEventListener('touchmove', onMove, { passive: false })

    return () => {
      window.removeEventListener('resize', sizeCanvas)
      window.removeEventListener('pointerup', onUp)
      if (foamTimer) clearTimeout(foamTimer)
    }
  }, [])

  const hidden = revealed || dismissed

  return (
    <div className={`relative ${className}`}>
      {children}
      {!hidden && (
        <>
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full cursor-pointer touch-none"
          />
          <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-medium tracking-[0.3em] text-zinc-600 dark:text-zinc-300 uppercase">
            Wipe the foam
          </p>
        </>
      )}
      {revealed && !dismissed && (
        <button
          type="button"
          onClick={() => {
            setDismissed(true)
          }}
          className="sr-only"
        >
          Foam cleared
        </button>
      )}
    </div>
  )
}

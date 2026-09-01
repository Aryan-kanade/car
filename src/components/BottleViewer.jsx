import { useEffect, useRef, useState } from 'react'
import { ArrowsClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowsClockwise'

/**
 * Interactive 360° bottle viewer — a lathed bottle silhouette rendered on
 * canvas with a specular highlight that tracks drag rotation. Zero WebGL,
 * zero dependencies: pure 2D canvas math.
 */
export default function BottleViewer({ label, className = '' }) {
  const canvasRef = useRef(null)
  const rotationRef = useRef(0)
  const draggingRef = useRef(false)
  const [spinning] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frame = null

    const sizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width * (window.devicePixelRatio || 1)
      canvas.height = rect.height * (window.devicePixelRatio || 1)
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0)
    }

    const draw = () => {
      const w = canvas.width / (window.devicePixelRatio || 1)
      const h = canvas.height / (window.devicePixelRatio || 1)
      ctx.clearRect(0, 0, w, h)

      if (spinning && !draggingRef.current) rotationRef.current += 0.012

      const rot = rotationRef.current
      const cx = w / 2
      const bodyW = Math.min(w * 0.42, h * 0.4)
      const bodyH = h * 0.62
      const bodyY = h * 0.5

      // bottle body: lathed silhouette via horizontal ellipse slices
      const dark = document.documentElement.classList.contains('dark')
      const baseBody = dark ? '#27272a' : '#3f3f46'
      const baseNeck = dark ? '#18181b' : '#27272a'
      const steps = 28
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        // profile: narrow at bottom, widest at 65%, shoulder curve to neck
        let halfW
        if (t < 0.12)
          halfW = 0.42 + t * 2 // base flare
        else if (t < 0.62)
          halfW = 0.66 // main body
        else if (t < 0.78)
          halfW = 0.66 - (t - 0.62) * 3.1 // shoulder
        else halfW = 0.24 // neck
        const y = bodyY - bodyH / 2 + t * bodyH
        const sliceW = bodyW * halfW
        // rotation shading: light side shifts with rot
        const phase = Math.sin(rot + t * 1.2)
        const shade = 0.55 + phase * 0.25
        const isNeck = t >= 0.78
        const color = isNeck ? baseNeck : baseBody
        ctx.fillStyle = withAlpha(color, shade)
        ctx.beginPath()
        ctx.ellipse(cx, y, Math.max(1, sliceW / 2), bodyH / steps + 1.2, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      // label band (dark band that rotates around the body)
      const bandPhase = ((rot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const bandVisible = Math.cos(bandPhase)
      if (bandVisible > 0.15) {
        const bandY = bodyY - bodyH * 0.04
        const bandH = bodyH * 0.26
        ctx.fillStyle = dark
          ? `rgba(250, 250, 250, ${0.85 * bandVisible})`
          : `rgba(9, 9, 11, ${0.85 * bandVisible})`
        ctx.beginPath()
        ctx.ellipse(cx, bandY, bodyW * 0.33, bandH / 2, 0, 0, Math.PI * 2)
        ctx.fill()
        // band text hint
        if (bandVisible > 0.5) {
          ctx.fillStyle = dark ? 'rgba(9,9,11,0.9)' : 'rgba(250,250,250,0.9)'
          ctx.font = `600 ${Math.max(9, bodyW * 0.06)}px "Space Grotesk", sans-serif`
          ctx.textAlign = 'center'
          ctx.fillText('KMK', cx, bandY + bodyW * 0.02)
        }
      }

      // specular highlight tracking rotation
      const specX = cx + Math.sin(rot) * bodyW * 0.22
      const grad = ctx.createRadialGradient(
        specX,
        bodyY - bodyH * 0.18,
        2,
        specX,
        bodyY - bodyH * 0.18,
        bodyW * 0.32
      )
      grad.addColorStop(0, dark ? 'rgba(250,250,250,0.35)' : 'rgba(255,255,255,0.45)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.ellipse(cx, bodyY, bodyW * 0.33, bodyH * 0.44, 0, 0, Math.PI * 2)
      ctx.fill()

      // cap
      ctx.fillStyle = dark ? '#09090b' : '#18181b'
      ctx.beginPath()
      ctx.ellipse(
        cx,
        bodyY - bodyH / 2 - bodyH * 0.02,
        bodyW * 0.13,
        bodyH * 0.025,
        0,
        0,
        Math.PI * 2
      )
      ctx.fill()

      frame = requestAnimationFrame(draw)
    }

    const onDown = (event) => {
      draggingRef.current = true
      canvas.setPointerCapture?.(event.pointerId)
    }
    const onMove = (event) => {
      if (!draggingRef.current) return
      rotationRef.current += event.movementX * 0.02
    }
    const onUp = () => {
      draggingRef.current = false
    }

    sizeCanvas()
    frame = requestAnimationFrame(draw)
    window.addEventListener('resize', sizeCanvas)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', sizeCanvas)
      window.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
    }
  }, [spinning])

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block aspect-square h-full w-full cursor-grab touch-none active:cursor-grabbing"
        aria-label={`Interactive 360 degree view: ${label}`}
        role="img"
      />
      <p className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[11px] font-medium tracking-[0.25em] text-zinc-500 dark:text-zinc-400 uppercase">
        <ArrowsClockwiseIcon size={13} weight="light" aria-hidden="true" />
        Drag to rotate
      </p>
    </div>
  )
}

function withAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${Math.min(1, Math.max(0, alpha))})`
}

import { useRef } from 'react'
import { m, useMotionValue, useSpring } from 'motion/react'

/**
 * Magnetic — pointer-tracking spring attraction on hover.
 * Wrap any element; the child drifts toward the cursor.
 */
export default function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 15 })
  const springY = useSpring(y, { stiffness: 200, damping: 15 })

  const onMove = (event) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    x.set(dx * strength)
    y.set(dy * strength)
  }

  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <m.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </m.div>
  )
}

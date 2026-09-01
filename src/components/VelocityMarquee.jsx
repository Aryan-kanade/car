import { useEffect, useRef } from 'react'
import {
  m,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useMotionValue,
  wrap,
} from 'motion/react'

const ITEMS = [
  'pH-balanced',
  'Coating safe',
  'Studio tested',
  '60-day guarantee',
  'Pro-grade formulas',
  'Same-day dispatch',
]

/**
 * Velocity-reactive marquee — the brand ticker translates continuously and
 * its speed and skew respond to scroll velocity (the Awwwards move).
 */
export default function VelocityMarquee({ className = '' }) {
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false })
  const x = useTransform(baseX, (value) => `${wrap(-50, 0, value)}%`)
  const directionFactor = useRef(1)

  useEffect(() => {
    let frame
    const tick = (_timestamp, delta) => {
      let moveBy = directionFactor.current * 0.6 * (delta / 1000)
      if (velocityFactor.get() < 0) directionFactor.current = -1
      else if (velocityFactor.get() > 0) directionFactor.current = 1
      moveBy += directionFactor.current * moveBy * Math.abs(velocityFactor.get())
      baseX.set(baseX.get() + moveBy)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [baseX, velocityFactor])

  const skewX = useTransform(smoothVelocity, [-1500, 0, 1500], [-4, 0, 4])

  return (
    <section
      aria-label="Brand promises"
      className={`overflow-hidden border-y border-zinc-200 dark:border-zinc-800 py-5 ${className}`}
    >
      <m.div style={{ x, skewX }} className="flex w-max flex-nowrap">
        {Array.from({ length: 2 }).map((_, copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {ITEMS.map((item) => (
              <span
                key={item}
                className="flex items-center font-display text-lg font-bold tracking-[0.15em] whitespace-nowrap uppercase text-zinc-900 dark:text-zinc-100 md:text-2xl"
              >
                <span className="px-5 text-zinc-800 dark:text-zinc-600" aria-hidden="true">
                  ✦
                </span>
                {item}
              </span>
            ))}
          </div>
        ))}
      </m.div>
    </section>
  )
}

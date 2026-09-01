import { m } from 'motion/react'

const PIECES = 26
const COLORS = ['#18181b', '#52525b', '#a1a1aa', '#b45309']

/**
 * Tasteful celebratory confetti burst — pure CSS-motion rectangles,
 * respects reduced motion via MotionConfig.
 */
export default function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: PIECES }).map((_, index) => {
        const x = 50 + (index % 2 === 0 ? -1 : 1) * (8 + ((index * 13) % 34))
        const rotate = (index * 47) % 360
        const delay = (index % 5) * 0.04
        const color = COLORS[index % COLORS.length]
        return (
          <m.span
            key={index}
            initial={{ x: '50vw', y: '-3rem', opacity: 1 }}
            animate={{
              x: ['50vw', `calc(50vw + ${x - 50}vw)`],
              y: ['-3rem', '110vh'],
              rotate: [rotate, rotate + 220],
            }}
            transition={{ duration: 2.2 + (index % 4) * 0.3, delay, ease: 'easeIn' }}
            style={{ backgroundColor: color }}
            className="absolute top-0 block h-2.5 w-1.5 rounded-[1px]"
          />
        )
      })}
    </div>
  )
}

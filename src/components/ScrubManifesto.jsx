import { useRef } from 'react'
import { m, useScroll, useTransform } from 'motion/react'

const WORDS =
  'Eight formulas, every applicator, one session — pre-wash to tyre dressing. The PRO kit replaces an entire shelf.'.split(
    ' '
  )

/**
 * Word-by-word scroll-scrubbed manifesto — each word's opacity is tied to
 * scroll progress (the signature storytelling move).
 */
export default function ScrubManifesto({ className = '' }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.45'],
  })

  return (
    <p ref={ref} className={`max-w-xl text-sm leading-relaxed md:text-base ${className}`}>
      {WORDS.map((word, index) => (
        <Word
          key={index}
          progress={scrollYProgress}
          range={[index / WORDS.length, (index + 1) / WORDS.length]}
        >
          {word}{' '}
        </Word>
      ))}
    </p>
  )
}

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.15, 1])
  return (
    <m.span style={{ opacity }} className="inline-block">
      {children}
    </m.span>
  )
}

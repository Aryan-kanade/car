import { m } from 'motion/react'

/**
 * SplitText — headline split into words that translate up inside
 * overflow-hidden masks, staggered on scroll into view.
 */
export default function SplitText({ text, className = '', as: Tag = 'span', delay = 0 }) {
  const words = text.split(' ')

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          aria-hidden="true"
          className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom"
        >
          <m.span
            className="inline-block"
            initial={{ y: '110%' }}
            whileInView={{ y: '0%' }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: delay + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
            {index < words.length - 1 ? '\u00A0' : ''}
          </m.span>
        </span>
      ))}
    </Tag>
  )
}

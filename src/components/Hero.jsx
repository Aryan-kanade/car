import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import Placeholder from './Placeholder'

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + 0.15 * i, duration: 0.8, ease: 'easeOut' },
  }),
}

export default function Hero() {
  const sectionRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '32%'])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden"
    >
      {/* Background image placeholder + soft white gradients (parallax drift) */}
      <motion.div style={reduceMotion ? undefined : { y: bgY }} className="absolute inset-0">
        <Placeholder
          background
          label="Dramatic, low-light wide shot of a freshly detailed luxury car"
          iconSize={44}
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/75 to-white/30 dark:from-zinc-950 dark:via-zinc-950/75 dark:to-zinc-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/60 dark:from-zinc-950 dark:via-transparent dark:to-zinc-950/60" />
      </motion.div>

      {/* Copy */}
      <motion.div
        style={reduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}
        className="relative mx-auto w-full max-w-7xl px-6 py-32 md:py-40"
      >
        <motion.h1
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-display mt-6 max-w-4xl text-4xl leading-[1.08] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase sm:text-5xl md:text-6xl"
        >
          Premium Car Care.
          <br />
          Professional Detailing.
          <br />
          <span className="text-zinc-500 dark:text-zinc-400">Obsessive by Design.</span>
        </motion.h1>

        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-8 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-base"
        >
          pH-balanced chemistry, ceramic-grade protection and studio-tested tools, built for the
          enthusiast who notices every detail.
        </motion.p>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            to="/shop"
            className="group inline-flex items-center justify-center gap-3 bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Shop Now
            <ArrowRightIcon
              size={14}
              weight="light"
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
          <Link
            to="/kits"
            className="inline-flex items-center justify-center border border-zinc-300 dark:border-zinc-700 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
          >
            Explore Kits
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

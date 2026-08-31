import { motion } from 'framer-motion'
import { Breadcrumb } from './Layout'

/**
 * Inner-page header strip: breadcrumb, display-font title and optional
 * subtext on a quiet zinc band that clears the fixed navbar.
 */
export default function PageHeader({ breadcrumb = [], title, subtext, children }) {
  return (
    <div className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        {breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-display mt-4 text-3xl font-bold tracking-[0.08em] uppercase text-zinc-900 md:text-5xl"
        >
          {title}
        </motion.h1>
        {subtext && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-600 md:text-base"
          >
            {subtext}
          </motion.p>
        )}
        {children}
      </div>
    </div>
  )
}

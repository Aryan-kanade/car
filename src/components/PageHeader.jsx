import { m } from 'motion/react'
import { Breadcrumb } from './Layout'

/**
 * Inner-page header strip: breadcrumb, display-font title and optional
 * subtext on a quiet zinc band that clears the fixed navbar.
 */
export default function PageHeader({ breadcrumb = [], title, subtext, children }) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        {breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}
        <m.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="font-display mt-4 text-3xl font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100 md:text-5xl"
        >
          {title}
        </m.h1>
        {subtext && (
          <m.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-800 dark:text-zinc-400 md:text-base"
          >
            {subtext}
          </m.p>
        )}
        {children}
      </div>
    </div>
  )
}

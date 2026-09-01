import { Link } from 'react-router'
import Logo from './Logo'
import Newsletter from './Newsletter'
import { REDEEM_THRESHOLD, REDEEM_VALUE, useLoyalty } from '../context/LoyaltyContext'
import { footerColumns, legalLinks, paymentMethods } from '../data/catalog'

/** Site footer — brand blurb, link columns, payment badges and legal bottom bar. */
export default function Footer() {
  const { balance, canRedeem } = useLoyalty()
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-8 md:pt-28">
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-10">
          {/* Brand */}
          <div>
            <Logo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Professional-grade detailing chemistry for enthusiasts who obsess over the details.
            </p>

            <div className="mt-8">
              <Newsletter />
            </div>

            {/* Studio Points widget */}
            <div className="mt-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3.5">
              <p className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
                Studio Points
              </p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {balance} pts
                </span>{' '}
                ·{' '}
                {canRedeem
                  ? `₹${(REDEEM_VALUE / 100) * 100} reward ready to redeem`
                  : `${REDEEM_THRESHOLD - balance} pts to a reward`}
              </p>
              <div
                className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                role="progressbar"
                aria-valuenow={Math.min(100, Math.round((balance / REDEEM_THRESHOLD) * 100))}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progress to next Studio Points reward"
              >
                <div
                  className="h-full rounded-full bg-zinc-900 dark:bg-white"
                  style={{ width: `${Math.min(100, (balance / REDEEM_THRESHOLD) * 100)}%` }}
                />
              </div>
            </div>

            {/* Payment methods */}
            <div className="mt-8 flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1.5 text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
                {column.heading}
              </h2>
              <ul className="mt-6 space-y-3.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-zinc-500 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-5 border-t border-zinc-200 dark:border-zinc-800 pt-7 md:mt-20 md:flex-row">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            © 2026 KIRAMYKI. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-xs text-zinc-500 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

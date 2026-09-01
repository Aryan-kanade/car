import { useState } from 'react'
import { CopyIcon } from '@phosphor-icons/react/dist/csr/Copy'
import PageHeader from '../components/PageHeader'
import { usePageMeta } from '../hooks/usePageMeta'

/** Referral — share your code; friends save 10%, you earn 250 points. */
export default function ReferralPage() {
  usePageMeta(
    'Referral Program',
    'Share KMKIRAMYKI — friends save 10%, you earn 250 Studio Points.'
  )
  const [copied, setCopied] = useState(false)
  const code = 'KMK-STUDIO'

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Referral' }]}
        title="Referral Program"
        subtext="Detailing is better with company. Share your code — your friend saves 10% on their first order and you earn 250 Studio Points when it ships."
      />

      <div className="mx-auto max-w-2xl px-6 py-14 md:py-20">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-8 text-center">
          <h2 className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
            Your referral code
          </h2>
          <div className="mt-5 flex items-center justify-center gap-3">
            <code className="font-display rounded-lg border border-dashed border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-950 px-6 py-3.5 text-xl font-bold tracking-[0.15em] text-zinc-900 dark:text-zinc-100">
              {code}
            </code>
            <button
              type="button"
              onClick={copy}
              aria-label={`Copy referral code ${code}`}
              className="cursor-pointer rounded-md bg-zinc-900 dark:bg-white p-3.5 text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              <CopyIcon size={16} weight="light" />
            </button>
          </div>
          {copied && (
            <p role="status" className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Copied — send it to a fellow detailer.
            </p>
          )}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              They save 10%
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Your friend enters the code at the promo field at checkout — 10% off their first
              order, any size.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              You earn 250 pts
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              When their order ships, 250 Studio Points land in your balance — halfway to a ₹250
              reward on your next order.
            </p>
          </div>
        </div>

        <p className="mt-8 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          Demo storefront: referral tracking is simulated. Codes entered at checkout apply the 10%
          discount immediately; the point award is not automated.
        </p>
      </div>
    </>
  )
}

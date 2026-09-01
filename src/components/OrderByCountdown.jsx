import { useEffect, useState } from 'react'
import { LightningIcon } from '@phosphor-icons/react/dist/csr/Lightning'
import { dayLabel, estimatedDelivery, msUntilCutoff, countdownLabel } from '../utils/delivery'

/**
 * Live "order within Xh Ym — arrives by Fri 12 Sep" strip. Real
 * EDD when known (serviceability), honest estimate otherwise.
 * Never shows a countdown after the 2 PM IST cutoff.
 */
export default function OrderByCountdown({ edd = null, compact = false }) {
  const [remaining, setRemaining] = useState(() => msUntilCutoff())

  useEffect(() => {
    const timer = setInterval(() => setRemaining(msUntilCutoff()), 30 * 1000)
    return () => clearInterval(timer)
  }, [])

  const arrives = estimatedDelivery(edd)
  const countdown = countdownLabel(remaining)

  return (
    <p
      className={`flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-300 ${compact ? 'text-xs' : 'text-sm'}`}
    >
      <LightningIcon
        size={compact ? 14 : 16}
        weight="fill"
        className="shrink-0 text-amber-500"
        aria-hidden="true"
      />
      {countdown ? (
        <>
          Order within <span className="font-semibold">{countdown}</span> — arrives by{' '}
          <span className="font-semibold">{dayLabel(arrives)}</span>
        </>
      ) : (
        <>
          Order today — arrives by <span className="font-semibold">{dayLabel(arrives)}</span>
        </>
      )}
    </p>
  )
}

import { useMemo, useState } from 'react'
import { CalendarDotsIcon } from '@phosphor-icons/react/dist/csr/CalendarDots'
import { dayLabel, planDetailDay } from '../utils/delivery'

const inputClasses =
  'rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-zinc-900 dark:focus:border-white focus:outline-none'

/**
 * Detail-Day planner 🚗 — pick the weekend you want to detail,
 * we compute the order-by day from live delivery estimates.
 */
export default function DetailDayPlanner({ edd = null }) {
  const [value, setValue] = useState('')

  const plan = useMemo(() => {
    if (!value) return null
    const picked = new Date(`${value}T00:00:00Z`)
    if (Number.isNaN(picked.getTime())) return null
    return planDetailDay(picked, edd)
  }, [value, edd])

  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3.5">
      <label
        htmlFor="detail-day"
        className="flex items-center gap-2 text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase"
      >
        <CalendarDotsIcon size={14} weight="light" aria-hidden="true" />
        Planning a detail day?
      </label>
      <div className="mt-2.5 flex flex-wrap items-center gap-3">
        <input
          id="detail-day"
          type="date"
          value={value}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(event) => setValue(event.target.value)}
          className={inputClasses}
        />
        {plan && (
          <p className="text-sm text-zinc-800 dark:text-zinc-300" role="status">
            {plan.feasible ? (
              <>
                Order by <span className="font-semibold">{dayLabel(plan.orderBy)}</span> (2 PM) and
                it lands in time for{' '}
                <span className="font-semibold">{dayLabel(plan.detailDay)}</span>.
              </>
            ) : (
              <>
                That day is tight — standard delivery reaches around{' '}
                <span className="font-semibold">{dayLabel(plan.orderBy)}</span>. Pick a later day or
                choose a faster courier at checkout.
              </>
            )}
          </p>
        )}
      </div>
    </div>
  )
}

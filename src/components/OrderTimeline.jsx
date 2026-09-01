import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { getOrderStatus } from '../utils/orders'

const STEPS = ['Placed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered']

const STATUS_INDEX = {
  Placed: 0,
  Packed: 1,
  Shipped: 2,
  'Out for delivery': 3,
  Delivered: 4,
}

/**
 * Visual order timeline. Pass a real `status` (+ optional `events`) from
 * /api/track for live Shiprocket data; with only `placedAt` it falls back
 * to the age-derived demo progression.
 */
export default function OrderTimeline({ placedAt, status, events }) {
  const label = status ?? getOrderStatus(placedAt).label
  const current = STATUS_INDEX[label] ?? -1
  const recent = Array.isArray(events) ? events.slice(0, 3) : []

  return (
    <div>
      <ol className="mt-5 flex items-center gap-0" aria-label={`Order timeline — ${label}`}>
        {STEPS.map((step, index) => {
          const done = index <= current
          const isLast = index === STEPS.length - 1
          return (
            <li key={step} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
              <span className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                    done
                      ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'border-zinc-300 dark:border-zinc-700 text-zinc-800'
                  }`}
                  aria-hidden="true"
                >
                  {done ? (
                    <CheckCircleIcon size={14} weight="fill" />
                  ) : (
                    <span className="text-[10px] font-semibold">{index + 1}</span>
                  )}
                </span>
                <span
                  className={`text-[10px] font-medium tracking-wide uppercase ${
                    done ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-800 dark:text-zinc-600'
                  }`}
                >
                  {step}
                </span>
              </span>
              {!isLast && (
                <span
                  className={`mx-2 h-px flex-1 ${index < current ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
      {recent.length > 0 && (
        <ul className="mt-5 space-y-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
          {recent.map((event, index) => (
            <li key={index} className="text-xs text-zinc-800 dark:text-zinc-400">
              <span className="font-medium text-zinc-800 dark:text-zinc-200">{event.activity}</span>
              {event.location ? ` · ${event.location}` : ''}
              {event.date ? (
                <span className="block text-[11px] text-zinc-800 dark:text-zinc-500">
                  {event.date}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

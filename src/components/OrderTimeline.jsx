import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { getOrderStatus } from '../utils/orders'

const STEPS = ['Placed', 'Packed', 'Shipped', 'Delivered']

const STATUS_INDEX = { Placed: 0, Shipped: 2, 'Out for delivery': 3 }

/** Visual order timeline — Placed → Packed → Shipped → Delivered (age-derived). */
export default function OrderTimeline({ placedAt }) {
  const status = getOrderStatus(placedAt)
  const current = STATUS_INDEX[status.label] ?? 0

  return (
    <ol className="mt-5 flex items-center gap-0" aria-label="Order timeline">
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
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-400'
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
                  done ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-600'
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
  )
}

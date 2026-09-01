import { TruckIcon } from '@phosphor-icons/react/dist/csr/Truck'

/**
 * "Arrives by" delivery estimator — order today, arrives in 2–3 working
 * days (metro estimate from the shipping policy).
 */
export default function ArrivesBy({ compact = false }) {
  const arrivesBy = new Date()
  arrivesBy.setDate(arrivesBy.getDate() + 3)

  const label = arrivesBy.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  return (
    <p
      className={`flex items-center gap-2 text-zinc-600 dark:text-zinc-400 ${compact ? 'text-xs' : 'text-sm'}`}
    >
      <TruckIcon size={compact ? 15 : 17} weight="light" className="shrink-0" aria-hidden="true" />
      Order today, arrives by <span className="font-semibold">{label}</span>
    </p>
  )
}

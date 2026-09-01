import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'

/** Shared quantity stepper (buy box + sticky bar). */
export default function QtyStepper({ qty, onChange, compact = false }) {
  const pad = compact ? 'p-2.5' : 'p-3'
  const icon = compact ? 14 : 16
  return (
    <div className="flex items-center border border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, qty - 1))}
        className={`cursor-pointer ${pad} text-zinc-800 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white`}
      >
        <MinusIcon size={icon} weight="light" />
      </button>
      <span
        aria-live="polite"
        className={`${compact ? 'min-w-8 text-xs' : 'min-w-10 text-sm'} text-center font-semibold text-zinc-900 dark:text-zinc-100`}
      >
        {qty}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(99, qty + 1))}
        className={`cursor-pointer ${pad} text-zinc-800 dark:text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-white`}
      >
        <PlusIcon size={icon} weight="light" />
      </button>
    </div>
  )
}

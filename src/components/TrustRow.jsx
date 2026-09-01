import { SealCheckIcon } from '@phosphor-icons/react/dist/csr/SealCheck'
import { TruckIcon } from '@phosphor-icons/react/dist/csr/Truck'
import { ArrowsLeftRightIcon } from '@phosphor-icons/react/dist/csr/ArrowsLeftRight'
import { LockKeyIcon } from '@phosphor-icons/react/dist/csr/LockKey'

const items = [
  { icon: SealCheckIcon, label: '60-day guarantee' },
  { icon: TruckIcon, label: 'Ships same day' },
  { icon: ArrowsLeftRightIcon, label: 'Easy returns' },
  { icon: LockKeyIcon, label: 'Secure checkout' },
]

/** Trust row under the buy box — guarantee, shipping, returns, security. */
export default function TrustRow() {
  return (
    <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex items-center gap-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3.5 py-3 text-xs text-zinc-600 dark:text-zinc-400"
        >
          <Icon
            size={18}
            weight="light"
            className="shrink-0 text-zinc-900 dark:text-zinc-100"
            aria-hidden="true"
          />
          {label}
        </li>
      ))}
    </ul>
  )
}

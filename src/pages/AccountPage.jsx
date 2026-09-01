import { Link } from 'react-router'
import { CarIcon } from '@phosphor-icons/react/dist/csr/Car'
import { HeartIcon } from '@phosphor-icons/react/dist/csr/Heart'
import { PackageIcon } from '@phosphor-icons/react/dist/csr/Package'
import { SealCheckIcon } from '@phosphor-icons/react/dist/csr/SealCheck'
import PageHeader from '../components/PageHeader'
import { formatPrice } from '../data/catalog'
import { useLoyalty, REDEEM_THRESHOLD } from '../context/LoyaltyContext'
import { useWishlist } from '../context/WishlistContext'
import { useGarage } from '../context/GarageContext'
import { getOrderStatus, readOrders } from '../utils/orders'
import { sessionStreak } from '../utils/sessions'
import { usePageMeta } from '../hooks/usePageMeta'

const TIERS = [
  { name: 'Enthusiast', min: 0, perk: 'Earn 1 pt per ₹100' },
  { name: 'Detailer', min: 1000, perk: 'Early access to drops' },
  { name: 'Studio', min: 2500, perk: 'Free shipping on every order' },
]

/** Account hub — points, tier, orders, wishlist and garage at a glance. */
export default function AccountPage() {
  usePageMeta(
    'My Account',
    'Studio Points, tier progress, orders, wishlist and garage in one place.'
  )
  const { balance, canRedeem } = useLoyalty()
  const { ids: wishlistIds } = useWishlist()
  const { cars } = useGarage()
  const orders = readOrders()
  const streak = sessionStreak()
  const shelfCount = (() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem('kmkiramyki-shelf') ?? '[]')
      return Array.isArray(parsed) ? parsed.length : 0
    } catch {
      return 0
    }
  })()

  const tier = [...TIERS].reverse().find((t) => balance >= t.min) ?? TIERS[0]
  const nextTier = TIERS.find((t) => t.min > balance)
  const progress = nextTier ? Math.min(100, (balance / nextTier.min) * 100) : 100

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'My Account' }]}
        title="My Account"
        subtext="Everything the studio knows about you — stored on this device, nowhere else."
      />

      <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">
        {/* Points + tier */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-7">
            <h2 className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
              Studio Points
            </h2>
            <p className="font-display mt-4 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
              {balance}
              <span className="ml-2 text-base font-semibold text-zinc-800 dark:text-zinc-400">
                pts
              </span>
            </p>
            <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-400">
              {canRedeem
                ? `A ${formatPrice(250)} reward is ready to redeem at checkout.`
                : `${REDEEM_THRESHOLD - balance} more points unlocks a ${formatPrice(250)} reward.`}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-7">
            <h2 className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
              Tier · {tier.name}
            </h2>
            <p className="mt-4 flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-400">
              <SealCheckIcon
                size={16}
                weight="fill"
                className="text-zinc-900 dark:text-zinc-100"
                aria-hidden="true"
              />
              {tier.perk}
            </p>
            {nextTier && (
              <>
                <div
                  className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progress to ${nextTier.name}`}
                >
                  <div
                    className="h-full rounded-full bg-zinc-900 dark:bg-white"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-800 dark:text-zinc-400">
                  {nextTier.min - balance} pts to {nextTier.name} — {nextTier.perk.toLowerCase()}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            { to: '/orders', icon: PackageIcon, label: 'Orders', count: orders.length },
            { to: '/session', icon: HeartIcon, label: 'Wash streak', count: streak },
            { to: '/wishlist', icon: HeartIcon, label: 'Wishlist', count: wishlistIds.length },
            { to: '/garage', icon: CarIcon, label: 'Garage', count: cars.length },
            { to: '/shelf', icon: PackageIcon, label: 'Shelf', count: shelfCount },
          ].map(({ to, icon: Icon, label, count }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 transition-colors hover:border-zinc-900 dark:hover:border-white"
            >
              <span className="flex items-center gap-3">
                <Icon
                  size={22}
                  weight="light"
                  className="text-zinc-900 dark:text-zinc-100"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {label}
                </span>
              </span>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-400">
                {count}
              </span>
            </Link>
          ))}
        </div>

        {/* Latest order */}
        {orders.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-lg font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100">
              Latest order
            </h2>
            <div className="mt-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {orders[0].number}
                </p>
                <span className="rounded-full bg-zinc-900 dark:bg-white px-3 py-1 text-[11px] font-semibold tracking-wider text-white dark:text-zinc-900 uppercase">
                  {getOrderStatus(orders[0].placedAt).label}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-800 dark:text-zinc-400">
                {orders[0].items.length} items · {formatPrice(orders[0].total)}
              </p>
              <Link
                to="/orders"
                className="mt-4 inline-block text-xs font-semibold tracking-[0.15em] text-zinc-800 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
              >
                View all orders →
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

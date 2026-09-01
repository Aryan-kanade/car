import { NavLink } from 'react-router'
import { HouseIcon } from '@phosphor-icons/react/dist/csr/House'
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { HeartIcon } from '@phosphor-icons/react/dist/csr/Heart'
import { ShoppingCartIcon } from '@phosphor-icons/react/dist/csr/ShoppingCart'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const linkClasses = ({ isActive }) =>
  `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium tracking-[0.1em] uppercase transition-colors ${
    isActive
      ? 'text-zinc-900 dark:text-white'
      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
  }`

/**
 * Mobile-only bottom navigation — keeps primary destinations in the thumb
 * zone. Hidden on lg+ where the navbar serves everything.
 */
export default function BottomNav({ onOpenSearch }) {
  const { count, openDrawer } = useCart()
  const { count: wishlistCount } = useWishlist()

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md lg:hidden"
    >
      <NavLink viewTransition to="/" end className={linkClasses}>
        <HouseIcon size={22} weight="light" aria-hidden="true" />
        Home
      </NavLink>
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex flex-1 cursor-pointer flex-col items-center gap-1 py-2.5 text-[11px] font-medium tracking-[0.1em] text-zinc-500 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
      >
        <MagnifyingGlassIcon size={22} weight="light" aria-hidden="true" />
        Search
      </button>
      <NavLink viewTransition to="/wishlist" className={linkClasses}>
        <span className="relative">
          <HeartIcon size={22} weight="light" aria-hidden="true" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-zinc-900 dark:bg-white px-1 text-[9px] font-semibold text-white dark:text-zinc-900">
              {wishlistCount}
            </span>
          )}
        </span>
        Wishlist
      </NavLink>
      <button
        type="button"
        onClick={openDrawer}
        className="flex flex-1 cursor-pointer flex-col items-center gap-1 py-2.5 text-[11px] font-medium tracking-[0.1em] text-zinc-500 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
      >
        <span className="relative">
          <ShoppingCartIcon size={22} weight="light" aria-hidden="true" />
          <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-zinc-900 dark:bg-white px-1 text-[9px] font-semibold text-white dark:text-zinc-900">
            {count}
          </span>
        </span>
        Cart
      </button>
    </nav>
  )
}

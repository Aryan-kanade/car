import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { HeartIcon } from '@phosphor-icons/react/dist/csr/Heart'
import { ListIcon } from '@phosphor-icons/react/dist/csr/List'
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { ShoppingCartIcon } from '@phosphor-icons/react/dist/csr/ShoppingCart'
import { XIcon } from '@phosphor-icons/react/dist/csr/X'
import { categoryRoutes } from '../data/catalog'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import MegaMenu from './MegaMenu'

const linkClasses =
  'relative text-[11px] font-medium tracking-[0.15em] text-zinc-500 uppercase transition-colors hover:text-zinc-900 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-zinc-900 after:transition-all after:duration-300 hover:after:w-full'

const desktopLinks = [
  { label: 'Kits', to: '/kits' },
  { label: 'Lab Notes', to: '/notes' },
  { label: 'About', to: '/about' },
]

const mobileLinks = [
  { label: 'Shop All', to: '/shop' },
  { label: 'Kits & Bundles', to: '/kits' },
  { label: 'Lab Notes', to: '/notes' },
  { label: 'About Us', to: '/about' },
  { label: 'Wishlist', to: '/wishlist' },
]

/**
 * Sticky navigation — transparent over the hero, fades to solid white
 * with a hairline border once the page is scrolled.
 */
export default function Navbar({ onOpenSearch }) {
  const { count, openDrawer } = useCart()
  const { count: wishlistCount } = useWishlist()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || menuOpen
          ? 'border-b border-zinc-200 bg-white/85 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-20">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-base font-bold tracking-[0.3em] text-zinc-900 select-none md:text-lg"
        >
          KMKIRAMYKI
        </Link>

        {/* Desktop links — Shop opens the mega menu */}
        <ul className="hidden items-center gap-9 lg:flex">
          <li className="group relative">
            <Link to="/shop" className={linkClasses} aria-haspopup="true">
              Shop
            </Link>
            <MegaMenu />
          </li>
          {desktopLinks.map((link) => (
            <li key={link.label}>
              <Link to={link.to} className={linkClasses}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Action icons — 44px touch targets */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            type="button"
            aria-label="Search"
            onClick={onOpenSearch}
            className="cursor-pointer p-3 text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <MagnifyingGlassIcon size={20} weight="light" />
          </button>
          <Link
            to="/wishlist"
            aria-label={`Wishlist, ${wishlistCount} items`}
            className="relative p-3 text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <HeartIcon size={20} weight="light" />
            {wishlistCount > 0 && (
              <motion.span
                key={wishlistCount}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold text-white"
              >
                {wishlistCount}
              </motion.span>
            )}
          </Link>
          <button
            type="button"
            aria-label={`Cart, ${count} items`}
            onClick={openDrawer}
            className="relative cursor-pointer p-3 text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <ShoppingCartIcon size={20} weight="light" />
            <motion.span
              key={count}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 400 }}
              className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-semibold text-white"
            >
              {count}
            </motion.span>
          </button>
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="cursor-pointer p-3 text-zinc-600 transition-colors hover:text-zinc-900 lg:hidden"
          >
            {menuOpen ? <XIcon size={22} weight="light" /> : <ListIcon size={22} weight="light" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-b border-zinc-200 bg-white lg:hidden"
          >
            <ul className="space-y-1 px-6 py-6">
              <li>
                <p className="pt-2 pb-1 text-[11px] font-semibold tracking-[0.25em] text-zinc-400 uppercase">
                  Shop
                </p>
                <ul>
                  {categoryRoutes.map((category) => (
                    <li key={category.slug}>
                      <Link
                        to={`/shop/${category.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="block py-3 text-xs font-medium tracking-[0.2em] text-zinc-600 uppercase transition-colors hover:text-zinc-900"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              {mobileLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 text-xs font-medium tracking-[0.2em] text-zinc-600 uppercase transition-colors hover:text-zinc-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

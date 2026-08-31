import { Link } from 'react-router-dom'
import { FireIcon } from '@phosphor-icons/react/dist/csr/Fire'
import { HeartIcon } from '@phosphor-icons/react/dist/csr/Heart'
import { ShoppingCartIcon } from '@phosphor-icons/react/dist/csr/ShoppingCart'
import { StarIcon } from '@phosphor-icons/react/dist/csr/Star'
import Placeholder from './Placeholder'
import { formatPrice } from '../data/catalog'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

/** Product card — discount badge, wishlist heart, hover "Add to cart" overlay. */
export default function ProductCard({ product }) {
  const { rating } = product
  const { addItem } = useCart()
  const { has, toggle } = useWishlist()
  const wished = has(product.id)

  return (
    <article className="group flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden rounded-lg">
        <Link to={`/product/${product.id}`} aria-label={product.name} className="block">
          <Placeholder
            label={product.imageLabel}
            iconSize={32}
            className="aspect-[4/5] transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </Link>

        <span className="absolute top-3 left-3 rounded-full bg-zinc-900 dark:bg-white px-2.5 py-1 text-[11px] font-semibold tracking-wider text-white dark:text-zinc-900 uppercase">
          {product.badge}
        </span>

        <button
          type="button"
          aria-label={
            wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`
          }
          aria-pressed={wished}
          onClick={() => toggle(product.id)}
          className={`absolute top-3 right-3 cursor-pointer rounded-full bg-white/90 dark:bg-zinc-900/90 p-2.5 backdrop-blur-sm transition-colors ${
            wished
              ? 'text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <HeartIcon size={16} weight={wished ? 'fill' : 'light'} />
        </button>

        {/* Hover overlay */}
        <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => addItem(product.id)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-zinc-900 dark:bg-white py-3 text-[11px] font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            <ShoppingCartIcon size={14} weight="regular" />
            Add to cart
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-5 flex flex-col gap-1.5">
        <p className="text-[11px] tracking-[0.15em] text-zinc-500 dark:text-zinc-400 uppercase">
          {product.category}
        </p>
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Link
            to={`/product/${product.id}`}
            className="transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            {product.name}
          </Link>
        </h3>

        {rating && (
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="flex gap-0.5" aria-label={`Rated ${rating.stars} out of 5 stars`}>
              {Array.from({ length: rating.stars }).map((_, i) => (
                <StarIcon
                  key={i}
                  size={12}
                  weight="fill"
                  className="text-zinc-900 dark:text-zinc-100"
                />
              ))}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">({rating.reviews})</span>
          </div>
        )}

        <p className="mt-1 flex items-baseline gap-2.5 text-sm">
          <span className="text-zinc-500 dark:text-zinc-400 line-through">
            {formatPrice(product.compareAt)}
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {formatPrice(product.price)}
          </span>
        </p>

        {product.stock <= 5 && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
            <FireIcon size={13} weight="fill" aria-hidden="true" />
            Only {product.stock} left
          </p>
        )}
      </div>
    </article>
  )
}

import { m } from 'motion/react'

/**
 * Cart count, zero-padded to two digits like a detail-chemical batch code
 * ("03", "10"…) and capped past two digits.
 */
export const padBadgeCount = (count) => (count > 99 ? '99+' : String(count).padStart(2, '0'))

// Aspect of public/cart-shield.png (947 × 1134)
const SHIELD_ASPECT = 947 / 1134

/**
 * Branded cart logo — the customer-supplied spray-bottle artwork with the
 * red shield beside it at the same height, carrying the live item count in
 * bold white centered on the shield. Artwork is served from /public; the
 * count is real text so it updates the moment the cart changes.
 *
 * Decorative by design: the parent button keeps an accessible
 * `aria-label="Cart, N items"` that carries the count to screen readers.
 */
export default function CartLogo({ count = 0, size = 34 }) {
  const label = padBadgeCount(count)

  return (
    <span className="relative inline-flex items-center gap-1" aria-hidden="true">
      <img
        src="/cart-logo.png"
        alt=""
        draggable={false}
        className="inline-block"
        style={{ height: size, width: 'auto' }}
      />
      <span className="relative inline-block" style={{ height: size, width: size * SHIELD_ASPECT }}>
        <img
          src="/cart-shield.png"
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full"
        />
        <m.span
          key={label}
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 400 }}
          className="absolute inset-0 flex translate-y-[3%] items-center justify-center font-bold leading-none text-white tabular-nums select-none"
          style={{ fontSize: Math.round(size * (label.length > 2 ? 0.32 : 0.4)) }}
        >
          {label}
        </m.span>
      </span>
    </span>
  )
}

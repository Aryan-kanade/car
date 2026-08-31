import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { SealCheckIcon } from '@phosphor-icons/react/dist/csr/SealCheck'
import { TruckIcon } from '@phosphor-icons/react/dist/csr/Truck'
import PageHeader from '../components/PageHeader'
import Placeholder from '../components/Placeholder'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '../data/catalog'
import { useCart } from '../context/CartContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { saveOrder } from '../utils/orders'
import { promoGivesFreeShipping } from '../utils/promos'

const STEPS = ['Shipping', 'Payment', 'Confirmed']

const inputClasses =
  'w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none'

function Field({ id, label, error, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

function validateShipping(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = 'Enter a valid email address.'
  if (!form.address.trim()) errors.address = 'Enter your street address.'
  if (!form.city.trim()) errors.city = 'Enter your city.'
  if (!form.state.trim()) errors.state = 'Enter your state.'
  if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = 'PIN code must be 6 digits.'
  return errors
}

function validatePayment(method, form) {
  const errors = {}
  if (method === 'card') {
    if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, '')))
      errors.cardNumber = 'Enter the 16-digit card number.'
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.cardExpiry.trim()))
      errors.cardExpiry = 'Use MM/YY format.'
    if (!/^\d{3,4}$/.test(form.cardCvv.trim())) errors.cardCvv = 'CVV is 3 digits.'
  } else if (!/^[^\s@]+@[^\s@]+$/.test(form.upiId.trim())) {
    errors.upiId = 'Enter a valid UPI ID (name@bank).'
  }
  return errors
}

/** Demo checkout — shipping → payment → confirmation. Orders persist for lookup. */
export default function CheckoutPage() {
  const { items, subtotal, promo, discount, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [method, setMethod] = useState('card')
  const [errors, setErrors] = useState({})
  const [placedOrder, setPlacedOrder] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    upiId: '',
  })

  usePageMeta('Checkout', 'Complete your KMKIRAMYKI order — demo checkout, no real payment.')

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }))

  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const shipping = freeShipping || promoGivesFreeShipping(promo) ? 0 : 199
  const total = Math.max(0, subtotal - discount) + shipping

  // Empty cart (and not showing a confirmation) → guide back to the shop
  if (items.length === 0 && step < 3) {
    return (
      <>
        <PageHeader
          breadcrumb={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]}
          title="Checkout"
        />
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center md:py-32">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            There is nothing to check out yet.
          </p>
          <Link
            to="/shop"
            className="mt-6 bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Continue shopping
          </Link>
        </div>
      </>
    )
  }

  const goToPayment = (event) => {
    event.preventDefault()
    const next = validateShipping(form)
    setErrors(next)
    if (Object.keys(next).length === 0) setStep(2)
  }

  const placeOrder = (event) => {
    event.preventDefault()
    const next = validatePayment(method, form)
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const order = saveOrder({ email: form.email, name: form.name, items, subtotal, promo })
    clearCart()
    setPlacedOrder(order)
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]}
        title={step === 3 ? 'Order Confirmed' : 'Checkout'}
      />

      {/* Progress */}
      {step < 3 && (
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <ol className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-5">
            {STEPS.slice(0, 2).map((label, index) => {
              const number = index + 1
              const active = step === number
              const done = step > number
              return (
                <li key={label} className="flex items-center gap-4">
                  <span
                    aria-current={active ? 'step' : undefined}
                    className={`flex items-center gap-2.5 text-xs font-medium tracking-[0.15em] uppercase ${
                      active
                        ? 'text-zinc-900 dark:text-zinc-100'
                        : done
                          ? 'text-zinc-500 dark:text-zinc-400'
                          : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                        active
                          ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                          : 'border-zinc-300 dark:border-zinc-700'
                      }`}
                    >
                      {number}
                    </span>
                    {label}
                  </span>
                  {index === 0 && (
                    <span className="h-px w-10 bg-zinc-300 md:w-16" aria-hidden="true" />
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        {step === 3 && placedOrder ? (
          /* ── Confirmation ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mx-auto max-w-2xl"
          >
            <div className="flex flex-col items-center rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-14 text-center">
              <SealCheckIcon
                size={48}
                weight="light"
                className="text-zinc-900 dark:text-zinc-100"
                aria-hidden="true"
              />
              <h2 className="font-display mt-6 text-2xl font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100">
                Thank you, {placedOrder.name.split(' ')[0]}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Your order is in. A confirmation is on its way to {placedOrder.email}. This is a
                demo storefront — no payment was taken.
              </p>
              <p className="font-display mt-8 text-3xl font-bold tracking-[0.1em] text-zinc-900 dark:text-zinc-100">
                {placedOrder.number}
              </p>
              <p className="mt-1.5 text-xs tracking-[0.2em] text-zinc-500 dark:text-zinc-400 uppercase">
                Order number
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-7">
              <h3 className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
                What you ordered
              </h3>
              <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
                {placedOrder.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 py-3.5 text-sm"
                  >
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {item.name}
                      {item.size && (
                        <span className="text-zinc-500 dark:text-zinc-400"> · {item.size}</span>
                      )}{' '}
                      <span className="text-zinc-500 dark:text-zinc-400">× {item.qty}</span>
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {formatPrice(item.unitPrice * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-baseline justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Total{placedOrder.shipping === 0 ? ' (free shipping)' : ''}
                </span>
                <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatPrice(placedOrder.total)}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/order-lookup"
                className="group inline-flex items-center justify-center gap-3 bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                Track this order
                <ArrowRightIcon
                  size={14}
                  weight="light"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center border border-zinc-300 dark:border-zinc-700 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
              >
                Continue shopping
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
            {/* ── Active step form ── */}
            <div>
              {step === 1 && (
                <motion.form
                  key="shipping"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  onSubmit={goToPayment}
                  noValidate
                  className="space-y-5"
                >
                  <h2 className="font-display text-lg font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100">
                    Contact & shipping
                  </h2>
                  <Field id="co-name" label="Full name" error={errors.name}>
                    <input
                      id="co-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={set('name')}
                      className={inputClasses}
                      placeholder="Your name"
                      aria-invalid={!!errors.name}
                    />
                  </Field>
                  <Field id="co-email" label="Email" error={errors.email}>
                    <input
                      id="co-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={set('email')}
                      className={inputClasses}
                      placeholder="you@example.com"
                      aria-invalid={!!errors.email}
                    />
                  </Field>
                  <Field id="co-address" label="Street address" error={errors.address}>
                    <input
                      id="co-address"
                      type="text"
                      required
                      autoComplete="street-address"
                      value={form.address}
                      onChange={set('address')}
                      className={inputClasses}
                      placeholder="House, street, landmark"
                      aria-invalid={!!errors.address}
                    />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-3">
                    <Field id="co-city" label="City" error={errors.city}>
                      <input
                        id="co-city"
                        type="text"
                        required
                        autoComplete="address-level2"
                        value={form.city}
                        onChange={set('city')}
                        className={inputClasses}
                        placeholder="City"
                        aria-invalid={!!errors.city}
                      />
                    </Field>
                    <Field id="co-state" label="State" error={errors.state}>
                      <input
                        id="co-state"
                        type="text"
                        required
                        autoComplete="address-level1"
                        value={form.state}
                        onChange={set('state')}
                        className={inputClasses}
                        placeholder="State"
                        aria-invalid={!!errors.state}
                      />
                    </Field>
                    <Field id="co-pin" label="PIN code" error={errors.pincode}>
                      <input
                        id="co-pin"
                        type="text"
                        required
                        inputMode="numeric"
                        maxLength={6}
                        autoComplete="postal-code"
                        value={form.pincode}
                        onChange={set('pincode')}
                        className={inputClasses}
                        placeholder="560001"
                        aria-invalid={!!errors.pincode}
                      />
                    </Field>
                  </div>
                  <button
                    type="submit"
                    className="mt-2 flex w-full cursor-pointer items-center justify-center gap-3 bg-zinc-900 dark:bg-white py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 sm:w-auto sm:px-12"
                  >
                    Continue to payment
                    <ArrowRightIcon size={14} weight="light" />
                  </button>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form
                  key="payment"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  onSubmit={placeOrder}
                  noValidate
                  className="space-y-5"
                >
                  <h2 className="font-display text-lg font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100">
                    Payment
                  </h2>
                  <p className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Demo checkout — card details are validated in the browser only and never stored
                    or transmitted.
                  </p>

                  <fieldset>
                    <legend className="mb-3 text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase">
                      Method
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { value: 'card', label: 'Card' },
                        { value: 'upi', label: 'UPI' },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3.5 text-sm transition-colors ${
                            method === option.value
                              ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                              : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment-method"
                            value={option.value}
                            checked={method === option.value}
                            onChange={() => setMethod(option.value)}
                            className="accent-zinc-900 dark:accent-white"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {method === 'card' ? (
                    <div className="space-y-5">
                      <Field id="co-card" label="Card number" error={errors.cardNumber}>
                        <input
                          id="co-card"
                          type="text"
                          required
                          inputMode="numeric"
                          placeholder="1234 5678 9012 3456"
                          value={form.cardNumber}
                          onChange={set('cardNumber')}
                          className={inputClasses}
                          aria-invalid={!!errors.cardNumber}
                        />
                      </Field>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field id="co-expiry" label="Expiry (MM/YY)" error={errors.cardExpiry}>
                          <input
                            id="co-expiry"
                            type="text"
                            required
                            placeholder="08/27"
                            maxLength={5}
                            value={form.cardExpiry}
                            onChange={set('cardExpiry')}
                            className={inputClasses}
                            aria-invalid={!!errors.cardExpiry}
                          />
                        </Field>
                        <Field id="co-cvv" label="CVV" error={errors.cardCvv}>
                          <input
                            id="co-cvv"
                            type="password"
                            required
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="•••"
                            value={form.cardCvv}
                            onChange={set('cardCvv')}
                            className={inputClasses}
                            aria-invalid={!!errors.cardCvv}
                          />
                        </Field>
                      </div>
                    </div>
                  ) : (
                    <Field id="co-upi" label="UPI ID" error={errors.upiId}>
                      <input
                        id="co-upi"
                        type="text"
                        required
                        placeholder="name@bank"
                        value={form.upiId}
                        onChange={set('upiId')}
                        className={inputClasses}
                        aria-invalid={!!errors.upiId}
                      />
                    </Field>
                  )}

                  <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="cursor-pointer border border-zinc-300 dark:border-zinc-700 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 cursor-pointer bg-zinc-900 dark:bg-white py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
                    >
                      Place order · {formatPrice(total)}
                    </button>
                  </div>
                </motion.form>
              )}
            </div>

            {/* ── Order summary ── */}
            <aside className="h-fit rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-7 lg:sticky lg:top-28">
              <h2 className="text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
                Order summary
              </h2>
              <ul className="mt-5 space-y-4">
                {items.map(({ product, size, qty, lineTotal }) => (
                  <li key={`${product.id}|${size ?? 'kit'}`} className="flex items-center gap-4">
                    <Placeholder
                      label={product.imageLabel}
                      iconSize={14}
                      className="w-12 shrink-0 rounded-md"
                    />
                    <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                      {product.name}
                      {size && (
                        <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                          {size}
                        </span>
                      )}
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                        Qty {qty}
                      </span>
                    </span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {formatPrice(lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>
              <dl className="mt-6 space-y-3 border-t border-zinc-200 dark:border-zinc-800 pt-5 text-sm">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <dt>Discount ({promo.code})</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                      −{formatPrice(discount)}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                  <dt className="flex items-center gap-1.5">
                    <TruckIcon size={15} weight="light" aria-hidden="true" />
                    Shipping
                  </dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  <dt>Total</dt>
                  <dd>{formatPrice(total)}</dd>
                </div>
              </dl>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}

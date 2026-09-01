import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { m } from 'motion/react'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { SealCheckIcon } from '@phosphor-icons/react/dist/csr/SealCheck'
import { TruckIcon } from '@phosphor-icons/react/dist/csr/Truck'
import { MapPinIcon } from '@phosphor-icons/react/dist/csr/MapPin'
import PageHeader from '../components/PageHeader'
import Placeholder from '../components/Placeholder'
import OrderByCountdown from '../components/OrderByCountdown'
import DetailDayPlanner from '../components/DetailDayPlanner'
import { formatPrice } from '../data/catalog'
import { useCart } from '../context/CartContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { saveServerOrder } from '../utils/orders'
import { computeTotals } from '../utils/pricing'
import { loadRazorpay } from '../utils/razorpay'
import {
  buildProfileFromForm,
  defaultAddress,
  addressToForm,
  readProfile,
  rememberPin,
  saveProfile,
} from '../utils/profile'
import { dayLabel } from '../utils/delivery'
import Confetti from '../components/Confetti'
import { lookupGiftCard, redeemGiftCard, useGiftCard } from '../utils/giftcards'
import { REDEEM_THRESHOLD, REDEEM_VALUE, useLoyalty } from '../context/LoyaltyContext'

const STEPS = ['Shipping', 'Payment', 'Confirmed']

const inputClasses =
  'w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none'

function Field({ id, label, error, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase"
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
  if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').replace(/^0?91/, '')))
    errors.phone = 'Enter a valid 10-digit mobile number.'
  if (!form.address.trim()) errors.address = 'Enter your street address.'
  if (!form.city.trim()) errors.city = 'Enter your city.'
  if (!form.state.trim()) errors.state = 'Enter your state.'
  if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = 'PIN code must be 6 digits.'
  return errors
}

const PAYMENT_METHODS = [
  {
    value: 'online',
    label: 'Pay online',
    sub: 'UPI, cards, netbanking & wallets — secured by Razorpay · earns 2× Studio Points',
  },
  {
    value: 'cod',
    label: 'Cash on Delivery',
    sub: 'Pay the courier when your order arrives',
  },
]

/** Retry-safe idempotency key for create-order (uuid with a random fallback). */
function makeIdempotencyKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Checkout — shipping → payment (Razorpay / COD) → confirmation. */
export default function CheckoutPage() {
  const { items, promo, clearCart } = useCart()
  const [profile] = useState(() => (typeof window === 'undefined' ? null : readProfile()))
  const savedAddress = profile ? defaultAddress(profile) : null
  // Returning customers with a saved address start at payment (express)
  const [step, setStep] = useState(savedAddress ? 2 : 1)
  const [method, setMethod] = useState('online')
  const [errors, setErrors] = useState({})
  const [placedOrder, setPlacedOrder] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [payError, setPayError] = useState('')
  const [serviceability, setServiceability] = useState(null) // {loading, result}
  const [giftEnabled, setGiftEnabled] = useState(false)
  const [giftNote, setGiftNote] = useState('')
  const [giftHidePrices, setGiftHidePrices] = useState(true)
  const [gstin, setGstin] = useState(profile?.gstin ?? '')
  const [businessName, setBusinessName] = useState(profile?.businessName ?? '')
  const idemRef = useRef(null)
  const {
    appliedCode: giftCode,
    error: giftError,
    apply: applyGift,
    clear: clearGift,
  } = useGiftCard()
  const { balance, pointsForAmount, canRedeem, spendPoints, addPoints } = useLoyalty()
  const [redeemPoints, setRedeemPoints] = useState(false)
  const [form, setForm] = useState(() => ({
    name: profile?.name ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? '',
    address: savedAddress?.address ?? '',
    city: savedAddress?.city ?? '',
    state: savedAddress?.state ?? '',
    pincode: savedAddress?.pincode ?? '',
  }))

  usePageMeta('Checkout', 'Complete your KMKIRAMYKI order — secure payment via Razorpay.')

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }))

  // Totals are recomputed by /api/create-order from the catalog —
  // this client copy drives the display.
  const pointsDiscount = redeemPoints && canRedeem ? REDEEM_VALUE : 0
  const giftCard = giftCode ? lookupGiftCard(giftCode) : null
  const totals = computeTotals(
    items.map(({ product, size, plan, qty }) => ({ id: product.id, size, plan, qty })),
    promo?.code ?? null,
    pointsDiscount,
    giftCard?.balance ?? 0
  ) ?? { subtotal: 0, discount: 0, shipping: 0, pointsDiscount: 0, giftDiscount: 0, total: 0 }
  const { subtotal, discount, shipping } = totals
  const giftDiscount = totals.giftDiscount

  const svc = serviceability?.result
  const codAllowed = !svc || !svc.serviceable || svc.codAvailable
  const edd = svc?.serviceable ? svc.edd : null

  // Empty cart (and not showing a confirmation) → guide back to the shop
  if (items.length === 0 && step < 3) {
    return (
      <>
        <PageHeader
          breadcrumb={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]}
          title="Checkout"
        />
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center md:py-32">
          <p className="text-sm text-zinc-800 dark:text-zinc-400">
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

  const checkServiceability = async (pincode) => {
    setServiceability({ loading: true, result: null })
    try {
      const res = await fetch(`/api/serviceability?pincode=${encodeURIComponent(pincode)}`)
      const data = await res.json().catch(() => ({}))
      setServiceability({ loading: false, result: res.ok ? data : null })
      return res.ok ? data : null
    } catch {
      setServiceability({ loading: false, result: null })
      return null // network hiccup → treat as unknown, never block
    }
  }

  const goToPayment = async (event) => {
    event.preventDefault()
    const next = validateShipping(form)
    setErrors(next)
    if (Object.keys(next).length > 0) return

    rememberPin(form.pincode.trim())
    const svcData = await checkServiceability(form.pincode.trim())
    if (svcData?.available && svcData.serviceable === false) {
      setErrors({ pincode: `We do not deliver to ${form.pincode} yet.` })
      setStep(1)
      return
    }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  /** Persist the server-confirmed order, apply loyalty side effects, celebrate. */
  const completeOrder = (serverOrder) => {
    // Prepaid customers earn 2× Studio Points
    const base = pointsForAmount(serverOrder.total)
    const pointsEarned = serverOrder.paymentMethod === 'online' ? base * 2 : base
    const order = saveServerOrder({
      ...serverOrder,
      pointsSpent: totals.pointsDiscount > 0 ? REDEEM_THRESHOLD : 0,
      pointsEarned,
      giftCode: totals.giftDiscount > 0 ? giftCode : null,
    })
    // Remember the customer for next time (local-only, no accounts)
    if (!giftEnabled) saveProfile(buildProfileFromForm(form))
    if (totals.pointsDiscount > 0) spendPoints(REDEEM_THRESHOLD)
    addPoints(pointsEarned)
    if (totals.giftDiscount > 0 && giftCode) redeemGiftCard(giftCode, totals.giftDiscount)
    clearCart()
    setPlacedOrder(order)
    setSubmitting(false)
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const reportError = (message) => {
    setSubmitting(false)
    setPayError(message)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  /** Verify the Razorpay signature server-side, then confirm. */
  const confirmPayment = async (orderNumber, razorpayResponse) => {
    const res = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.verified) {
      throw new Error(
        data.error || 'Payment verification failed. If you were charged, contact support.'
      )
    }
    idemRef.current = null
    completeOrder(data.order)
  }

  const openRazorpay = (data) => {
    loadRazorpay().then((Razorpay) => {
      const checkout = new Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: 'INR',
        name: 'KMKIRAMYKI Advanced Chemistry',
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#18181b' },
        handler: (response) => {
          confirmPayment(data.orderNumber, response).catch((err) =>
            reportError(err?.message || 'Payment verification failed.')
          )
        },
        modal: {
          ondismiss: () =>
            reportError(
              'Payment window closed before completion — place the order again to retry.'
            ),
        },
      })
      checkout.on('payment.failed', (response) => {
        reportError(response?.error?.description || 'Payment failed. You can try again.')
      })
      checkout.open()
    }, reportError)
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setPayError('')
    if (!idemRef.current) {
      idemRef.current = makeIdempotencyKey()
    }

    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          items: items.map(({ product, size, plan, qty }) => ({ id: product.id, size, plan, qty })),
          promoCode: promo?.code ?? null,
          pointsDiscount,
          giftDiscount,
          paymentMethod: method,
          idempotencyKey: idemRef.current,
          giftNote: giftEnabled && giftNote.trim() ? giftNote.trim() : null,
          giftHidePrices: giftEnabled && giftHidePrices,
          gstin: gstin.trim() || null,
          businessName: businessName.trim() || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const fieldMessage = data.fieldErrors ? Object.values(data.fieldErrors).join(' ') : ''
        throw new Error(data.error || fieldMessage || `Checkout failed (${res.status}).`)
      }
      if (data.cod) {
        idemRef.current = null
        completeOrder(data.order)
        return
      }
      openRazorpay(data)
    } catch (err) {
      reportError(err?.message || 'Checkout failed. Please try again.')
    }
  }

  const serviceabilityLine = () => {
    if (!serviceability) return null
    if (serviceability.loading)
      return (
        <p className="mt-1.5 text-xs text-zinc-800 dark:text-zinc-400">
          Checking delivery to {form.pincode}…
        </p>
      )
    const result = serviceability.result
    if (!result?.available) return null // not configured / network — stay quiet
    if (result.serviceable) {
      return (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-400">
          <TruckIcon size={13} weight="light" aria-hidden="true" />
          Deliverable{result.edd ? ` by ${dayLabel(new Date(`${result.edd}T00:00:00Z`))}` : ''}
          {result.codAvailable ? ' · COD available' : ' · Prepaid only'}
        </p>
      )
    }
    return (
      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
        We do not deliver to {form.pincode} yet.
      </p>
    )
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
                          ? 'text-zinc-800 dark:text-zinc-400'
                          : 'text-zinc-800 dark:text-zinc-500'
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
          <div className="relative">
            <Confetti />
            <m.div
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
                <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
                  Your order is in and a confirmation is on its way to {placedOrder.email}.{' '}
                  {placedOrder.paymentMethod === 'cod'
                    ? `Keep ${formatPrice(placedOrder.total)} ready for the courier.`
                    : 'Paid online — your parcel ships from our studio shortly.'}
                </p>
                <p className="font-display mt-8 text-3xl font-bold tracking-[0.1em] text-zinc-900 dark:text-zinc-100">
                  {placedOrder.number}
                </p>
                {placedOrder.paymentMethod === 'online' && placedOrder.razorpayPaymentId && (
                  <p className="mt-2 text-xs text-zinc-800 dark:text-zinc-400">
                    Razorpay ref · {placedOrder.razorpayPaymentId}
                  </p>
                )}
                {placedOrder.pointsEarned > 0 && (
                  <p className="mt-3 text-sm text-zinc-800 dark:text-zinc-400">
                    You earned{' '}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {placedOrder.pointsEarned} Studio Points
                    </span>
                    {placedOrder.paymentMethod === 'online' ? ' (2× prepaid bonus)' : ''} on this
                    order.
                  </p>
                )}
                <p className="mt-1.5 text-xs tracking-[0.2em] text-zinc-800 dark:text-zinc-400 uppercase">
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
                      <span className="text-zinc-800 dark:text-zinc-300">
                        {item.name}
                        {item.size && (
                          <span className="text-zinc-800 dark:text-zinc-400"> · {item.size}</span>
                        )}{' '}
                        <span className="text-zinc-800 dark:text-zinc-400">× {item.qty}</span>
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {formatPrice(item.unitPrice * item.qty)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-baseline justify-between border-t border-zinc-200 dark:border-zinc-800 pt-4">
                  <span className="text-sm text-zinc-800 dark:text-zinc-400">
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
                  to={`/invoice/${placedOrder.number}?email=${encodeURIComponent(placedOrder.email)}`}
                  className="inline-flex items-center justify-center border border-zinc-300 dark:border-zinc-700 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
                >
                  View invoice
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center border border-zinc-300 dark:border-zinc-700 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
                >
                  Continue shopping
                </Link>
              </div>
            </m.div>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
            {/* ── Active step form ── */}
            <div>
              {step === 1 && (
                <m.form
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

                  {/* Saved addresses (address book) */}
                  {profile?.addresses?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profile.addresses.map((address, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              ...addressToForm(address),
                              name: f.name || profile.name,
                              email: f.email || profile.email,
                              phone: f.phone || profile.phone,
                            }))
                          }
                          className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-3.5 py-2.5 text-xs transition-colors ${
                            form.address === address.address
                              ? 'border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                              : 'border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 hover:border-zinc-500 dark:hover:border-zinc-500'
                          }`}
                        >
                          <MapPinIcon size={13} weight="light" aria-hidden="true" />
                          {address.label} · {address.city} {address.pincode}
                        </button>
                      ))}
                    </div>
                  )}

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
                  <div className="grid gap-5 sm:grid-cols-2">
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
                    <Field id="co-phone" label="Phone" error={errors.phone}>
                      <input
                        id="co-phone"
                        type="tel"
                        required
                        inputMode="numeric"
                        maxLength={10}
                        autoComplete="tel"
                        value={form.phone}
                        onChange={set('phone')}
                        className={inputClasses}
                        placeholder="9876543210"
                        aria-invalid={!!errors.phone}
                      />
                    </Field>
                  </div>
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
                    <div>
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
                      {serviceabilityLine()}
                    </div>
                  </div>

                  {/* GST invoice (optional) */}
                  <details className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
                    <summary className="cursor-pointer text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase">
                      Add GST invoice details (optional)
                    </summary>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <Field id="co-biz" label="Business name">
                        <input
                          id="co-biz"
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className={inputClasses}
                          placeholder="Studio name"
                        />
                      </Field>
                      <Field id="co-gstin" label="GSTIN">
                        <input
                          id="co-gstin"
                          type="text"
                          maxLength={15}
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value.toUpperCase())}
                          className={inputClasses}
                          placeholder="22AAAAA0000A1Z5"
                          aria-invalid={gstin.length > 0 && !/^[0-9A-Za-z]{15}$/.test(gstin)}
                        />
                      </Field>
                    </div>
                  </details>

                  <button
                    type="submit"
                    disabled={serviceability?.loading}
                    className="mt-2 flex w-full cursor-pointer items-center justify-center gap-3 bg-zinc-900 dark:bg-white py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 sm:w-auto sm:px-12 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Continue to payment
                    <ArrowRightIcon size={14} weight="light" />
                  </button>
                </m.form>
              )}

              {step === 2 && (
                <m.form
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

                  {payError && (
                    <p
                      role="alert"
                      className="rounded-md border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-4 py-3 text-xs leading-relaxed text-red-700 dark:text-red-300"
                    >
                      {payError}
                    </p>
                  )}

                  {/* Express-mode shipping summary (profiled customers) */}
                  {form.address && (
                    <div className="flex items-start justify-between gap-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3.5">
                      <p className="text-sm text-zinc-800 dark:text-zinc-300">
                        <span className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                          <MapPinIcon size={14} weight="light" aria-hidden="true" />
                          {form.name}
                        </span>
                        <span className="mt-1 block text-xs text-zinc-800 dark:text-zinc-400">
                          {form.address}, {form.city}, {form.state} {form.pincode} · {form.phone}
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="shrink-0 cursor-pointer text-xs font-semibold tracking-[0.15em] text-zinc-800 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
                      >
                        Edit
                      </button>
                    </div>
                  )}

                  {/* Order-by countdown + Detail-Day planner */}
                  <OrderByCountdown edd={edd} />
                  <DetailDayPlanner edd={edd} />

                  {/* Studio Points */}
                  <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3.5">
                    {canRedeem ? (
                      <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-zinc-800 dark:text-zinc-300">
                        <span>
                          Redeem {REDEEM_THRESHOLD} of your{' '}
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {balance} Studio Points
                          </span>{' '}
                          for {formatPrice(REDEEM_VALUE)} off
                        </span>
                        <input
                          type="checkbox"
                          checked={redeemPoints}
                          onChange={(event) => setRedeemPoints(event.target.checked)}
                          className="h-4 w-4 shrink-0 accent-zinc-900 dark:accent-white"
                        />
                      </label>
                    ) : (
                      <p className="text-sm text-zinc-800 dark:text-zinc-400">
                        {balance} Studio Points — {REDEEM_THRESHOLD - balance} more to unlock a{' '}
                        {formatPrice(REDEEM_VALUE)} reward
                      </p>
                    )}
                  </div>

                  {/* Gift card */}
                  <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3.5">
                    {giftCode ? (
                      <p className="flex items-center justify-between gap-3 text-sm text-zinc-800 dark:text-zinc-400">
                        <span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {giftCode}
                          </span>{' '}
                          · {formatPrice(lookupGiftCard(giftCode)?.balance ?? 0)} available
                        </span>
                        <button
                          type="button"
                          onClick={clearGift}
                          className="cursor-pointer text-xs font-semibold tracking-[0.15em] text-zinc-800 dark:text-zinc-400 uppercase transition-colors hover:text-zinc-900 dark:hover:text-white"
                        >
                          Remove
                        </button>
                      </p>
                    ) : (
                      <div className="flex gap-2">
                        <label htmlFor="co-gift" className="sr-only">
                          Gift card code
                        </label>
                        <input
                          id="co-gift"
                          type="text"
                          placeholder="Gift card code"
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              applyGift(event.currentTarget.value)
                            }
                          }}
                          className="min-w-0 flex-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600 dark:placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={(event) => {
                            const input = event.currentTarget.previousElementSibling
                            applyGift(input?.value ?? '')
                            if (input) input.value = ''
                          }}
                          className="cursor-pointer rounded-md border border-zinc-300 dark:border-zinc-700 px-4 text-xs font-semibold tracking-[0.15em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                    {giftError && (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">{giftError}</p>
                    )}
                  </div>

                  {/* Gift options */}
                  <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3.5">
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-800 dark:text-zinc-300">
                      <input
                        type="checkbox"
                        checked={giftEnabled}
                        onChange={(event) => setGiftEnabled(event.target.checked)}
                        className="h-4 w-4 shrink-0 accent-zinc-900 dark:accent-white"
                      />
                      <span>
                        It&apos;s a gift{' '}
                        <span className="text-xs text-zinc-800 dark:text-zinc-400">
                          — we&apos;ll pack it without prices
                        </span>
                      </span>
                    </label>
                    {giftEnabled && (
                      <div className="mt-3 space-y-3">
                        <label htmlFor="co-gift-note" className="sr-only">
                          Gift note
                        </label>
                        <textarea
                          id="co-gift-note"
                          value={giftNote}
                          onChange={(event) => setGiftNote(event.target.value)}
                          rows={2}
                          maxLength={280}
                          placeholder="Note for the lucky detailer (optional, handwritten on the slip)"
                          className="w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-600 dark:placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none"
                        />
                        <label className="flex cursor-pointer items-center gap-3 text-xs text-zinc-800 dark:text-zinc-300">
                          <input
                            type="checkbox"
                            checked={giftHidePrices}
                            onChange={(event) => setGiftHidePrices(event.target.checked)}
                            className="h-4 w-4 shrink-0 accent-zinc-900 dark:accent-white"
                          />
                          Hide prices on the packing slip
                        </label>
                      </div>
                    )}
                  </div>

                  <fieldset>
                    <legend className="mb-3 text-xs font-medium tracking-[0.15em] text-zinc-800 dark:text-zinc-300 uppercase">
                      Method
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {PAYMENT_METHODS.map((option) => {
                        const disabled = option.value === 'cod' && !codAllowed
                        return (
                          <label
                            key={option.value}
                            className={`flex items-start gap-3 rounded-md border px-4 py-3.5 text-sm transition-colors ${
                              disabled
                                ? 'cursor-not-allowed border-zinc-200 dark:border-zinc-800 opacity-50'
                                : method === option.value
                                  ? 'cursor-pointer border-zinc-900 dark:border-white bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                                  : 'cursor-pointer border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600'
                            } ${disabled ? '' : 'cursor-pointer'}`}
                          >
                            <input
                              type="radio"
                              name="payment-method"
                              value={option.value}
                              checked={method === option.value}
                              disabled={disabled}
                              onChange={() => setMethod(option.value)}
                              className="mt-0.5 accent-zinc-900 dark:accent-white"
                            />
                            <span>
                              {option.label}
                              <span className="mt-1 block text-xs font-normal text-zinc-800 dark:text-zinc-400">
                                {disabled && option.value === 'cod'
                                  ? 'Not available for this PIN code'
                                  : option.sub}
                              </span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>

                  <p className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-xs leading-relaxed text-zinc-800 dark:text-zinc-300">
                    {method === 'online'
                      ? 'After you place the order, a secure Razorpay window opens to complete payment — UPI, cards, netbanking and wallets. Card details are entered there and never touch our site.'
                      : `Order now and keep ${formatPrice(totals.total)} ready — pay the courier in cash when your parcel arrives.`}
                  </p>

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
                      disabled={submitting}
                      className="flex-1 cursor-pointer bg-zinc-900 dark:bg-white py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting
                        ? 'Processing…'
                        : method === 'online'
                          ? `Pay · ${formatPrice(totals.total)}`
                          : `Place order · ${formatPrice(totals.total)}`}
                    </button>
                  </div>
                </m.form>
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
                    <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-300">
                      {product.name}
                      {size && (
                        <span className="block text-xs text-zinc-800 dark:text-zinc-400">
                          {size}
                        </span>
                      )}
                      <span className="block text-xs text-zinc-800 dark:text-zinc-400">
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
                <div className="flex justify-between text-zinc-800 dark:text-zinc-400">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                    {formatPrice(subtotal)}
                  </dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-zinc-800 dark:text-zinc-400">
                    <dt>Discount ({promo.code})</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                      −{formatPrice(discount)}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between text-zinc-800 dark:text-zinc-400">
                  <dt className="flex items-center gap-1.5">
                    <TruckIcon size={15} weight="light" aria-hidden="true" />
                    Shipping
                  </dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </dd>
                </div>
                {totals.pointsDiscount > 0 && (
                  <div className="flex justify-between text-zinc-800 dark:text-zinc-400">
                    <dt>Studio Points (−{REDEEM_THRESHOLD})</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                      −{formatPrice(totals.pointsDiscount)}
                    </dd>
                  </div>
                )}
                {giftDiscount > 0 && (
                  <div className="flex justify-between text-zinc-800 dark:text-zinc-400">
                    <dt>Gift card ({giftCode})</dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                      −{formatPrice(giftDiscount)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800 pt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  <dt>Total</dt>
                  <dd>{formatPrice(totals.total)}</dd>
                </div>
                <div>
                  <OrderByCountdown edd={edd} compact />
                </div>
              </dl>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}

import { useState } from 'react'
import { Link } from 'react-router'
import { CarIcon } from '@phosphor-icons/react/dist/csr/Car'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import PageHeader from '../components/PageHeader'
import { formatPrice, getProductById } from '../data/catalog'
import { getRoutine } from '../data/quiz'
import { useGarage } from '../context/GarageContext'
import { useCart } from '../context/CartContext'
import { usePageMeta } from '../hooks/usePageMeta'

const FOCUS_OPTIONS = [
  { value: 'paint', label: 'Paint & body' },
  { value: 'wheels', label: 'Wheels & tyres' },
  { value: 'interior', label: 'Interior' },
]

const CONDITION_OPTIONS = [
  { value: 'new', label: 'New / flawless' },
  { value: 'coated', label: 'Coated or PPF-wrapped' },
  { value: 'swirled', label: 'Swirled or dull' },
  { value: 'neglected', label: 'Not detailed in a year+' },
]

const inputClasses =
  'w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:border-zinc-900 dark:focus:border-white focus:outline-none'

/** My Garage — add your cars, get matched routines. A first among detailing brands. */
export default function GaragePage() {
  usePageMeta('My Garage', 'Add your cars and get detailing routines matched to each one.')
  const { cars, addCar, removeCar, routineKeyFor } = useGarage()
  const { addItem } = useCart()

  const [form, setForm] = useState({
    name: '',
    make: '',
    model: '',
    focus: 'paint',
    condition: 'new',
  })

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }))

  const submit = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.make.trim()) return
    addCar({ ...form, name: form.name.trim(), make: form.make.trim(), model: form.model.trim() })
    setForm({ name: '', make: '', model: '', focus: 'paint', condition: 'new' })
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: 'My Garage' }]}
        title="My Garage"
        subtext="Tell the studio about your cars — every vehicle gets a routine matched to its paint, condition and the surfaces you care about. Stored on this device only."
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 md:py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        {/* Add form */}
        <form
          onSubmit={submit}
          className="h-fit space-y-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 p-7 lg:sticky lg:top-28"
        >
          <h2 className="flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
            <CarIcon size={18} weight="light" aria-hidden="true" />
            Add a car
          </h2>
          <div>
            <label
              htmlFor="g-name"
              className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase"
            >
              Nickname
            </label>
            <input
              id="g-name"
              type="text"
              required
              value={form.name}
              onChange={set('name')}
              placeholder="Daily driver"
              className={inputClasses}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="g-make"
                className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase"
              >
                Make
              </label>
              <input
                id="g-make"
                type="text"
                required
                value={form.make}
                onChange={set('make')}
                placeholder="Maruti"
                className={inputClasses}
              />
            </div>
            <div>
              <label
                htmlFor="g-model"
                className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase"
              >
                Model
              </label>
              <input
                id="g-model"
                type="text"
                value={form.model}
                onChange={set('model')}
                placeholder="Swift"
                className={inputClasses}
              />
            </div>
          </div>
          <fieldset>
            <legend className="mb-2 text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase">
              What needs attention?
            </legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Focus">
              {FOCUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={form.focus === option.value}
                  onClick={() => setForm((f) => ({ ...f, focus: option.value }))}
                  className={`cursor-pointer rounded-md border px-4 py-2.5 text-sm transition-colors ${
                    form.focus === option.value
                      ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label
              htmlFor="g-condition"
              className="mb-2 block text-xs font-medium tracking-[0.15em] text-zinc-700 dark:text-zinc-300 uppercase"
            >
              Paint condition
            </label>
            <select
              id="g-condition"
              value={form.condition}
              onChange={set('condition')}
              className={`${inputClasses} cursor-pointer`}
            >
              {CONDITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-center gap-2 bg-zinc-900 dark:bg-white py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            <PlusIcon size={14} weight="light" aria-hidden="true" />
            Add to garage
          </button>
        </form>

        {/* Cars */}
        <div>
          {cars.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-zinc-200 dark:border-zinc-800 px-6 py-16 text-center">
              <CarIcon
                size={48}
                weight="light"
                className="text-zinc-400 dark:text-zinc-600"
                aria-hidden="true"
              />
              <h2 className="font-display mt-6 text-xl font-bold tracking-[0.08em] uppercase text-zinc-900 dark:text-zinc-100">
                Your garage is empty
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Add your first car and the studio will match a detailing routine to its paint and
                condition — then badge matching products across the shop.
              </p>
            </div>
          ) : (
            <ul className="space-y-8">
              {cars.map((car) => {
                const routine = getRoutine({
                  goal: routineKeyFor(car).split('|')[0],
                  focus: car.focus,
                  method: 'any',
                })
                const routineProducts = routine.items
                  .map((item) => ({ ...item, product: getProductById(item.productId) }))
                  .filter((item) => item.product)
                return (
                  <li
                    key={car.id}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-7"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl font-bold tracking-[0.06em] uppercase text-zinc-900 dark:text-zinc-100">
                          {car.name}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {car.make} {car.model} ·{' '}
                          {CONDITION_OPTIONS.find((c) => c.value === car.condition)?.label}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${car.name}`}
                        onClick={() => removeCar(car.id)}
                        className="cursor-pointer p-2 text-zinc-500 transition-colors hover:text-red-600"
                      >
                        <TrashIcon size={18} weight="light" />
                      </button>
                    </div>

                    <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {routine.title}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {routine.summary}
                    </p>

                    <ul className="mt-4 space-y-2.5">
                      {routineProducts.map(({ product }) => (
                        <li
                          key={product.id}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <Link
                            to={`/product/${product.id}`}
                            className="text-zinc-700 dark:text-zinc-300 underline-offset-4 hover:underline"
                          >
                            {product.name}
                          </Link>
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {formatPrice(product.price)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() =>
                        routineProducts.forEach(({ product }, index) =>
                          addItem(product.id, 1, null, {
                            openDrawer: index === routineProducts.length - 1,
                          })
                        )
                      }
                      className="mt-5 cursor-pointer bg-zinc-900 dark:bg-white px-6 py-3 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
                    >
                      Add {car.name}'s routine to cart
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}

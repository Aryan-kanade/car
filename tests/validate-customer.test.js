import { describe, expect, it } from 'vitest'
import { validateCustomer } from '../api/_lib/orders'

const base = {
  name: 'Aryan Kanade',
  email: 'aryan@example.com',
  phone: '9876543210',
  address: '12 Marine Drive',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
}

describe('validateCustomer (delivery)', () => {
  it('accepts a complete customer and normalizes the phone', () => {
    const { ok, errors, customer } = validateCustomer({
      ...base,
      phone: '+91 98765 43210',
    })
    expect(ok).toBe(true)
    expect(errors).toEqual({})
    expect(customer.phone).toBe('9876543210')
  })

  it('rejects a short address and a bad PIN', () => {
    const { ok, errors } = validateCustomer({ ...base, address: 'flat', pincode: '4001' })
    expect(ok).toBe(false)
    expect(errors.address).toBeDefined()
    expect(errors.pincode).toBeDefined()
  })

  it('requires the state for courier delivery', () => {
    const { ok, errors } = validateCustomer({ ...base, state: '' })
    expect(ok).toBe(false)
    expect(errors.state).toBe('Select your state.')
  })

  it('keeps address2 optional, trimmed and capped at 100 chars', () => {
    const { ok, customer } = validateCustomer({ ...base, address2: '  Flat 4B  ' })
    expect(ok).toBe(true)
    expect(customer.address2).toBe('Flat 4B')

    const long = validateCustomer({ ...base, address2: 'x'.repeat(140) })
    expect(long.customer.address2.length).toBe(100)
  })

  it('stores a null address2 when omitted', () => {
    const { customer } = validateCustomer(base)
    expect(customer.address2).toBeNull()
  })
})

describe('validateCustomer (studio pickup)', () => {
  it('skips the courier address checks entirely', () => {
    const { ok, errors } = validateCustomer(
      { name: 'Aryan Kanade', email: 'aryan@example.com', phone: '9876543210' },
      { pickup: true }
    )
    expect(ok).toBe(true)
    expect(errors).toEqual({})
  })

  it('still validates contact fields in pickup mode', () => {
    const { ok, errors } = validateCustomer(
      { name: 'A', email: 'nope', phone: '123' },
      { pickup: true }
    )
    expect(ok).toBe(false)
    expect(errors.name).toBeDefined()
    expect(errors.email).toBeDefined()
    expect(errors.phone).toBeDefined()
  })
})

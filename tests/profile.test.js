import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addressToForm,
  buildProfileFromForm,
  defaultAddress,
  readProfile,
  rememberedPin,
  rememberPin,
  upsertAddress,
} from '../src/utils/profile'

const storage = new Map()
const localStorageMock = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
}

beforeEach(() => {
  storage.clear()
  vi.stubGlobal('window', { localStorage: localStorageMock })
  vi.stubGlobal('localStorage', localStorageMock)
})

afterEach(() => vi.unstubAllGlobals())

const form = {
  name: 'Aryan Kanade',
  email: 'aryan@example.com',
  phone: '9876543210',
  address: '1 Test Lane',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
}

describe('buildProfileFromForm', () => {
  it('captures the customer with a labeled home address', () => {
    const profile = buildProfileFromForm(form)
    expect(profile.name).toBe('Aryan Kanade')
    expect(profile.addresses).toHaveLength(1)
    expect(profile.addresses[0]).toMatchObject({ label: 'Home', pincode: '400001' })
    expect(defaultAddress(profile).city).toBe('Mumbai')
  })

  it('addressToForm flattens an address back into checkout form fields', () => {
    const profile = buildProfileFromForm(form)
    expect(addressToForm(defaultAddress(profile))).toEqual({
      address: '1 Test Lane',
      address2: '',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
    })
  })

  it('round-trips an apartment/suite line through the address book', () => {
    const profile = buildProfileFromForm({ ...form, address2: 'Flat 4B, near the park' })
    expect(defaultAddress(profile).address2).toBe('Flat 4B, near the park')
    expect(addressToForm(defaultAddress(profile)).address2).toBe('Flat 4B, near the park')
  })
})

describe('upsertAddress (address book)', () => {
  it('adds a second address and can make it the default', () => {
    const profile = buildProfileFromForm(form)
    const next = upsertAddress(
      profile,
      { label: 'Office', address: '2 Work Rd', city: 'Pune', state: 'MH', pincode: '411001' },
      { makeDefault: true }
    )
    expect(next.addresses).toHaveLength(2)
    expect(defaultAddress(next).label).toBe('Office')
    expect(readProfile()).toEqual(next)
  })

  it('updates an existing address instead of duplicating it', () => {
    const profile = buildProfileFromForm(form)
    const next = upsertAddress(profile, {
      label: 'Home',
      address: '1 Test Lane',
      city: 'Thane',
      state: 'MH',
      pincode: '400001',
    })
    expect(next.addresses).toHaveLength(1)
    expect(next.addresses[0].city).toBe('Thane')
  })
})

describe('rememberedPin', () => {
  it('stores and validates 6-digit PINs only', () => {
    rememberPin('560001')
    expect(rememberedPin()).toBe('560001')
    rememberPin('12')
    expect(rememberedPin()).toBe('560001') // invalid write ignored
  })
})

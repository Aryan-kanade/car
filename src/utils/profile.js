// ─────────────────────────────────────────────────────────────
// Saved checkout profile + address book. Local-only by design
// (no accounts on this store) — remembered after a successful
// order so returning customers skip the shipping form.
// ─────────────────────────────────────────────────────────────

const PROFILE_KEY = 'kmkiramyki-checkout-profile'
const PIN_KEY = 'kmkiramyki-pincode'

export const ADDRESS_LABELS = ['Home', 'Office', 'Other']

export function readProfile() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PROFILE_KEY) ?? 'null')
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function saveProfile(profile) {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  } catch {
    /* storage unavailable */
  }
}

export function clearProfile() {
  try {
    window.localStorage.removeItem(PROFILE_KEY)
  } catch {
    /* storage unavailable */
  }
}

/** The profile shape saved after a successful checkout. */
export function buildProfileFromForm(form, { label = 'Home' } = {}) {
  return {
    name: form.name,
    email: form.email,
    phone: form.phone,
    addresses: [
      {
        label,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
    ],
    defaultAddress: 0,
    gstin: form.gstin ?? '',
    businessName: form.businessName ?? '',
  }
}

/** Add or update an address on the saved profile (max 4). */
export function upsertAddress(profile, address, { makeDefault = false, max = 4 } = {}) {
  const next = { ...profile, addresses: [...(profile.addresses ?? [])] }
  // Identity = street + PIN (city/label edits update in place)
  const existing = (next.addresses ?? []).findIndex(
    (a) => a.address === address.address && a.pincode === address.pincode
  )
  if (existing >= 0) {
    next.addresses[existing] = address
    if (makeDefault) next.defaultAddress = existing
  } else {
    next.addresses = [...next.addresses, address].slice(-max)
    next.defaultAddress = makeDefault ? next.addresses.length - 1 : (next.defaultAddress ?? 0)
  }
  saveProfile(next)
  return next
}

export function defaultAddress(profile) {
  const list = profile?.addresses ?? []
  if (list.length === 0) return null
  const index = Math.min(profile.defaultAddress ?? 0, list.length - 1)
  return list[index]
}

/** Apply an address back onto a flat checkout form. */
export function addressToForm(address) {
  return {
    address: address.address,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
  }
}

// ── Remembered PIN (serviceability EDD on PDP/cart) ──────────

export function rememberedPin() {
  try {
    const pin = window.localStorage.getItem(PIN_KEY)
    return /^\d{6}$/.test(pin ?? '') ? pin : null
  } catch {
    return null
  }
}

export function rememberPin(pin) {
  try {
    if (/^\d{6}$/.test(pin ?? '')) window.localStorage.setItem(PIN_KEY, pin)
  } catch {
    /* storage unavailable */
  }
}

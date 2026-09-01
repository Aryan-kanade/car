import { describe, expect, it } from 'vitest'
import { signLink, verifyLinkToken } from '../api/_lib/links'

describe('signed share links', () => {
  it('round-trips a valid tracking token', () => {
    process.env.RAZORPAY_KEY_SECRET = 'link-secret-test'
    const token = signLink('KMK-123456', 'track')
    expect(token).toHaveLength(32)
    expect(verifyLinkToken('KMK-123456', 'track', token)).toBe(true)
    // Token is order-specific
    expect(verifyLinkToken('KMK-654321', 'track', token)).toBe(false)
    // And purpose-specific
    expect(verifyLinkToken('KMK-123456', 'pay', token)).toBe(false)
    delete process.env.RAZORPAY_KEY_SECRET
  })

  it('refuses to sign without a secret configured', () => {
    const hadTrack = process.env.TRACKING_LINK_SECRET
    const hadRzp = process.env.RAZORPAY_KEY_SECRET
    delete process.env.TRACKING_LINK_SECRET
    delete process.env.RAZORPAY_KEY_SECRET
    expect(signLink('KMK-123456', 'track')).toBeNull()
    expect(verifyLinkToken('KMK-123456', 'track', 'anything')).toBe(false)
    if (hadTrack) process.env.TRACKING_LINK_SECRET = hadTrack
    if (hadRzp) process.env.RAZORPAY_KEY_SECRET = hadRzp
  })

  it('rejects malformed tokens without throwing', () => {
    process.env.RAZORPAY_KEY_SECRET = 'link-secret-test'
    expect(verifyLinkToken('KMK-123456', 'track', 'short')).toBe(false)
    expect(verifyLinkToken('KMK-123456', 'track', '')).toBe(false)
    delete process.env.RAZORPAY_KEY_SECRET
  })
})

import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyPaymentSignature, verifyWebhookSignature } from '../api/_lib/razorpay'

const SECRET = 'test-secret'

const sign = (payload, secret = SECRET) =>
  createHmac('sha256', secret).update(payload).digest('hex')

describe('verifyPaymentSignature', () => {
  const ids = { razorpayOrderId: 'order_123', razorpayPaymentId: 'pay_456' }
  const payload = 'order_123|pay_456'

  it('accepts a correctly signed checkout response', () => {
    expect(verifyPaymentSignature({ ...ids, signature: sign(payload) }, SECRET)).toBe(true)
  })

  it('rejects tampered fields or signature', () => {
    expect(verifyPaymentSignature({ ...ids, signature: sign('order_123|pay_999') }, SECRET)).toBe(
      false
    )
    expect(verifyPaymentSignature({ ...ids, signature: 'deadbeef' }, SECRET)).toBe(false)
  })

  it('rejects when the secret or any field is missing', () => {
    expect(verifyPaymentSignature({ ...ids, signature: sign(payload) }, undefined)).toBe(false)
    expect(
      verifyPaymentSignature({ razorpayOrderId: 'order_123', signature: sign(payload) }, SECRET)
    ).toBe(false)
  })

  it('length-mismatched signatures do not throw', () => {
    expect(verifyPaymentSignature({ ...ids, signature: 'short' }, SECRET)).toBe(false)
  })
})

describe('verifyWebhookSignature', () => {
  it('verifies the HMAC over the exact raw body', () => {
    const body = JSON.stringify({ event: 'payment.captured' })
    expect(verifyWebhookSignature(body, sign(body), SECRET)).toBe(true)
    expect(verifyWebhookSignature(body, sign('other'), SECRET)).toBe(false)
    expect(verifyWebhookSignature(body, sign(body), undefined)).toBe(false)
  })
})

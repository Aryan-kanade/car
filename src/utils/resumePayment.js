// ─────────────────────────────────────────────────────────────
// Payment recovery: reopen the still-live Razorpay order for a
// pending payment (Razorpay orders are retryable), verify
// server-side, and update the locally stored order.
// Used by Orders page + Order lookup.
// ─────────────────────────────────────────────────────────────

import { loadRazorpay } from './razorpay'
import { readOrders, saveServerOrder } from './orders'

/**
 * Resume a pending online payment.
 * Resolves { ok: true, order } after successful verification, or
 * { ok: false, dismissed } when the customer closes the modal, or
 * throws with a readable message.
 */
export async function resumePendingPayment({ number, email }) {
  const res = await fetch(
    `/api/resume-payment?number=${encodeURIComponent(number)}&email=${encodeURIComponent(email ?? '')}`
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Could not resume this payment.')
  if (data.alreadyPaid) {
    return { ok: false, alreadyPaid: true }
  }
  if (!data.pending) throw new Error('This order has no pending online payment.')

  const Razorpay = await loadRazorpay()

  return new Promise((resolve, reject) => {
    const checkout = new Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: 'INR',
      name: 'KMKIRAMYKI Advanced Chemistry',
      description: `Order ${data.orderNumber}`,
      order_id: data.razorpayOrderId,
      theme: { color: '#18181b' },
      handler: async (response) => {
        try {
          const vres = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber: data.orderNumber,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
          const vdata = await vres.json().catch(() => ({}))
          if (!vres.ok || !vdata.verified) {
            throw new Error(vdata.error || 'Payment verification failed.')
          }
          // Merge payment info into the locally stored copy
          const local = readOrders().find((o) => o.number === data.orderNumber)
          const merged = {
            ...(local ?? {}),
            ...vdata.order,
            pointsEarned: local?.pointsEarned ?? vdata.order.pointsEarned ?? 0,
            giftCode: local?.giftCode ?? null,
          }
          if (local) saveServerOrder(merged)
          resolve({ ok: true, order: merged })
        } catch (err) {
          reject(err)
        }
      },
      modal: {
        ondismiss: () => resolve({ ok: false, dismissed: true }),
      },
    })
    checkout.on('payment.failed', (response) => {
      reject(new Error(response?.error?.description || 'Payment failed. You can try again.'))
    })
    checkout.open()
  })
}

/** Quick local heuristic: an online order that never captured a payment id. */
export function isPaymentPending(order) {
  return order?.paymentMethod === 'online' && !order?.razorpayPaymentId
}

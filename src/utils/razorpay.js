// ─────────────────────────────────────────────────────────────
// Lazy loader for Razorpay's checkout.js (the payment modal).
// Loaded only when a customer actually pays — never bundled.
// ─────────────────────────────────────────────────────────────

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

/**
 * Resolve the global Razorpay constructor, injecting the script
 * on first use. Rejects if the script cannot be loaded.
 */
export function loadRazorpay() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Browser only.'))
  if (window.Razorpay) return Promise.resolve(window.Razorpay)
  if (loadRazorpay._pending) return loadRazorpay._pending

  loadRazorpay._pending = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = CHECKOUT_SRC
    script.async = true
    script.onload = () =>
      window.Razorpay
        ? resolve(window.Razorpay)
        : reject(new Error('Razorpay failed to initialize.'))
    script.onerror = () => {
      loadRazorpay._pending = null
      reject(new Error('Could not reach Razorpay. Check your connection and try again.'))
    }
    document.head.appendChild(script)
  })
  return loadRazorpay._pending
}

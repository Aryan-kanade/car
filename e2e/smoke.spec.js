import { expect, test } from '@playwright/test'

/**
 * E2E smoke: the complete commerce loop with the /api backend mocked
 * via Playwright route interception (no Razorpay/Shiprocket accounts
 * needed). Exercises the COD path end-to-end:
 * search -> PDP -> size variant -> cart -> promo -> checkout (with phone)
 * -> place order -> confirmation -> order lookup (local fallback).
 */
test('complete purchase loop', async ({ page }) => {
  // Wheel Cleaner 1 L @ ₹1,220 with WELCOME10 → ₹1,098 + ₹199 shipping = ₹1,297
  const mockedOrder = {
    number: 'KMK-424242',
    email: 'e2e@example.com',
    name: 'E2E Runner',
    phone: '9876543210',
    items: [
      {
        id: 'wheel-cleaner',
        name: 'Wheel Cleaner',
        size: '1 L',
        subscription: false,
        qty: 1,
        unitPrice: 1220,
      },
    ],
    subtotal: 1220,
    discount: 122,
    promoCode: 'WELCOME10',
    shipping: 199,
    pointsDiscount: 0,
    giftDiscount: 0,
    total: 1297,
    placedAt: Date.now(),
    paymentMethod: 'cod',
    razorpayPaymentId: null,
    shiprocketOrderId: null,
    awb: null,
  }

  await page.route('**/api/create-order', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        orderNumber: mockedOrder.number,
        totals: {
          subtotal: mockedOrder.subtotal,
          discount: mockedOrder.discount,
          shipping: mockedOrder.shipping,
          pointsDiscount: 0,
          giftDiscount: 0,
          total: mockedOrder.total,
        },
        amount: mockedOrder.total * 100,
        keyId: 'rzp_test_mock',
        razorpayOrderId: null,
        cod: true,
        order: mockedOrder,
      }),
    })
  )

  // Live tracking is unavailable in tests — lookup falls back to localStorage
  await page.route('**/api/track**', (route) =>
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'not-found' }),
    })
  )

  // Serviceability check passes with COD available (PIN 560001)
  await page.route('**/api/serviceability**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        available: true,
        serviceable: true,
        codAvailable: true,
        edd: '2026-09-05',
        courier: 'Delhivery',
        rate: 80,
      }),
    })
  )

  // Home renders
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Premium Car Care/i })).toBeVisible()

  // Search overlay finds a product
  await page.getByRole('button', { name: 'Search' }).click()
  const searchDialog = page.getByRole('dialog', { name: 'Search products' })
  await searchDialog.getByRole('searchbox', { name: 'Search products' }).fill('wheel')
  await searchDialog.getByRole('link', { name: /Wheel Cleaner/ }).click()
  await expect(page).toHaveURL(/\/product\/wheel-cleaner/)

  // Size variant changes the price (679 -> 1220 for 1 L)
  await expect(page.getByText('₹679.00').first()).toBeVisible()
  await page.getByRole('radio', { name: '1 L' }).click()
  await expect(page.getByText('₹1,220.00').first()).toBeVisible()

  // Add to cart opens the drawer with the size shown
  await page.getByRole('button', { name: 'Add to cart' }).first().click()
  const drawer = page.getByRole('dialog', { name: 'Cart quick view' })
  await expect(drawer).toBeVisible()
  await expect(drawer.getByText('1 L')).toBeVisible()

  // Continue to the full cart from the drawer
  await drawer.getByRole('link', { name: 'View full cart' }).click()
  await expect(page).toHaveURL(/\/cart/)

  // Apply promo code — discount line appears
  await page.getByLabel('Promo code').fill('WELCOME10')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page.getByText('WELCOME10 · 10% off your order')).toBeVisible()

  // Checkout: shipping step
  await page.getByRole('link', { name: 'Proceed to checkout' }).click()
  await page.getByLabel('Full name').fill('E2E Runner')
  await page.getByLabel('Email').fill('e2e@example.com')
  await page.getByLabel('Phone').fill('9876543210')
  await page.getByLabel('Street address').fill('1 Test Lane')
  await page.getByLabel('City').fill('Bengaluru')
  await page.getByLabel('State').fill('Karnataka')
  await page.getByLabel('PIN code').fill('560001')
  await page.getByRole('button', { name: 'Continue to payment' }).click()
  await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible()

  // Payment step — choose Cash on Delivery (online would open Razorpay)
  await page.getByRole('radio', { name: /Cash on Delivery/i }).check()
  await page.getByRole('button', { name: /^Place order/ }).click()

  // Confirmation with order number
  await expect(page.getByRole('heading', { name: /Thank you, E2E/ })).toBeVisible()
  const orderNumber = await page.locator('p.font-display.text-3xl').first().textContent()
  expect(orderNumber).toBe('KMK-424242')

  // Look the order up (falls back to the device copy when /api/track misses)
  await page.getByRole('link', { name: 'Track this order' }).click()
  await page.getByLabel('Order number').fill(orderNumber ?? '')
  await page.getByLabel('Email address').fill('e2e@example.com')
  await page.getByRole('button', { name: 'Find my order' }).click()
  await expect(page.getByText(orderNumber ?? '').first()).toBeVisible()
})

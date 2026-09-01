import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Accessibility gate — scans every key route with axe-core and fails on
 * any WCAG A/AA violation. The 0-violation standard, machine-verified.
 */
const routes = [
  '/',
  '/shop',
  '/shop/wheel-tire',
  '/shop/accessories',
  '/product/complete-detail-kit',
  '/product/washberry-shampoo',
  '/kits',
  '/builder',
  '/quiz',
  '/calculator',
  '/cart',
  '/checkout',
  '/wishlist',
  '/notes',
  '/help',
  '/about',
  '/design',
  '/sitemap',
]

for (const route of routes) {
  test(`${route} has no axe violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    // Scroll through the page so every whileInView reveal animation fires,
    // then wait for them to finish — scanning mid-fade reports phantom
    // contrast failures on semi-transparent layers.
    await page.evaluate(async () => {
      window.scrollTo({ top: document.body.scrollHeight })
      await new Promise((resolve) => setTimeout(resolve, 350))
      window.scrollTo({ top: 0 })
      await new Promise((resolve) => setTimeout(resolve, 800))
    })

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })
}

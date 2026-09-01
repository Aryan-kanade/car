import { chromium } from '@playwright/test'
const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1500)
// Find the slider section and hover it
const section = page.locator('section').filter({ hasText: 'THE DIFFERENCE' })
const slider = section.locator('.group.relative').first()
const circleBefore = await slider
  .locator('span.rounded-full')
  .evaluate((el) => getComputedStyle(el).transform)
await slider.hover()
await page.waitForTimeout(450)
const lineAfter = await slider
  .locator('div.pointer-events-none')
  .evaluate((el) => getComputedStyle(el).width)
const circleAfter = await slider
  .locator('span.rounded-full')
  .evaluate((el) => getComputedStyle(el).transform)
console.log(
  JSON.stringify({
    lineWidthAfterHover: lineAfter,
    circleTransformBefore: circleBefore,
    circleTransformAfter: circleAfter,
  })
)
await browser.close()

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import CalculatorPage from '../src/pages/CalculatorPage'

describe('CalculatorPage', () => {
  it('computes ml and capfuls from product ratio and water volume', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CalculatorPage />
      </MemoryRouter>
    )

    // Default: Pre Wash Shampoo (10 ml/L) at 10 L = 100 ml
    expect(screen.getByText('100', { exact: false })).toBeTruthy()
    expect(screen.getByText(/4\.0 bottle caps/)).toBeTruthy()

    // Switch to Washberry (8 ml/L) -> 80 ml
    await user.click(screen.getByRole('radio', { name: 'Washberry Shampoo' }))
    expect(await screen.findByText('80', { exact: false })).toBeTruthy()

    // Switch to Degreaser (20 ml/L) -> 200 ml
    await user.click(screen.getByRole('radio', { name: 'Degreaser' }))
    expect(await screen.findByText('200', { exact: false })).toBeTruthy()
  })
})

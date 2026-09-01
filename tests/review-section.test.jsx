import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import ReviewSection from '../src/components/ReviewSection'

describe('ReviewSection', () => {
  it('shows the seeded review with average and verified badge', () => {
    render(<ReviewSection productId="complete-detail-kit" />)

    expect(screen.getByText('5.0')).toBeTruthy()
    expect(screen.getByText('1 review', { exact: false })).toBeTruthy()
    expect(screen.getByText('Rahul S.')).toBeTruthy()
    expect(screen.getByTitle('Verified buyer')).toBeTruthy()
    expect(screen.getByText(/dilution cards alone are worth it/i)).toBeTruthy()
  })

  it('opens the write form and validates missing fields', async () => {
    const user = userEvent.setup()
    render(<ReviewSection productId="wax-shampoo" />)

    expect(screen.getByText(/No reviews yet/i)).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /write a review/i }))

    // Submitting empty shows the validation message and keeps the form open
    await user.click(screen.getByRole('button', { name: /submit review/i }))
    expect(await screen.findByText(/Add your name and at least a sentence/i)).toBeTruthy()
    expect(screen.getByLabelText('Review', { exact: true })).toBeTruthy()
  })
})

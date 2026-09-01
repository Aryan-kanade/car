import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom keeps the document between tests — clean up mounted components
afterEach(() => {
  cleanup()
})

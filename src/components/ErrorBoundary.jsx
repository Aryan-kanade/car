import { Component } from 'react'
import { Link } from 'react-router'

/**
 * Route-level error boundary — keeps a render crash from blanking
 * the whole storefront. The chrome (nav/footer) lives in Layout,
 * which stays mounted outside this boundary.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Route crashed:', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-6 py-24 text-center">
        <p className="text-xs font-medium tracking-[0.35em] text-zinc-800 dark:text-zinc-400 uppercase">
          Something smeared
        </p>
        <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase md:text-5xl">
          This page needs a polish
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-800 dark:text-zinc-400">
          An unexpected error interrupted this page. The rest of the studio is unaffected — head
          back and try again.
        </p>
        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="cursor-pointer bg-zinc-900 dark:bg-white px-8 py-4 text-xs font-semibold tracking-[0.2em] text-white dark:text-zinc-900 uppercase transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-zinc-300 dark:border-zinc-700 px-8 py-4 text-xs font-semibold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase transition-colors hover:border-zinc-900 dark:hover:border-white"
          >
            Back home
          </Link>
        </div>
      </div>
    )
  }
}

import { useEffect } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Traps Tab navigation inside `ref` while `active` is true.
 * Used by the search overlay and cart drawer so keyboard users
 * cannot escape into the page behind a modal layer.
 */
export function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return
      const focusables = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null
      )
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    node.addEventListener('keydown', onKeyDown)
    return () => node.removeEventListener('keydown', onKeyDown)
  }, [ref, active])
}

import { useEffect, useState } from 'react'
import { WifiSlashIcon } from '@phosphor-icons/react/dist/csr/WifiSlash'

/** Offline indicator — a small pill when the network drops (PWA companion). */
export default function OfflineIndicator() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <p
      role="status"
      className="fixed top-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-900 dark:bg-white px-4 py-2 text-xs font-medium text-white dark:text-zinc-900"
    >
      <WifiSlashIcon size={14} weight="light" aria-hidden="true" />
      You are offline — browsing cached pages
    </p>
  )
}

import { ImageIcon } from '@phosphor-icons/react/dist/csr/Image'

/**
 * Reusable stand-in for real product/hero photography.
 * Light gray surface, centered Image icon and a descriptive label —
 * no external image requests anywhere in the app.
 *
 * `background` renders an icon-only variant for full-bleed use behind
 * overlays; the description is exposed via role="img"/aria-label instead
 * of painted text that would sit under gradient layers.
 */
export default function Placeholder({ label, className = '', iconSize = 28, background = false }) {
  if (background) {
    return (
      <div
        role="img"
        aria-label={`[Placeholder: ${label}]`}
        className={`flex items-center justify-center overflow-hidden bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-500 ${className}`}
      >
        <ImageIcon size={iconSize} weight="light" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 overflow-hidden bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-400 ${className}`}
    >
      <ImageIcon size={iconSize} weight="light" aria-hidden="true" />
      {label && (
        <p className="max-w-[85%] px-4 text-center text-xs leading-relaxed">
          [Placeholder: {label}]
        </p>
      )}
    </div>
  )
}

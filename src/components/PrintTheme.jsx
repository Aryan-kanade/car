/**
 * Forces light-theme print output regardless of active dark mode.
 */
export default function PrintTheme() {
  return (
    <style>
      {'@media print { html, body { background: #fff !important; color: #000 !important; } }'}
    </style>
  )
}

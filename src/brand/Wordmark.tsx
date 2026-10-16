/**
 * The name as the house sets it on its campaign cover: wide geometric capitals,
 * tracked out. Placeholder until the logo file arrives; everything that shows the
 * brand goes through this component, so the swap happens in one place.
 */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`} aria-label="Saint Aslan">
      <span aria-hidden="true">SAINT</span>
      <span aria-hidden="true">ASLAN</span>
    </span>
  )
}

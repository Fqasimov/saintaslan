import { LogoMark } from './Logo'

/** The name in the header: the traced logotype, without its disc. */
export function Wordmark({ className = '' }: { className?: string }) {
  return <LogoMark className={`wordmark ${className}`} title="Saint Aslan" />
}

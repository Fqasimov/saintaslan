import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode; fallback?: ReactNode; onError?: () => void }

/**
 * Keeps one failing piece (a chunk that cannot load, a player that throws) from taking
 * the whole page down with it: the piece is replaced by `fallback` and the page goes on.
 */
export class Fallback extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError?.()
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children
  }
}

'use client'

import { Component, type ReactNode } from 'react'
import { ErrorState } from '@/components/ui/states'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}
interface State {
  error: Error | null
}

/**
 * Error boundary for data-driven sections. Renders the **existing frozen `ErrorState`**
 * component on failure (no new UI), with a retry that resets the boundary. Wrap any
 * region that renders query results so a fetch/render error never blanks the page.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  private reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <ErrorState
            icon="⚠️"
            title="Something went wrong"
            description={this.state.error.message || 'An unexpected error occurred.'}
            action={{ label: 'Try again', onClick: this.reset }}
          />
        )
      )
    }
    return this.props.children
  }
}

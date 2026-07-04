'use client'

import type { ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { LoadingSkeleton, ErrorState, EmptyState } from '@/components/ui/states'

/**
 * Declarative loading / error / empty / retry wrapper around a React Query result, built
 * entirely on the **existing frozen state components** (LoadingSkeleton / ErrorState /
 * EmptyState). Frozen pages render their data via `<QueryState query={q}>{data => …}</QueryState>`
 * — one place handles every non-success state consistently.
 */
export function QueryState<T>({
  query,
  children,
  isEmpty,
  empty,
  loadingLines = 4,
}: {
  query: UseQueryResult<T>
  children: (data: T) => ReactNode
  isEmpty?: (data: T) => boolean
  empty?: { icon: string; title: string; description: string; action?: { label: string; onClick: () => void } }
  loadingLines?: number
}): ReactNode {
  if (query.isPending) return <LoadingSkeleton lines={loadingLines} />

  if (query.isError) {
    const message = query.error instanceof Error ? query.error.message : 'Please try again.'
    return (
      <ErrorState
        icon="⚠️"
        title="Failed to load"
        description={message}
        action={{ label: 'Retry', onClick: () => void query.refetch() }}
      />
    )
  }

  if (isEmpty?.(query.data) && empty) {
    return <EmptyState icon={empty.icon} title={empty.title} description={empty.description} action={empty.action} />
  }

  return children(query.data)
}

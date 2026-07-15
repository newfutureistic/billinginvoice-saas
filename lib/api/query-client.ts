import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api/errors'

/**
 * QueryClient factory with enterprise defaults: a 30s stale window, one background retry
 * (but never retry 4xx auth/validation errors — those won't succeed on retry), and no
 * refetch-on-focus storms. Created per request on the server and once on the client.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError) {
            // Don't retry client errors that a retry can't fix.
            if (error.status >= 400 && error.status < 500) return false
          }
          // Transient 5xx / network failures (e.g. a brief database blip) — retry a few
          // times with backoff so the UI rides through it instead of showing an error.
          return failureCount < 3
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      },
      mutations: {
        retry: false,
      },
    },
  })
}

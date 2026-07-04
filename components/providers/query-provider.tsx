'use client'

import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { makeQueryClient } from '@/lib/api/query-client'

/**
 * React Query provider. Uses the Next.js SSR-safe singleton pattern: a fresh client per
 * request on the server, one shared client on the browser (so navigations reuse the
 * cache). Renders only `children` — no DOM, so it is completely pixel-neutral.
 */
let browserQueryClient: QueryClient | undefined

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryProvider } from '@/components/providers/query-provider'
import { WorkspaceProvider } from '@/lib/api/workspace-context'
import { ChunkErrorReload } from '@/components/providers/chunk-error-reload'

/**
 * App-wide client providers: Auth.js `SessionProvider` (real session), React Query
 * `QueryProvider` (data cache), and `WorkspaceProvider` (active tenant). These are all
 * invisible context providers — they render `children` and add **no DOM and no styling**,
 * so wrapping the app in them is provably pixel-identical. This is the single, minimal
 * integration point that activates the entire data layer.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </QueryProvider>
      <ChunkErrorReload />
    </SessionProvider>
  )
}

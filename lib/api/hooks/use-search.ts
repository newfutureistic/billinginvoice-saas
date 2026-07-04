'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/query-keys'
import { http } from '@/lib/api/http'
import { useActiveWorkspace } from '@/lib/api/workspace-context'
import { useDebouncedValue } from '@/lib/api/use-debounce'
import type { SearchResponseDTO } from '@/lib/dto/search.dto'

/**
 * Global search — debounced, workspace-scoped fan-out across clients, products, documents
 * and templates from `/api/v1/search`. The term is debounced (default 300ms) so the query
 * only fires after the user pauses.
 */
export function useSearch(term: string, limit = 5, delayMs = 300) {
  const workspaceId = useActiveWorkspace()
  const debounced = useDebouncedValue(term.trim(), delayMs)
  return useQuery<SearchResponseDTO>({
    queryKey: queryKeys.search(debounced),
    queryFn: ({ signal }) => http.get('/search', { query: { q: debounced, limit }, workspaceId, signal }),
    enabled: Boolean(workspaceId) && debounced.length > 0,
  })
}

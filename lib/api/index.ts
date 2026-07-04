/**
 * Frontend API layer barrel.
 *
 * `@/lib/api` — the http client, error types, query keys/client, and workspace context.
 * `@/lib/api/hooks` — the React Query hooks the frozen UI consumes.
 */
export { http, apiFetch, API_BASE, type QueryParams, type QueryValue, type RequestOptions } from '@/lib/api/http'
export {
  ApiError,
  type ApiResponse,
  type ApiErrorPayload,
  type ListResult,
  type PageMeta,
  type FieldErrors,
} from '@/lib/api/errors'
export { queryKeys } from '@/lib/api/query-keys'
export { makeQueryClient } from '@/lib/api/query-client'
export {
  WorkspaceProvider,
  useActiveWorkspace,
  useWorkspaceSwitch,
} from '@/lib/api/workspace-context'
export { useDebouncedValue } from '@/lib/api/use-debounce'

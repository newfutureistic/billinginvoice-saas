import { ApiError, type ApiResponse } from '@/lib/api/errors'

/**
 * The single HTTP client for the whole frontend (Mission 6: "zero duplicated fetching
 * logic"). Every hook goes through `apiFetch`, which:
 *  - prefixes `/api/v1`, serializes query params, sends the session cookie,
 *  - attaches the active workspace (`x-workspace-id`) for tenant-scoped endpoints,
 *  - unwraps the `{ success, data }` envelope, returning `data` typed as `T`,
 *  - throws a typed {@link ApiError} (with the server's stable `code`) on any failure.
 */
export const API_BASE = '/api/v1'

export type QueryValue = string | number | boolean | undefined | null
export type QueryParams = Record<string, QueryValue>

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: QueryParams
  /** Active workspace id → `x-workspace-id` header (tenant-scoped endpoints). */
  workspaceId?: string | null
  signal?: AbortSignal
  headers?: Record<string, string>
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = path.startsWith('/api/') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
  if (!query) return base
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, workspaceId, signal, headers = {} } = options

  const finalHeaders: Record<string, string> = { Accept: 'application/json', ...headers }
  if (body !== undefined) finalHeaders['Content-Type'] = 'application/json'
  if (workspaceId) finalHeaders['x-workspace-id'] = workspaceId

  let res: Response
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers: finalHeaders,
      credentials: 'include',
      signal,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError({ code: 'NETWORK_ERROR', message: 'Unable to reach the server' }, 0)
  }

  // 204 / empty body → no data.
  const text = await res.text()
  const parsed = text ? (JSON.parse(text) as ApiResponse<T>) : ({ success: true, data: undefined } as ApiResponse<T>)

  if (!res.ok || parsed.success === false) {
    const payload =
      parsed && parsed.success === false
        ? parsed.error
        : { code: 'HTTP_ERROR', message: `Request failed (${res.status})` }
    throw new ApiError(payload, res.status)
  }
  return parsed.data
}

/** Convenience verbs over {@link apiFetch}. */
export const http = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...opts, method: 'PATCH', body }),
  del: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...opts, method: 'DELETE' }),
}

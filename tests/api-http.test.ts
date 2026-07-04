import { test } from 'node:test'
import assert from 'node:assert/strict'
import { apiFetch, http } from '@/lib/api/http'
import { ApiError } from '@/lib/api/errors'

const calls: { url: string; init: RequestInit | undefined }[] = []

function mockFetch(status: number, body: unknown): void {
  global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init })
    const responseBody = body === undefined ? null : JSON.stringify(body)
    return new Response(responseBody, { status, headers: { 'content-type': 'application/json' } })
  }) as typeof fetch
}

test('unwraps the success envelope to data', async () => {
  mockFetch(200, { success: true, data: { id: 'c1', name: 'Acme' }, meta: {} })
  const data = await apiFetch<{ id: string; name: string }>('/clients/c1')
  assert.deepEqual(data, { id: 'c1', name: 'Acme' })
})

test('throws a typed ApiError on an error envelope', async () => {
  mockFetch(422, {
    success: false,
    error: { code: 'VALIDATION_ERROR', message: 'Invalid', fields: { name: 'Required' } },
    meta: {},
  })
  await assert.rejects(
    () => apiFetch('/clients'),
    (err: unknown) =>
      err instanceof ApiError &&
      err.code === 'VALIDATION_ERROR' &&
      err.status === 422 &&
      err.isValidation &&
      err.fields?.name === 'Required',
  )
})

test('throws ApiError on a non-2xx without a JSON envelope', async () => {
  mockFetch(500, { success: false, error: { code: 'INTERNAL_ERROR', message: 'boom' }, meta: {} })
  await assert.rejects(() => apiFetch('/x'), (e: unknown) => e instanceof ApiError && e.status === 500)
})

test('builds the query string, prefixes /api/v1, and sends the workspace header', async () => {
  calls.length = 0
  mockFetch(200, { success: true, data: { items: [], pagination: {} }, meta: {} })
  await http.get('/clients', { query: { page: 2, empty: undefined, q: 'x' }, workspaceId: 'ws1' })
  const { url, init } = calls[0]
  assert.match(url, /\/api\/v1\/clients\?/)
  assert.match(url, /page=2/)
  assert.match(url, /q=x/)
  assert.doesNotMatch(url, /empty=/) // undefined params are dropped
  assert.equal((init?.headers as Record<string, string>)['x-workspace-id'], 'ws1')
  assert.equal(init?.credentials, 'include')
})

test('empty / 204 body resolves to undefined', async () => {
  mockFetch(204, undefined)
  const data = await apiFetch('/x', { method: 'DELETE' })
  assert.equal(data, undefined)
})

test('ApiError status helpers', () => {
  assert.equal(new ApiError({ code: 'X', message: 'y' }, 401).isUnauthenticated, true)
  assert.equal(new ApiError({ code: 'X', message: 'y' }, 403).isForbidden, true)
  assert.equal(new ApiError({ code: 'X', message: 'y' }, 404).isNotFound, true)
  assert.equal(new ApiError({ code: 'X', message: 'y' }, 429).isRateLimited, true)
})

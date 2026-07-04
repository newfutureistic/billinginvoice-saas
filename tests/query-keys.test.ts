import { test } from 'node:test'
import assert from 'node:assert/strict'
import { queryKeys } from '@/lib/api/query-keys'

test('query keys are stable and structured for consistent invalidation', () => {
  assert.deepEqual(queryKeys.clients.all, ['clients'])
  assert.deepEqual(queryKeys.clients.detail('c1'), ['clients', 'detail', 'c1'])
  assert.deepEqual(queryKeys.clients.list({ page: 1 }), ['clients', 'list', { page: 1 }])
  assert.deepEqual(queryKeys.clients.list(), ['clients', 'list', {}])

  assert.deepEqual(queryKeys.dashboard(6), ['dashboard', 6])
  assert.deepEqual(queryKeys.documents.detail('d1'), ['documents', 'detail', 'd1'])
  assert.deepEqual(queryKeys.notifications.unread, ['notifications', 'unread-count'])
  assert.deepEqual(queryKeys.search('acme'), ['search', 'acme'])
  assert.deepEqual(queryKeys.products.categories, ['products', 'categories'])
})

test('detail keys nest under the resource root so invalidating all clears details', () => {
  // A key prefix match: invalidating ['clients'] should cover ['clients','detail','c1'].
  const detail = queryKeys.clients.detail('c1')
  assert.equal(detail[0], queryKeys.clients.all[0])
})

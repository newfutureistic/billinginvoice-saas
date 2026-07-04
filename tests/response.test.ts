import { test } from 'node:test'
import assert from 'node:assert/strict'

import { successBody, toListResult, mapListResult } from '@/server/http/response'
import { buildPageMeta } from '@/server/db/utils'

test('successBody: standard envelope shape', () => {
  const body = successBody({ hello: 'world' }, { requestId: 'req-1' })
  assert.equal(body.success, true)
  assert.deepEqual(body.data, { hello: 'world' })
  assert.equal(body.meta.requestId, 'req-1')
  assert.equal(typeof body.meta.timestamp, 'string')
})

test('toListResult: converts Paginated → { items, pagination }', () => {
  const page = { data: [1, 2, 3], meta: buildPageMeta(3, 1, 20) }
  const result = toListResult(page)
  assert.deepEqual(result.items, [1, 2, 3])
  assert.equal(result.pagination.total, 3)
})

test('mapListResult: maps items while preserving pagination', () => {
  const page = { data: [{ n: 1 }, { n: 2 }], meta: buildPageMeta(2, 1, 20) }
  const result = mapListResult(page, (x) => x.n * 10)
  assert.deepEqual(result.items, [10, 20])
  assert.equal(result.pagination.total, 2)
})

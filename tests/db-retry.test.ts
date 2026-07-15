import { test } from 'node:test'
import assert from 'node:assert/strict'

import { isTransientDbError, withDbRetry } from '@/server/db/retry'

test('isTransientDbError: recognizes connection blips', () => {
  assert.equal(isTransientDbError({ code: 'P1001', message: "Can't reach database server" }), true)
  assert.equal(isTransientDbError({ code: 'P1017' }), true)
  assert.equal(isTransientDbError({ message: 'server has closed the connection' }), true)
  assert.equal(isTransientDbError({ message: 'ECONNRESET' }), true)
  assert.equal(isTransientDbError({ name: 'PrismaClientInitializationError', message: 'x' }), true)
})

test('isTransientDbError: does NOT retry real errors', () => {
  assert.equal(isTransientDbError({ code: 'P2002', message: 'Unique constraint failed' }), false)
  assert.equal(isTransientDbError({ code: 'P2025', message: 'Record not found' }), false)
  assert.equal(isTransientDbError({ message: 'Validation failed' }), false)
  assert.equal(isTransientDbError(null), false)
})

test('withDbRetry: recovers after a transient failure', async () => {
  let calls = 0
  const result = await withDbRetry(async () => {
    calls++
    if (calls < 3) throw { code: 'P1001', message: "Can't reach database server" }
    return 'ok'
  })
  assert.equal(result, 'ok')
  assert.equal(calls, 3) // failed twice, succeeded on the third attempt
})

test('withDbRetry: does not retry a non-transient error', async () => {
  let calls = 0
  await assert.rejects(
    () =>
      withDbRetry(async () => {
        calls++
        throw Object.assign(new Error('Unique constraint failed'), { code: 'P2002' })
      }),
    /Unique constraint/,
  )
  assert.equal(calls, 1) // thrown immediately, no retry
})

test('withDbRetry: gives up after exhausting attempts', async () => {
  let calls = 0
  await assert.rejects(
    () =>
      withDbRetry(async () => {
        calls++
        throw Object.assign(new Error("Can't reach database server"), { code: 'P1001' })
      }, 3),
    /reach database/,
  )
  assert.equal(calls, 3)
})

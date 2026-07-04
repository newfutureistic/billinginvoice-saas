process.env.LOGIN_MAX_ATTEMPTS = '3'
process.env.LOGIN_LOCK_MINUTES = '15'

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { InMemoryBruteForceGuard, bruteForceKey } from '@/server/auth/brute-force'

test('locks after N failures and reports retry-after', () => {
  const guard = new InMemoryBruteForceGuard()
  const key = bruteForceKey('user@example.com', '1.2.3.4')

  assert.deepEqual(guard.status(key), { locked: false, remaining: 3 })
  guard.recordFailure(key)
  guard.recordFailure(key)
  assert.equal(guard.status(key).locked, false)
  assert.equal(guard.status(key).remaining, 1)

  const locked = guard.recordFailure(key)
  assert.equal(locked.locked, true)
  assert.ok((locked.retryAfterSeconds ?? 0) > 0)
})

test('reset() clears the counter on success', () => {
  const guard = new InMemoryBruteForceGuard()
  const key = bruteForceKey('a@b.com', '9.9.9.9')
  guard.recordFailure(key)
  guard.recordFailure(key)
  guard.recordFailure(key)
  assert.equal(guard.status(key).locked, true)
  guard.reset(key)
  assert.equal(guard.status(key).locked, false)
})

test('lock auto-releases after the window elapses', () => {
  const guard = new InMemoryBruteForceGuard()
  const key = bruteForceKey('c@d.com', '5.5.5.5')
  const t0 = Date.now()
  guard.recordFailure(key, t0)
  guard.recordFailure(key, t0)
  const locked = guard.recordFailure(key, t0)
  assert.equal(locked.locked, true)

  const later = t0 + 15 * 60_000 + 1
  assert.equal(guard.status(key, later).locked, false)
})

test('key isolates by email + ip', () => {
  assert.notEqual(bruteForceKey('a@b.com', '1.1.1.1'), bruteForceKey('a@b.com', '2.2.2.2'))
  assert.equal(bruteForceKey('A@B.com', '1.1.1.1'), bruteForceKey('a@b.com', '1.1.1.1'))
})

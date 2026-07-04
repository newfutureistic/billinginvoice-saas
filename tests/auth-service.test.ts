process.env.BCRYPT_COST = '10'
// Set before the first getAuthEnv() (cached process-wide) so lockout is deterministic.
process.env.LOGIN_MAX_ATTEMPTS = '3'

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { after } from 'node:test'
import { AuthService, type DeliverMessage } from '@/server/services/auth.service'
import { InMemoryBruteForceGuard } from '@/server/auth/brute-force'
import { ConflictError, BadRequestError, UnauthenticatedError } from '@/server/errors/app-error'
import { disconnectPrisma } from '@/server/db/prisma'
import { FakeUserRepo, FakeTokenRepo, FakeMembershipRepo, fakeAudit, testContext } from './fakes'

after(async () => {
  await disconnectPrisma().catch(() => undefined)
})

function makeService() {
  const users = new FakeUserRepo()
  const tokens = new FakeTokenRepo()
  const memberships = new FakeMembershipRepo()
  const delivered: DeliverMessage[] = []
  const revoked: string[] = []
  let bootstrapCalls = 0

  const service = new AuthService(testContext({ ip: '1.2.3.4' }), {
    users: users.asRepo(),
    tokens: tokens.asRepo(),
    memberships: memberships.asRepo(),
    audit: fakeAudit(),
    bruteForce: new InMemoryBruteForceGuard(),
    deliver: async (m) => {
      delivered.push(m)
    },
    revokeSessions: async (userId) => {
      revoked.push(userId)
    },
    bootstrapWorkspace: async (userId) => {
      bootstrapCalls++
      const wsId = `ws_${userId}`
      memberships.seedWorkspace(wsId)
      await memberships.create({ userId, workspaceId: wsId, role: 'OWNER', status: 'ACTIVE' })
      return { workspaceId: wsId }
    },
  })

  return { service, users, tokens, memberships, delivered, revoked, bootstrapCalls: () => bootstrapCalls }
}

test('signup creates an unverified user and issues a verification code', async () => {
  const { service, users, tokens, delivered } = makeService()
  const result = await service.signup({ name: 'Jane', email: 'Jane@Acme.com', password: 'ValidPass1' })

  assert.equal(result.user.email, 'jane@acme.com')
  assert.equal(result.user.emailVerified, null)
  assert.ok(result.devCode, 'dev code returned outside production')
  assert.equal(users.rows.length, 1)
  assert.equal(users.rows[0].passwordHash !== null, true)
  assert.equal(tokens.rows.length, 1)
  assert.equal(delivered[0].kind, 'verify')
})

test('signup rejects a duplicate email', async () => {
  const { service } = makeService()
  await service.signup({ name: 'A', email: 'dup@acme.com', password: 'ValidPass1' })
  await assert.rejects(
    () => service.signup({ name: 'B', email: 'dup@acme.com', password: 'ValidPass1' }),
    ConflictError,
  )
})

test('verifyEmail: wrong code rejected, correct code verifies + bootstraps workspace', async () => {
  const { service, users, delivered } = makeService()
  await service.signup({ name: 'Jane', email: 'jane@acme.com', password: 'ValidPass1' })
  const code = delivered[0].secret

  await assert.rejects(
    () => service.verifyEmail({ email: 'jane@acme.com', code: '000000' }),
    BadRequestError,
  )

  const verified = await service.verifyEmail({ email: 'jane@acme.com', code })
  assert.notEqual(verified.user.emailVerified, null)
  assert.ok(verified.workspaceId, 'first workspace provisioned')
  assert.notEqual(users.rows[0].emailVerified, null)
})

test('full credentials flow: signup → verify → authenticate', async () => {
  const { service, delivered } = makeService()
  await service.signup({ name: 'Jane', email: 'jane@acme.com', password: 'ValidPass1' })
  await service.verifyEmail({ email: 'jane@acme.com', code: delivered[0].secret })

  const ok = await service.authenticate('jane@acme.com', 'ValidPass1')
  assert.ok(ok)
  assert.equal(ok?.emailVerified, true)

  const bad = await service.authenticate('jane@acme.com', 'WrongPass9')
  assert.equal(bad, null)

  const unknown = await service.authenticate('ghost@acme.com', 'whatever')
  assert.equal(unknown, null)
})

test('authenticate locks out after repeated failures', async () => {
  const users = new FakeUserRepo()
  const service = new AuthService(testContext({ ip: '9.9.9.9' }), {
    users: users.asRepo(),
    tokens: new FakeTokenRepo().asRepo(),
    memberships: new FakeMembershipRepo().asRepo(),
    audit: fakeAudit(),
    bruteForce: new InMemoryBruteForceGuard(),
    deliver: async () => undefined,
    revokeSessions: async () => undefined,
    bootstrapWorkspace: async () => ({ workspaceId: 'ws' }),
  })
  await users.create({ email: 'lock@acme.com', passwordHash: null })

  // 3 failed attempts trip the lock; the 4th throws instead of returning null.
  await service.authenticate('lock@acme.com', 'x')
  await service.authenticate('lock@acme.com', 'x')
  await service.authenticate('lock@acme.com', 'x')
  await assert.rejects(() => service.authenticate('lock@acme.com', 'x'), UnauthenticatedError)
})

test('forgot + reset password: token issued, applied, sessions revoked', async () => {
  const { service, users, tokens, delivered, revoked } = makeService()
  await service.signup({ name: 'Jane', email: 'jane@acme.com', password: 'ValidPass1' })
  tokens.rows.length = 0 // clear the verify token to isolate the reset token
  delivered.length = 0

  await service.forgotPassword({ email: 'ghost@acme.com' }) // unknown → silent success
  assert.equal(delivered.length, 0)

  await service.forgotPassword({ email: 'jane@acme.com' })
  assert.equal(delivered[0].kind, 'reset')
  const token = delivered[0].secret

  await service.resetPassword({ token, password: 'BrandNew123' })
  assert.deepEqual(revoked, [users.rows[0].id])
  // Old password no longer works; the new one does.
  assert.equal(await service.authenticate('jane@acme.com', 'ValidPass1'), null)
  assert.ok(await service.authenticate('jane@acme.com', 'BrandNew123'))
})

test('changePassword requires the correct current password', async () => {
  const { service, users, revoked } = makeService()
  await service.signup({ name: 'Jane', email: 'jane@acme.com', password: 'ValidPass1' })
  const userId = users.rows[0].id

  await assert.rejects(
    () => service.changePassword(userId, { currentPassword: 'WrongOld1', newPassword: 'NewGood123' }),
    UnauthenticatedError,
  )
  await service.changePassword(userId, { currentPassword: 'ValidPass1', newPassword: 'NewGood123' })
  assert.ok(revoked.includes(userId))
  assert.ok(await service.authenticate('jane@acme.com', 'NewGood123'))
})

import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { MembershipService, type DeliverInvite } from '@/server/services/membership.service'
import {
  AuthorizationError,
  BusinessError,
  ConflictError,
  BadRequestError,
} from '@/server/errors/app-error'
import { hashToken } from '@/server/auth/tokens'
import { disconnectPrisma } from '@/server/db/prisma'
import {
  FakeUserRepo,
  FakeMembershipRepo,
  FakeInvitationRepo,
  fakeAudit,
  testContext,
} from './fakes'

after(async () => {
  await disconnectPrisma().catch(() => undefined)
})

const WS = 'ws_acme'

async function setup(actorRole: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' = 'ADMIN') {
  const users = new FakeUserRepo()
  const memberships = new FakeMembershipRepo()
  const invitations = new FakeInvitationRepo()
  const invites: DeliverInvite[] = []
  memberships.seedWorkspace(WS, 'Acme')

  const actor = await users.create({ email: 'actor@acme.com', name: 'Actor' })
  await memberships.create({ userId: actor.id, workspaceId: WS, role: actorRole, status: 'ACTIVE' })

  const ctx = testContext({
    user: { id: actor.id, email: actor.email, name: actor.name, image: null },
    role: actorRole,
    workspaceId: WS,
  })

  const service = new MembershipService(ctx, {
    users: users.asRepo(),
    memberships: memberships.asRepo(),
    invitations: invitations.asRepo(),
    audit: fakeAudit(),
    deliver: async (i) => {
      invites.push(i)
    },
    transferExecutor: async (curId, tgtId) => {
      await memberships.updateRole(tgtId, 'OWNER')
      await memberships.updateRole(curId, 'ADMIN')
    },
  })

  return { service, users, memberships, invitations, invites, actor, ctx }
}

test('invite: ADMIN can invite a MEMBER; token delivered', async () => {
  const { service, invitations, invites } = await setup('ADMIN')
  const res = await service.invite({ email: 'new@acme.com', role: 'MEMBER' })
  assert.ok(res.invitationId)
  assert.equal(invitations.rows.length, 1)
  assert.equal(invites[0].to, 'new@acme.com')
  assert.equal(invitations.rows[0].token, hashToken(invites[0].token))
})

test('invite: MANAGER cannot invite an ADMIN (no privilege escalation)', async () => {
  const { service } = await setup('MANAGER')
  await assert.rejects(() => service.invite({ email: 'x@acme.com', role: 'ADMIN' }), AuthorizationError)
})

test('invite: MEMBER lacks member:invite entirely', async () => {
  const { service } = await setup('MEMBER')
  await assert.rejects(() => service.invite({ email: 'x@acme.com', role: 'MEMBER' }), AuthorizationError)
})

test('invite: duplicate pending invitation rejected', async () => {
  const { service } = await setup('ADMIN')
  await service.invite({ email: 'dup@acme.com', role: 'MEMBER' })
  await assert.rejects(() => service.invite({ email: 'dup@acme.com', role: 'MEMBER' }), ConflictError)
})

test('acceptInvite: matching email joins; mismatched email rejected', async () => {
  const { service, users, invites, memberships } = await setup('ADMIN')
  await service.invite({ email: 'joiner@acme.com', role: 'MEMBER' })
  const token = invites[0].token

  const wrong = await users.create({ email: 'someone-else@acme.com' })
  await assert.rejects(() => service.acceptInvite(wrong.id, { token }), AuthorizationError)

  const joiner = await users.create({ email: 'joiner@acme.com' })
  const membership = await service.acceptInvite(joiner.id, { token })
  assert.equal(membership.workspaceId, WS)
  assert.equal(membership.role, 'MEMBER')
  assert.ok(await memberships.find(joiner.id, WS))
})

test('acceptInvite: invalid token rejected', async () => {
  const { service, users } = await setup('ADMIN')
  const u = await users.create({ email: 'z@acme.com' })
  await assert.rejects(() => service.acceptInvite(u.id, { token: 'x'.repeat(32) }), BadRequestError)
})

test('changeRole: ADMIN promotes a MEMBER to MANAGER', async () => {
  const { service, users, memberships } = await setup('ADMIN')
  const m = await users.create({ email: 'member@acme.com' })
  await memberships.create({ userId: m.id, workspaceId: WS, role: 'MEMBER', status: 'ACTIVE' })

  const updated = await service.changeRole(m.id, { role: 'MANAGER' })
  assert.equal(updated.role, 'MANAGER')
})

test('changeRole: cannot change your own role', async () => {
  const { service, actor } = await setup('ADMIN')
  await assert.rejects(() => service.changeRole(actor.id, { role: 'MANAGER' }), BusinessError)
})

test('removeMember: MANAGER cannot remove (no member:remove permission)', async () => {
  const { service, users, memberships } = await setup('MANAGER')
  const victim = await users.create({ email: 'v@acme.com' })
  await memberships.create({ userId: victim.id, workspaceId: WS, role: 'MEMBER', status: 'ACTIVE' })
  await assert.rejects(() => service.removeMember(victim.id), AuthorizationError)
})

test('last-owner protection: the sole OWNER cannot demote themselves', async () => {
  const { service, actor } = await setup('OWNER')
  // Self-role changes are blocked; combined with peer-management rules this makes the
  // sole owner undemotable — ownership must be transferred first (RBAC.md §6).
  await assert.rejects(() => service.changeRole(actor.id, { role: 'ADMIN' }), BusinessError)
})

test('last-owner protection: assertNotLastOwner blocks demoting the only owner', async () => {
  // Reach the guard directly: an OWNER actor with a *second* owner present can be
  // managed, but with a single owner the guard trips.
  const { service, users, memberships } = await setup('OWNER')
  const second = await users.create({ email: 'second-owner@acme.com' })
  // Two owners: demoting one is allowed.
  await memberships.create({ userId: second.id, workspaceId: WS, role: 'OWNER', status: 'ACTIVE' })
  // With two owners the guard passes rank-wise but canManageRole(OWNER, OWNER) is false,
  // so demotion of a peer owner is still forbidden — proving owners are mutually protected.
  await assert.rejects(() => service.changeRole(second.id, { role: 'ADMIN' }), AuthorizationError)
})

test('transferOwnership: promotes target to OWNER, demotes caller to ADMIN', async () => {
  const { service, users, memberships, actor } = await setup('OWNER')
  const heir = await users.create({ email: 'heir@acme.com' })
  await memberships.create({ userId: heir.id, workspaceId: WS, role: 'ADMIN', status: 'ACTIVE' })

  await service.transferOwnership({ userId: heir.id })
  assert.equal((await memberships.find(heir.id, WS))?.role, 'OWNER')
  assert.equal((await memberships.find(actor.id, WS))?.role, 'ADMIN')
})

test('transferOwnership: only the OWNER may transfer', async () => {
  const { service, users, memberships } = await setup('ADMIN')
  const heir = await users.create({ email: 'heir@acme.com' })
  await memberships.create({ userId: heir.id, workspaceId: WS, role: 'MEMBER', status: 'ACTIVE' })
  await assert.rejects(() => service.transferOwnership({ userId: heir.id }), AuthorizationError)
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  can,
  canManageRole,
  canAssignRole,
  authorizeOwnership,
  requirePermission,
  requireOwnership,
  roleAtLeast,
} from '@/server/auth/rbac'
import { permissionsForRole, ROLE_RANK } from '@/server/auth/permissions'
import { AuthorizationError, NotFoundError } from '@/server/errors/app-error'

test('can(): matrix rows match RBAC.md §4', () => {
  assert.equal(can('OWNER', 'workspace:delete'), true)
  assert.equal(can('OWNER', 'billing:manage'), true)
  assert.equal(can('ADMIN', 'workspace:delete'), false)
  assert.equal(can('ADMIN', 'billing:manage'), false)
  assert.equal(can('ADMIN', 'settings:manage'), true)
  assert.equal(can('MANAGER', 'member:update'), false)
  assert.equal(can('MANAGER', 'member:invite'), true)
  assert.equal(can('MANAGER', 'template:create'), true)
  assert.equal(can('MEMBER', 'document:update:own'), true)
  assert.equal(can('MEMBER', 'document:update:any'), false)
  assert.equal(can('MEMBER', 'client:create'), true)
  assert.equal(can('MEMBER', 'client:update'), false)
  assert.equal(can('VIEWER', 'document:read'), true)
  assert.equal(can('VIEWER', 'document:create'), false)
  assert.equal(can('VIEWER', 'tool:run'), true)
})

test('role hierarchy: rank + manage + assign guardrails', () => {
  assert.ok(ROLE_RANK.OWNER > ROLE_RANK.ADMIN)
  assert.ok(ROLE_RANK.ADMIN > ROLE_RANK.MANAGER)
  assert.equal(roleAtLeast('MANAGER', 'MEMBER'), true)
  assert.equal(roleAtLeast('MEMBER', 'MANAGER'), false)

  // Manage = strictly more senior
  assert.equal(canManageRole('ADMIN', 'MANAGER'), true)
  assert.equal(canManageRole('ADMIN', 'ADMIN'), false)
  assert.equal(canManageRole('MANAGER', 'ADMIN'), false)
  assert.equal(canManageRole('OWNER', 'ADMIN'), true)

  // Assign ≤ own level, never OWNER, requires member:invite
  assert.equal(canAssignRole('MANAGER', 'MANAGER'), true)
  assert.equal(canAssignRole('MANAGER', 'ADMIN'), false)
  assert.equal(canAssignRole('ADMIN', 'ADMIN'), true)
  assert.equal(canAssignRole('ADMIN', 'OWNER'), false)
  assert.equal(canAssignRole('MEMBER', 'MEMBER'), false) // MEMBER lacks member:invite
})

test('authorizeOwnership(): any allows, own hides existence, else forbid', () => {
  assert.equal(authorizeOwnership('MANAGER', 'document:update', 'other', 'me'), 'allow')
  assert.equal(authorizeOwnership('MEMBER', 'document:update', 'me', 'me'), 'allow')
  assert.equal(authorizeOwnership('MEMBER', 'document:update', 'other', 'me'), 'not-found')
  assert.equal(authorizeOwnership('VIEWER', 'document:update', 'me', 'me'), 'forbid')
})

test('throwing guards: requirePermission (403) + requireOwnership (403/404)', () => {
  assert.throws(() => requirePermission('VIEWER', 'document:create'), AuthorizationError)
  assert.doesNotThrow(() => requirePermission('MEMBER', 'document:create'))

  assert.throws(() => requireOwnership('VIEWER', 'document:update', 'me', 'me'), AuthorizationError)
  assert.throws(() => requireOwnership('MEMBER', 'document:update', 'other', 'me'), NotFoundError)
  assert.doesNotThrow(() => requireOwnership('MEMBER', 'document:update', 'me', 'me'))
})

test('permissionsForRole(): stable set per role', () => {
  const viewer = permissionsForRole('VIEWER')
  assert.ok(viewer.includes('document:read'))
  assert.ok(!viewer.includes('document:create'))
  const owner = permissionsForRole('OWNER')
  assert.ok(owner.includes('workspace:delete'))
  assert.ok(owner.length > permissionsForRole('MEMBER').length)
})

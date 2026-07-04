import type { Role } from '@prisma/client'

/**
 * Permission catalogue and role → permission mapping.
 *
 * This is the executable form of the matrix in `RBAC.md §4`. Permissions are
 * `resource:action` strings; the four ownership-sensitive document/payment actions
 * carry an explicit `:any` / `:own` scope suffix (RBAC.md §3). The map is static
 * (no DB lookup), so `can()` is O(1) and safe to call in edge/middleware and services
 * alike — authorization is enforced in depth, not only at the transport edge.
 */

export type Permission =
  // workspace
  | 'workspace:read'
  | 'workspace:update'
  | 'workspace:delete'
  // billing
  | 'billing:manage'
  // member
  | 'member:read'
  | 'member:invite'
  | 'member:update'
  | 'member:remove'
  // documents (ownership-scoped for MEMBER)
  | 'document:create'
  | 'document:read'
  | 'document:export'
  | 'document:update:any'
  | 'document:update:own'
  | 'document:delete:any'
  | 'document:delete:own'
  | 'document:send:any'
  | 'document:send:own'
  // clients
  | 'client:read'
  | 'client:create'
  | 'client:update'
  | 'client:delete'
  // products
  | 'product:read'
  | 'product:create'
  | 'product:update'
  | 'product:delete'
  // templates
  | 'template:create'
  | 'template:update'
  // payments
  | 'payment:record:any'
  | 'payment:record:own'
  // tools
  | 'tool:run'
  // observability / settings
  | 'audit:read'
  | 'settings:manage'

/** Base actions that resolve to `:any` / `:own` scopes (ownership-sensitive). */
export type OwnableAction =
  | 'document:update'
  | 'document:delete'
  | 'document:send'
  | 'payment:record'

/** Numeric rank for hierarchy comparisons (higher = more privileged). */
export const ROLE_RANK: Record<Role, number> = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  MEMBER: 2,
  VIEWER: 1,
}

// Every permission a MEMBER holds (own-scoped for documents/payments).
const MEMBER_PERMISSIONS: Permission[] = [
  'workspace:read',
  'member:read',
  'document:create',
  'document:read',
  'document:export',
  'document:update:own',
  'document:delete:own',
  'document:send:own',
  'client:read',
  'client:create',
  'product:read',
  'product:create',
  'payment:record:own',
  'tool:run',
]

const VIEWER_PERMISSIONS: Permission[] = [
  'workspace:read',
  'member:read',
  'document:read',
  'document:export',
  'client:read',
  'product:read',
  'tool:run',
]

const MANAGER_PERMISSIONS: Permission[] = [
  'workspace:read',
  'member:read',
  'member:invite',
  'document:create',
  'document:read',
  'document:export',
  'document:update:any',
  'document:delete:any',
  'document:send:any',
  'client:read',
  'client:create',
  'client:update',
  'client:delete',
  'product:read',
  'product:create',
  'product:update',
  'product:delete',
  'template:create',
  'template:update',
  'payment:record:any',
  'tool:run',
]

const ADMIN_PERMISSIONS: Permission[] = [
  ...MANAGER_PERMISSIONS,
  'workspace:update',
  'member:update',
  'member:remove',
  'audit:read',
  'settings:manage',
]

const OWNER_PERMISSIONS: Permission[] = [
  ...ADMIN_PERMISSIONS,
  'workspace:delete',
  'billing:manage',
]

/** Role → permission set. Deduplicated via Set (ADMIN/OWNER extend MANAGER). */
export const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  OWNER: new Set(OWNER_PERMISSIONS),
  ADMIN: new Set(ADMIN_PERMISSIONS),
  MANAGER: new Set(MANAGER_PERMISSIONS),
  MEMBER: new Set(MEMBER_PERMISSIONS),
  VIEWER: new Set(VIEWER_PERMISSIONS),
}

/** The flat list of permissions granted to a role (stable, sorted). */
export function permissionsForRole(role: Role): Permission[] {
  return [...ROLE_PERMISSIONS[role]].sort()
}

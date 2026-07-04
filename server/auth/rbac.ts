import type { Role } from '@prisma/client'
import { AuthorizationError, NotFoundError } from '@/server/errors/app-error'
import {
  ROLE_PERMISSIONS,
  ROLE_RANK,
  type OwnableAction,
  type Permission,
} from '@/server/auth/permissions'

/**
 * RBAC decision engine (RBAC.md §5, Layer 3).
 *
 * Pure, synchronous, DB-free predicates plus throwing guards. `can()` answers the plain
 * "does this role hold this permission?" question; `authorizeOwnership()` implements the
 * `:any` / `:own` split (and hides existence with a 404 rather than a 403 across the
 * ownership boundary, per RBAC.md §5). Role-hierarchy helpers back the membership
 * guardrails (no privilege escalation, last-owner protection).
 */

/** Does `role` hold `permission`? */
export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission)
}

export function canAny(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p))
}

export function canAll(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => can(role, p))
}

/** Throwing guard: `403` if the role lacks the permission. */
export function requirePermission(role: Role, permission: Permission): void {
  if (!can(role, permission)) {
    throw new AuthorizationError(`Missing required permission: ${permission}`, { permission })
  }
}

// --- Role hierarchy ---------------------------------------------------------

/** True when `role` is at least as privileged as `min`. */
export function roleAtLeast(role: Role, min: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min]
}

/**
 * Can an actor with `actorRole` manage a member with `targetRole`? Strictly greater
 * rank — you can never act on a peer or a more senior member (RBAC.md §6). OWNER can
 * manage everyone below OWNER.
 */
export function canManageRole(actorRole: Role, targetRole: Role): boolean {
  return ROLE_RANK[actorRole] > ROLE_RANK[targetRole]
}

/**
 * May `actorRole` assign `desiredRole` on an invite/role-change? A MANAGER may only
 * invite at or below their own level (RBAC.md §4 "member:invite ≤ own level"); ADMIN and
 * OWNER may assign any non-OWNER role. OWNER is never assignable here (transfer-only).
 */
export function canAssignRole(actorRole: Role, desiredRole: Role): boolean {
  if (desiredRole === 'OWNER') return false
  if (!can(actorRole, 'member:invite')) return false
  return ROLE_RANK[desiredRole] <= ROLE_RANK[actorRole]
}

// --- Ownership-scoped decisions --------------------------------------------

export type OwnershipDecision = 'allow' | 'forbid' | 'not-found'

/**
 * Resolve an ownership-sensitive action to a decision. If the role holds the `:any`
 * scope it always allows; if it only holds `:own`, the acting user must own the
 * resource, otherwise the resource is reported as *not found* (existence is hidden).
 * If neither scope is held it is forbidden.
 */
export function authorizeOwnership(
  role: Role,
  action: OwnableAction,
  resourceOwnerId: string | null | undefined,
  actorUserId: string,
): OwnershipDecision {
  if (can(role, `${action}:any` as Permission)) return 'allow'
  if (can(role, `${action}:own` as Permission)) {
    return resourceOwnerId && resourceOwnerId === actorUserId ? 'allow' : 'not-found'
  }
  return 'forbid'
}

/**
 * Throwing form of {@link authorizeOwnership}: `403` when the role can never perform the
 * action, `404` when it may only act on its own records and this one is not theirs
 * (never leaking that the record exists).
 */
export function requireOwnership(
  role: Role,
  action: OwnableAction,
  resourceOwnerId: string | null | undefined,
  actorUserId: string,
): void {
  const decision = authorizeOwnership(role, action, resourceOwnerId, actorUserId)
  if (decision === 'allow') return
  if (decision === 'not-found') throw new NotFoundError()
  throw new AuthorizationError(`Missing required permission: ${action}`, { action })
}

export type { Permission, OwnableAction } from '@/server/auth/permissions'
export { ROLE_PERMISSIONS, ROLE_RANK, permissionsForRole } from '@/server/auth/permissions'

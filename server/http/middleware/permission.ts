import type { RequestContext } from '@/server/http/context'
import { AuthorizationError } from '@/server/errors/app-error'
import { requirePermission } from '@/server/auth/rbac'
import type { Permission } from '@/server/auth/permissions'

/**
 * Permission middleware (RBAC.md §5, Layer 3). Consults the static role → permission map
 * for the caller's workspace role (already resolved onto the context) and denies with a
 * `403` when the permission is missing. DB-free and O(1).
 */
export function enforcePermission(ctx: RequestContext, permission: Permission): void {
  if (!ctx.role) {
    throw new AuthorizationError('No workspace role resolved for this request')
  }
  requirePermission(ctx.role, permission)
}

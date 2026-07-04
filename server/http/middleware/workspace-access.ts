import type { RequestContext } from '@/server/http/context'
import {
  AuthorizationError,
  TenantRequiredError,
  UnauthenticatedError,
} from '@/server/errors/app-error'
import { MembershipRepository } from '@/server/repositories/membership.repository'

/**
 * Workspace-authorization middleware (RBAC.md §5, Layer 2).
 *
 * Confirms the authenticated user is an active member of the resolved workspace and
 * attaches their membership + role to the context. Suspended or still-invited members
 * fail here — an instant, reversible access cut without data loss (RBAC.md §6). Runs
 * after authentication + workspace resolution.
 */
export async function resolveMembership(ctx: RequestContext): Promise<void> {
  if (!ctx.user) throw new UnauthenticatedError()
  if (!ctx.workspaceId) throw new TenantRequiredError()

  const membership = await new MembershipRepository().find(ctx.user.id, ctx.workspaceId)
  if (!membership) {
    throw new AuthorizationError('You are not a member of this workspace')
  }
  if (membership.status === 'SUSPENDED') {
    throw new AuthorizationError('Your access to this workspace has been suspended')
  }
  if (membership.status === 'INVITED') {
    throw new AuthorizationError('Your workspace invitation has not been accepted yet')
  }

  ctx.membership = membership
  ctx.role = membership.role
  ctx.logger.debug('membership.resolved', { role: membership.role })
}

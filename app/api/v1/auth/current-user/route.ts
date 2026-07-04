import { defineRoute } from '@/server/http/handler'
import { UserRepository } from '@/server/repositories/user.repository'
import { MembershipRepository } from '@/server/repositories/membership.repository'
import { toCurrentUserDTO, type CurrentUserDTO } from '@/lib/dto/auth.dto'
import { UnauthenticatedError } from '@/server/errors/app-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/auth/current-user — the authenticated identity plus their workspaces and
 * the active role's permission set (backs route guards + the frozen WorkspaceSwitcher).
 * The active workspace comes from the `x-workspace-id` header when present, else the
 * first membership.
 */
export const GET = defineRoute<CurrentUserDTO>({
  requireAuth: true,
  handler: async ({ ctx }) => {
    if (!ctx.user) throw new UnauthenticatedError()
    const user = await new UserRepository().requireById(ctx.user.id)
    const memberships = await new MembershipRepository().listByUser(user.id)
    const active = ctx.workspaceId ?? memberships[0]?.workspaceId ?? null
    return toCurrentUserDTO(user, memberships, active)
  },
})

import { defineRoute } from '@/server/http/handler'
import { MembershipService } from '@/server/services/membership.service'
import { acceptInviteSchema, type AcceptInviteInput } from '@/lib/validation/auth.schema'
import { UnauthenticatedError } from '@/server/errors/app-error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/invitations/accept — accept a workspace invitation as the signed-in user
 * (RBAC.md §6). The invite token determines the workspace, so no workspace header is
 * needed; the accepting user's email must match the invited address.
 */
export const POST = defineRoute<{ workspaceId: string; role: string }, AcceptInviteInput>({
  requireAuth: true,
  schema: { body: acceptInviteSchema },
  csrf: true,
  rateLimit: { limit: 20, windowMs: 60_000 },
  handler: async ({ body, ctx }) => {
    if (!ctx.user) throw new UnauthenticatedError()
    const membership = await new MembershipService(ctx).acceptInvite(ctx.user.id, body)
    return { workspaceId: membership.workspaceId, role: membership.role }
  },
})

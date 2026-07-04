import { defineRoute } from '@/server/http/handler'
import { MembershipRepository } from '@/server/repositories/membership.repository'
import { MembershipService } from '@/server/services/membership.service'
import { buildPageMeta } from '@/server/db/utils'
import { toMemberDTO, type MemberDTO } from '@/lib/dto/auth.dto'
import { inviteMemberSchema, type InviteMemberInput } from '@/lib/validation/auth.schema'
import type { ListResult } from '@/server/http/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/members — list the members of the active workspace (RBAC `member:read`).
 * The workspace is taken from the `x-workspace-id` header; membership + role are
 * resolved and enforced by the pipeline before this handler runs.
 */
export const GET = defineRoute<ListResult<MemberDTO>>({
  permission: 'member:read',
  handler: async ({ ctx }) => {
    const members = await new MembershipRepository().listByWorkspace(ctx.workspaceId as string)
    const items = members.map(toMemberDTO)
    return { items, pagination: buildPageMeta(items.length, 1, Math.max(1, items.length)) }
  },
})

/**
 * POST /api/v1/members — invite a member (RBAC `member:invite`, no privilege
 * escalation). Returns the invitation id.
 */
export const POST = defineRoute<{ invitationId: string; devToken?: string }, InviteMemberInput>({
  permission: 'member:invite',
  schema: { body: inviteMemberSchema },
  csrf: true,
  rateLimit: { limit: 30, windowMs: 60_000 },
  status: 201,
  handler: ({ body, ctx }) => new MembershipService(ctx).invite(body),
})

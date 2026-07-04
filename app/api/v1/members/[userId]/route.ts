import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { MembershipService } from '@/server/services/membership.service'
import { changeRoleSchema, type ChangeRoleInput } from '@/lib/validation/auth.schema'
import { idSchema } from '@/lib/validation/common.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ userId: idSchema })
type Params = z.infer<typeof paramsSchema>

/**
 * PATCH /api/v1/members/:userId — change a member's role (RBAC `member:update`).
 * The service enforces last-owner protection and no-self-role-change on top.
 */
export const PATCH = defineRoute<{ id: string; role: string }, ChangeRoleInput, undefined, Params>({
  permission: 'member:update',
  schema: { params: paramsSchema, body: changeRoleSchema },
  csrf: true,
  handler: async ({ params, body, ctx }) => {
    const updated = await new MembershipService(ctx).changeRole(params.userId, body)
    return { id: updated.id, role: updated.role }
  },
})

/**
 * DELETE /api/v1/members/:userId — remove a member (RBAC `member:remove`), guarded by
 * last-owner protection.
 */
export const DELETE = defineRoute<{ ok: true }, undefined, undefined, Params>({
  permission: 'member:remove',
  schema: { params: paramsSchema },
  csrf: true,
  handler: async ({ params, ctx }) => {
    await new MembershipService(ctx).removeMember(params.userId)
    return { ok: true }
  },
})

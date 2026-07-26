import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { AdminService } from '@/server/services/admin.service'
import { assertSiteAdmin } from '@/server/auth/site-admin'
import { idSchema } from '@/lib/validation/common.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

/**
 * DELETE /api/v1/admin/users/:id — permanently delete a platform user (site admin only).
 * Blocked if the target solely owns a workspace that still has other members — see
 * {@link AdminService.deleteUser} for the last-owner protection this enforces.
 */
export const DELETE = defineRoute<{ ok: true }, undefined, undefined, Params>({
  requireAuth: true,
  schema: { params: paramsSchema },
  csrf: true,
  handler: async ({ params, ctx }) => {
    assertSiteAdmin(ctx, 'The users list')
    await new AdminService(ctx).deleteUser(params.id)
    return { ok: true }
  },
})

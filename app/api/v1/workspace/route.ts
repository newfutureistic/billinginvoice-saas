import { defineRoute } from '@/server/http/handler'
import { WorkspaceService, type WorkspaceDetailDTO } from '@/server/services/workspace.service'
import { workspaceUpdateSchema, type WorkspaceUpdateInput } from '@/lib/validation/workspace.schema'
import type { WorkspaceOutputDTO } from '@/lib/dto/workspace.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * The active workspace (resolved from the `x-workspace-id` header).
 * GET detail (`workspace:read`), PATCH name (`workspace:update`), DELETE soft-delete
 * (`workspace:delete`, OWNER only per the RBAC matrix).
 */
export const GET = defineRoute<WorkspaceDetailDTO>({
  permission: 'workspace:read',
  handler: ({ ctx }) => new WorkspaceService(ctx).getDetail(ctx.workspaceId as string),
})

export const PATCH = defineRoute<WorkspaceOutputDTO, WorkspaceUpdateInput>({
  permission: 'workspace:update',
  schema: { body: workspaceUpdateSchema },
  csrf: true,
  handler: ({ body, ctx }) => new WorkspaceService(ctx).update(ctx.workspaceId as string, body),
})

export const DELETE = defineRoute<{ ok: true }>({
  permission: 'workspace:delete',
  csrf: true,
  handler: async ({ ctx }) => {
    await new WorkspaceService(ctx).remove(ctx.workspaceId as string)
    return { ok: true }
  },
})

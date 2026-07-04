import { defineRoute } from '@/server/http/handler'
import { WorkspaceService } from '@/server/services/workspace.service'
import { workspaceCreateSchema, type WorkspaceCreateInput } from '@/lib/validation/workspace.schema'
import type { WorkspaceOutputDTO } from '@/lib/dto/workspace.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/workspaces — the workspaces the authenticated user belongs to (backs the
 * frozen WorkspaceSwitcher). POST creates a new workspace with the caller as OWNER.
 */
export const GET = defineRoute<{ workspaces: WorkspaceOutputDTO[] }>({
  requireAuth: true,
  handler: async ({ ctx }) => ({ workspaces: await new WorkspaceService(ctx).listForUser() }),
})

export const POST = defineRoute<WorkspaceOutputDTO, WorkspaceCreateInput>({
  requireAuth: true,
  schema: { body: workspaceCreateSchema },
  csrf: true,
  status: 201,
  handler: ({ body, ctx }) => new WorkspaceService(ctx).create(body),
})

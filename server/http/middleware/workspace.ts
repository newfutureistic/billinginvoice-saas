import type { RequestContext } from '@/server/http/context'
import { WorkspaceRepository } from '@/server/repositories/workspace.repository'
import { AppError, TenantRequiredError } from '@/server/errors/app-error'
import { ErrorCode } from '@/server/errors/error-codes'
import { HttpStatus } from '@/server/errors/http-status'

/**
 * Workspace resolution (step 2 of 2): load the workspace named by `resolveTenant` and
 * confirm it exists and is not soft-deleted, attaching the entity to the context.
 *
 * NB: membership/permission checks are intentionally absent — those belong to the auth
 * mission. This only proves the tenant exists so downstream repositories can scope to it.
 */
export async function resolveWorkspace(ctx: RequestContext): Promise<void> {
  if (!ctx.workspaceId) throw new TenantRequiredError()

  const workspace = await new WorkspaceRepository().findById(ctx.workspaceId)
  if (!workspace) {
    throw new AppError('Workspace not found', {
      code: ErrorCode.WORKSPACE_NOT_FOUND,
      httpStatus: HttpStatus.NOT_FOUND,
      details: { workspaceId: ctx.workspaceId },
      expose: true,
    })
  }

  ctx.workspace = workspace
  ctx.logger.debug('workspace.resolved', { workspaceId: workspace.id })
}

import type { NextRequest } from 'next/server'
import type { RequestContext } from '@/server/http/context'
import { TenantRequiredError } from '@/server/errors/app-error'

export const WORKSPACE_HEADER = 'x-workspace-id'

/**
 * Tenant resolution (step 1 of 2): identify *which* tenant this request targets from the
 * `x-workspace-id` header (or `?workspaceId=` fallback) and record it on the context.
 * This does not touch the database and performs no authorization — that is the auth
 * mission's job. Workspace *loading/validation* is step 2 (`resolveWorkspace`).
 */
export function resolveTenant(
  req: NextRequest,
  ctx: RequestContext,
  options: { required?: boolean } = {},
): void {
  const id =
    req.headers.get(WORKSPACE_HEADER) ??
    req.nextUrl.searchParams.get('workspaceId') ??
    undefined

  if (id) {
    ctx.workspaceId = id
    ctx.logger.debug('tenant.resolved', { workspaceId: id })
  } else if (options.required) {
    throw new TenantRequiredError()
  }
}

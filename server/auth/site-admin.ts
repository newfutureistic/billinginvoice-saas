import { isSiteAdmin } from '@/lib/config/plans'
import { AuthorizationError } from '@/server/errors/app-error'
import type { RequestContext } from '@/server/http/context'

/**
 * Guard for site-global admin surfaces (the blog CMS, the all-users list). Workspace RBAC
 * alone is not enough here: every signup is OWNER of their own workspace and so holds
 * workspace-level permissions, but these surfaces are platform-wide, not per-workspace. This
 * restricts them to an explicit allowlist (`NEXT_PUBLIC_SITE_ADMIN_EMAILS`). Throws 403 for
 * everyone else.
 */
export function assertSiteAdmin(ctx: RequestContext, area = 'This area'): void {
  if (!isSiteAdmin(ctx.user?.email)) {
    throw new AuthorizationError(`${area} is restricted to site administrators.`)
  }
}

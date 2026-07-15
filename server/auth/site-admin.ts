import { isSiteAdmin } from '@/lib/config/plans'
import { AuthorizationError } from '@/server/errors/app-error'
import type { RequestContext } from '@/server/http/context'

/**
 * Guard for site-global admin surfaces (currently the blog CMS). Workspace RBAC alone is not
 * enough here: every signup is OWNER of their own workspace and so holds `blog:manage`, but the
 * blog publishes to the public site. This restricts it to an explicit allowlist
 * (`NEXT_PUBLIC_SITE_ADMIN_EMAILS`). Throws 403 for everyone else.
 */
export function assertSiteAdmin(ctx: RequestContext): void {
  if (!isSiteAdmin(ctx.user?.email)) {
    throw new AuthorizationError('Blog management is restricted to site administrators.')
  }
}

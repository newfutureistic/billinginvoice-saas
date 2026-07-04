import type { RequestContext } from '@/server/http/context'
import type { Logger } from '@/server/db/logger'

/**
 * Base class for all services. Carries the per-request context (request id, workspace,
 * logger) so business logic can log with correlation and scope work to the tenant
 * without re-reading the HTTP request. Services never see the raw `Request`.
 */
export abstract class BaseService {
  protected readonly ctx: RequestContext
  protected readonly logger: Logger

  constructor(ctx: RequestContext) {
    this.ctx = ctx
    this.logger = ctx.logger.child({ service: new.target.name })
  }

  /** The active workspace id, when the route resolved one. */
  protected get workspaceId(): string | undefined {
    return this.ctx.workspaceId
  }
}

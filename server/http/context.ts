import { randomUUID } from 'node:crypto'
import type { Membership, Role, Workspace } from '@prisma/client'
import { createLogger, type Logger } from '@/server/db/logger'

/**
 * Per-request context, threaded from the route handler down to services. Middleware
 * populate it (request id, client metadata, authenticated user, workspace, membership);
 * handlers and services read it. It never carries the raw `Request` — layers below the
 * HTTP boundary depend only on this shape.
 */
export interface RequestContext {
  /** Correlation id, echoed in the `x-request-id` header and every log line. */
  requestId: string
  /** High-resolution start time (ms) for duration logging. */
  startedAt: number
  method: string
  path: string
  logger: Logger
  /** Client IP (best-effort, from forwarded headers) — for audit + rate limiting. */
  ip?: string
  /** Client user-agent — for audit. */
  userAgent?: string
  /** Set by the authentication middleware once a valid session is resolved. */
  user?: AuthUser
  /** Active server-side session id (JWT `sid`). */
  sessionId?: string
  /** Set by tenant-resolution middleware. */
  workspaceId?: string
  /** Set by workspace-resolution middleware (validated to exist). */
  workspace?: Workspace
  /** Set by the membership/workspace-authz middleware. */
  membership?: Membership
  /** The caller's role in the active workspace (from {@link membership}). */
  role?: Role
}

/** The authenticated principal attached to the context (never carries the password). */
export interface AuthUser {
  id: string
  email: string
  name: string | null
  image: string | null
}

/** Context available only after tenant + workspace resolution have run. */
export interface WorkspaceContext extends RequestContext {
  workspaceId: string
  workspace: Workspace
}

/** Context guaranteed to carry an authenticated user. */
export interface AuthenticatedContext extends RequestContext {
  user: AuthUser
}

/** Context after authentication + workspace + membership resolution (RBAC-ready). */
export interface MemberContext extends WorkspaceContext {
  user: AuthUser
  membership: Membership
  role: Role
}

export function hasWorkspace(ctx: RequestContext): ctx is WorkspaceContext {
  return typeof ctx.workspaceId === 'string' && ctx.workspace !== undefined
}

export function hasUser(ctx: RequestContext): ctx is AuthenticatedContext {
  return ctx.user !== undefined
}

export function hasMembership(ctx: RequestContext): ctx is MemberContext {
  return hasWorkspace(ctx) && ctx.user !== undefined && ctx.membership !== undefined && ctx.role !== undefined
}

/**
 * Build a synthetic context for non-HTTP callers (Auth.js `authorize`, background
 * jobs, seeds) so the service layer — which always expects a {@link RequestContext} —
 * can be reused unchanged off the request path.
 */
export function createSystemContext(label = 'system', bindings: Record<string, unknown> = {}): RequestContext {
  const requestId = `sys_${randomUUID()}`
  return {
    requestId,
    startedAt: performance.now(),
    method: 'SYSTEM',
    path: label,
    logger: createLogger(label, { requestId, ...bindings }),
  }
}

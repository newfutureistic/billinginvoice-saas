import { NextResponse, type NextRequest } from 'next/server'
import type { ZodType } from 'zod'
import { createLogger } from '@/server/db/logger'
import type { RequestContext } from '@/server/http/context'
import { successBody, errorBody } from '@/server/http/response'
import { toAppError } from '@/server/errors/error-handler'
import { RateLimitError } from '@/server/errors/app-error'
import { securityHeaders } from '@/server/http/middleware/security-headers'
import { buildCorsHeaders, isPreflight, type CorsOptions } from '@/server/http/middleware/cors'
import { REQUEST_ID_HEADER, resolveRequestId } from '@/server/http/middleware/request-id'
import { logRequestEnd, logRequestStart } from '@/server/http/middleware/logging'
import { resolveTenant } from '@/server/http/middleware/tenant'
import { resolveWorkspace } from '@/server/http/middleware/workspace'
import { resolveClientMeta } from '@/server/http/middleware/client-meta'
import { resolveAuth } from '@/server/http/middleware/authentication'
import { resolveMembership } from '@/server/http/middleware/workspace-access'
import { enforcePermission } from '@/server/http/middleware/permission'
import { enforceCsrf } from '@/server/http/middleware/csrf'
import type { Permission } from '@/server/auth/permissions'
import {
  defaultRateLimiter,
  enforceRateLimit,
  rateLimitKey,
  type RateLimiter,
  type RateLimitWindow,
} from '@/server/http/middleware/rate-limit'
import { parseWith, readJsonBody, searchParamsToObject } from '@/server/http/middleware/validation'

type MaybePromise<T> = T | Promise<T>

export interface RouteSegmentContext<P> {
  params: Promise<P>
}

/** Input handed to a route's business handler after the middleware chain has run. */
export interface RouteInput<Body, Query, Params> {
  req: NextRequest
  ctx: RequestContext
  body: Body
  query: Query
  params: Params
}

export interface RouteConfig<Body, Query, Params, Data> {
  /** Zod schemas for request parts. Omit a part to skip its validation. */
  schema?: {
    body?: ZodType<Body>
    query?: ZodType<Query>
    params?: ZodType<Params>
  }
  /** Resolve + require a valid workspace (tenant) before the handler runs. */
  requireWorkspace?: boolean
  /** Require a valid authenticated session (RBAC Layer 1). */
  requireAuth?: boolean
  /**
   * Require the caller be an active member of the resolved workspace (RBAC Layer 2).
   * Implies `requireAuth` + `requireWorkspace`.
   */
  requireMembership?: boolean
  /**
   * Require a specific permission for the caller's workspace role (RBAC Layer 3).
   * Implies `requireMembership`.
   */
  permission?: Permission
  /** Enforce the CSRF origin check on unsafe methods (default: off for compatibility). */
  csrf?: boolean
  cors?: CorsOptions
  /** Enable rate limiting with a window, or `false`/omit to disable. */
  rateLimit?: RateLimitWindow
  rateLimiter?: RateLimiter
  /** Success status (default 200). */
  status?: number
  handler: (input: RouteInput<Body, Query, Params>) => MaybePromise<Data>
}

type NextRouteHandler<Params> = (
  req: NextRequest,
  segment: RouteSegmentContext<Params>,
) => Promise<Response>

/**
 * The single entry point for building an API route handler. It runs the standard
 * middleware chain (request id → CORS/security headers → logging → rate limit → tenant
 * → workspace → validation), invokes the typed business handler, and formats one
 * consistent response envelope. Any thrown error is normalized by `toAppError` and
 * rendered as the standard error body — handlers never build responses themselves.
 */
export function defineRoute<
  Data,
  Body = undefined,
  Query = undefined,
  Params extends Record<string, string> = Record<string, string>,
>(config: RouteConfig<Body, Query, Params, Data>): NextRouteHandler<Params> {
  return async (req, segment) => {
    const requestId = resolveRequestId(req)
    const ctx: RequestContext = {
      requestId,
      startedAt: performance.now(),
      method: req.method,
      path: req.nextUrl.pathname,
      logger: createLogger('api', { requestId }),
    }
    resolveClientMeta(req, ctx)

    const baseHeaders: Record<string, string> = {
      ...securityHeaders(),
      ...buildCorsHeaders(req, config.cors),
      [REQUEST_ID_HEADER]: requestId,
    }

    if (isPreflight(req)) {
      return new NextResponse(null, { status: 204, headers: baseHeaders })
    }

    // Authorization is layered: any deeper requirement implies the shallower ones.
    const needsMembership = config.requireMembership || config.permission !== undefined
    const needsAuth = config.requireAuth || needsMembership
    const needsWorkspace = config.requireWorkspace || needsMembership

    logRequestStart(ctx)
    try {
      if (config.csrf) enforceCsrf(req)

      if (config.rateLimit) {
        await enforceRateLimit(config.rateLimiter ?? defaultRateLimiter, rateLimitKey(req, ctx), config.rateLimit)
      }

      if (needsAuth) await resolveAuth(ctx, { required: true })

      if (needsWorkspace) {
        resolveTenant(req, ctx, { required: true })
        await resolveWorkspace(ctx)
      } else {
        resolveTenant(req, ctx)
      }

      if (needsMembership) await resolveMembership(ctx)
      if (config.permission !== undefined) enforcePermission(ctx, config.permission)

      const rawParams = await segment.params
      const params: Params = config.schema?.params
        ? parseWith(config.schema.params, rawParams)
        : (rawParams as Params)
      const query: Query = config.schema?.query
        ? parseWith(config.schema.query, searchParamsToObject(req.nextUrl.searchParams))
        : (undefined as Query)
      const body: Body = config.schema?.body
        ? parseWith(config.schema.body, await readJsonBody(req))
        : (undefined as Body)

      const data = await config.handler({ req, ctx, body, query, params })

      const status = config.status ?? 200
      logRequestEnd(ctx, status)
      return NextResponse.json(successBody(data, { requestId }), { status, headers: baseHeaders })
    } catch (err) {
      const appError = toAppError(err)
      if (appError.isInternal) {
        ctx.logger.error('request.error', {
          code: appError.code,
          message: err instanceof Error ? err.message : String(err),
        })
      }
      logRequestEnd(ctx, appError.httpStatus)

      const headers: Record<string, string> = { ...baseHeaders }
      if (appError instanceof RateLimitError && appError.retryAfterSeconds) {
        headers['Retry-After'] = String(appError.retryAfterSeconds)
      }
      return NextResponse.json(errorBody(appError, { requestId }), {
        status: appError.httpStatus,
        headers,
      })
    }
  }
}

/** Standard 405 for unsupported methods on a route. */
export function methodNotAllowed(allowed: string[]): Response {
  return NextResponse.json(
    { success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' }, meta: { requestId: 'n/a', timestamp: new Date().toISOString() } },
    { status: 405, headers: { Allow: allowed.join(', ') } },
  )
}

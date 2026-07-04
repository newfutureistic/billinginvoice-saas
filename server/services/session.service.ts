import type { Session } from '@prisma/client'
import { BaseService } from '@/server/services/base.service'
import { SessionRepository } from '@/server/repositories/session.repository'
import { getAuthEnv } from '@/server/config/env'
import { generateSessionId, generateToken, expiresInDays } from '@/server/auth/tokens'
import type { RequestContext } from '@/server/http/context'

export interface CreateSessionOptions {
  rememberMe?: boolean
  ip?: string | null
  userAgent?: string | null
}

/**
 * Session lifecycle service (AUTH_FLOW.md §7) over the server-side session registry.
 *
 * Auth.js runs the JWT strategy (required by the Credentials provider); this service
 * owns the accompanying revocable ledger: it mints the `sid` embedded in the JWT,
 * validates it on each request, rotates it on refresh, and revokes it on logout /
 * password change / "sign out everywhere". "Remember me" simply selects the longer TTL.
 */
export class SessionService extends BaseService {
  private readonly repo: SessionRepository

  constructor(ctx: RequestContext, repo: SessionRepository = new SessionRepository()) {
    super(ctx)
    this.repo = repo
  }

  /** TTL for a new session, in days, based on the remember-me flag. */
  private ttlDays(rememberMe: boolean): number {
    const env = getAuthEnv()
    return rememberMe ? env.SESSION_REMEMBER_AGE_DAYS : env.SESSION_MAX_AGE_DAYS
  }

  /** Register a new session; returns the row (its `id` becomes the JWT `sid`). */
  async create(userId: string, options: CreateSessionOptions = {}): Promise<Session> {
    const rememberMe = options.rememberMe ?? false
    const session = await this.repo.create({
      id: generateSessionId(),
      sessionToken: generateToken(),
      userId,
      expires: expiresInDays(this.ttlDays(rememberMe)),
      rememberMe,
      ip: options.ip ?? this.ctx.ip ?? null,
      userAgent: options.userAgent ?? this.ctx.userAgent ?? null,
    })
    this.logger.info('session.created', { sid: session.id, userId, rememberMe })
    return session
  }

  /** Return the session iff it is still active, refreshing its last-active stamp. */
  async validate(sid: string): Promise<Session | null> {
    const session = await this.repo.findActiveById(sid)
    if (!session) return null
    // Best-effort activity stamp; never block the request on it.
    void this.repo.touch(sid).catch(() => undefined)
    return session
  }

  /** Rotate the opaque token and slide the expiry window forward (token rotation). */
  async refresh(sid: string): Promise<Session | null> {
    const session = await this.repo.findActiveById(sid)
    if (!session) return null
    const rotated = await this.repo.rotate(
      sid,
      generateToken(),
      expiresInDays(this.ttlDays(session.rememberMe)),
    )
    this.logger.info('session.refreshed', { sid })
    return rotated
  }

  async revoke(sid: string): Promise<void> {
    await this.repo.revoke(sid)
    this.logger.info('session.revoked', { sid })
  }

  /** Revoke every session for a user (optionally keeping `exceptSid`). */
  async revokeAll(userId: string, exceptSid?: string): Promise<number> {
    const count = await this.repo.revokeAllForUser(userId, { exceptId: exceptSid })
    this.logger.info('session.revoked_all', { userId, count, exceptSid })
    return count
  }

  list(userId: string): Promise<Session[]> {
    return this.repo.listActiveByUser(userId)
  }
}

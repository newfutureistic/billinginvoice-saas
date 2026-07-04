import { Prisma, type Session } from '@prisma/client'
import { BaseRepository } from '@/server/repositories/base.repository'

/** Input for registering a server-side session (the JWT `sid` ledger). */
export interface SessionCreateData {
  /** Session id — used as the JWT `sid` claim. */
  id: string
  sessionToken: string
  userId: string
  expires: Date
  rememberMe?: boolean
  ip?: string | null
  userAgent?: string | null
}

/**
 * Server-side session registry repository.
 *
 * With the Credentials provider Auth.js runs the JWT strategy; these rows make those
 * JWTs *revocable* and auditable. A session is "active" when it is not revoked and not
 * past its `expires`. Revocation (single device, all devices, or on credential change)
 * flips `revokedAt`, so the next request whose JWT references the row is rejected.
 */
export class SessionRepository extends BaseRepository {
  create(data: SessionCreateData): Promise<Session> {
    const input: Prisma.SessionUncheckedCreateInput = {
      id: data.id,
      sessionToken: data.sessionToken,
      userId: data.userId,
      expires: data.expires,
      rememberMe: data.rememberMe ?? false,
      ip: data.ip ?? null,
      userAgent: data.userAgent ?? null,
    }
    return this.run(() => this.db.session.create({ data: input }))
  }

  findById(id: string): Promise<Session | null> {
    return this.run(() => this.db.session.findUnique({ where: { id } }))
  }

  /** Return the session only if it is active (not revoked, not expired). */
  async findActiveById(id: string, now: Date = new Date()): Promise<Session | null> {
    const session = await this.findById(id)
    if (!session) return null
    if (session.revokedAt) return null
    if (session.expires.getTime() <= now.getTime()) return null
    return session
  }

  listActiveByUser(userId: string, now: Date = new Date()): Promise<Session[]> {
    return this.run(() =>
      this.db.session.findMany({
        where: { userId, revokedAt: null, expires: { gt: now } },
        orderBy: { lastActiveAt: 'desc' },
      }),
    )
  }

  touch(id: string, when: Date = new Date()): Promise<Session> {
    return this.run(() =>
      this.db.session.update({ where: { id }, data: { lastActiveAt: when } }),
    )
  }

  /** Rotate the opaque token + extend expiry (session refresh / token rotation). */
  rotate(id: string, sessionToken: string, expires: Date): Promise<Session> {
    return this.run(() =>
      this.db.session.update({ where: { id }, data: { sessionToken, expires } }),
    )
  }

  revoke(id: string, when: Date = new Date()): Promise<Session> {
    return this.run(() =>
      this.db.session.update({ where: { id }, data: { revokedAt: when } }),
    )
  }

  /** Revoke every active session for a user (optionally keeping the current one). */
  async revokeAllForUser(
    userId: string,
    options: { exceptId?: string; when?: Date } = {},
  ): Promise<number> {
    const when = options.when ?? new Date()
    const result = await this.run(() =>
      this.db.session.updateMany({
        where: {
          userId,
          revokedAt: null,
          ...(options.exceptId ? { id: { not: options.exceptId } } : {}),
        },
        data: { revokedAt: when },
      }),
    )
    return result.count
  }

  /** Housekeeping: hard-delete expired rows. */
  async deleteExpired(now: Date = new Date()): Promise<number> {
    const result = await this.run(() =>
      this.db.session.deleteMany({ where: { expires: { lt: now } } }),
    )
    return result.count
  }
}

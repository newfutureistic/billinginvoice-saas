import { type VerificationToken } from '@prisma/client'
import { BaseRepository } from '@/server/repositories/base.repository'

/**
 * Verification-token repository — backs email verification codes and password-reset
 * tokens. The stored `token` is the **hash** of the value delivered to the user
 * (AUTH_FLOW.md §10); the `identifier` is namespaced by purpose
 * (`email-verify:<email>` / `password-reset:<email>`), so a single table serves both
 * flows without collision.
 */
export class VerificationTokenRepository extends BaseRepository {
  create(identifier: string, tokenHash: string, expires: Date): Promise<VerificationToken> {
    return this.run(() =>
      this.db.verificationToken.create({ data: { identifier, token: tokenHash, expires } }),
    )
  }

  /** Look up a token by hash and confirm it has not expired. */
  async findValid(
    identifier: string,
    tokenHash: string,
    now: Date = new Date(),
  ): Promise<VerificationToken | null> {
    const row = await this.run(() =>
      this.db.verificationToken.findUnique({
        where: { identifier_token: { identifier, token: tokenHash } },
      }),
    )
    if (!row) return null
    if (row.expires.getTime() <= now.getTime()) return null
    return row
  }

  /**
   * Look up a token by its (unique) hash alone — used by the password-reset flow, whose
   * link carries only the high-entropy token (not the email). Callers must then verify
   * the identifier prefix and expiry themselves.
   */
  findByToken(tokenHash: string): Promise<VerificationToken | null> {
    return this.run(() => this.db.verificationToken.findUnique({ where: { token: tokenHash } }))
  }

  /** Single-use consume: delete the exact row (no-op if already gone). */
  async consume(identifier: string, tokenHash: string): Promise<void> {
    await this.run(() =>
      this.db.verificationToken.deleteMany({ where: { identifier, token: tokenHash } }),
    )
  }

  /** Invalidate every outstanding token for an identifier (resend / password change). */
  async invalidateAll(identifier: string): Promise<number> {
    const result = await this.run(() =>
      this.db.verificationToken.deleteMany({ where: { identifier } }),
    )
    return result.count
  }

  /** Count outstanding (unexpired) tokens for an identifier — used for throttling. */
  countActive(identifier: string, now: Date = new Date()): Promise<number> {
    return this.run(() =>
      this.db.verificationToken.count({ where: { identifier, expires: { gt: now } } }),
    )
  }
}

import type { User } from '@prisma/client'
import { BaseService } from '@/server/services/base.service'
import { AuditService } from '@/server/services/audit.service'
import { UserRepository } from '@/server/repositories/user.repository'
import { VerificationTokenRepository } from '@/server/repositories/verification-token.repository'
import { MembershipRepository } from '@/server/repositories/membership.repository'
import { hashPassword, verifyPassword, needsRehash } from '@/server/auth/password'
import {
  TokenPurpose,
  tokenIdentifier,
  generateToken,
  generateNumericCode,
  hashToken,
  expiresInMinutes,
} from '@/server/auth/tokens'
import {
  defaultBruteForceGuard,
  bruteForceKey,
  type BruteForceGuard,
} from '@/server/auth/brute-force'
import {
  bootstrapPersonalWorkspace,
  type BootstrapResult,
} from '@/server/services/workspace-bootstrap'
import {
  signUpSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  resendVerificationSchema,
} from '@/lib/validation/auth.schema'
import { validationService } from '@/server/services/validation.service'
import { toUserDTO, type UserOutputDTO } from '@/lib/dto/user.dto'
import {
  BadRequestError,
  ConflictError,
  UnauthenticatedError,
} from '@/server/errors/app-error'
import { getAuthEnv, isProduction } from '@/server/config/env'
import type { RequestContext } from '@/server/http/context'

/** A verification code / reset link ready to be emailed. */
export interface DeliverMessage {
  to: string
  kind: 'verify' | 'reset'
  /** 6-digit code (verify) or opaque token (reset). */
  secret: string
}

/** Result of authenticating credentials (shape consumed by Auth.js `authorize`). */
export interface AuthenticatedIdentity {
  id: string
  email: string
  name: string | null
  image: string | null
  emailVerified: boolean
}

export interface SignupResult {
  user: UserOutputDTO
  /** The verification code — returned only outside production, for dev/testing. */
  devCode?: string
}

export interface VerifyResult {
  user: UserOutputDTO
  workspaceId: string | null
}

/** Injectable dependencies so the service is fully testable with in-memory fakes. */
export interface AuthServiceDeps {
  users?: UserRepository
  tokens?: VerificationTokenRepository
  memberships?: MembershipRepository
  audit?: AuditService
  bruteForce?: BruteForceGuard
  bootstrapWorkspace?: (userId: string, name: string) => Promise<BootstrapResult>
  deliver?: (msg: DeliverMessage) => Promise<void>
  /** Revoke a user's sessions on credential change. Injectable for offline testing. */
  revokeSessions?: (userId: string, exceptSid?: string) => Promise<void>
}

/**
 * Authentication service — the credentials brain behind the frozen auth pages.
 * Orchestrates the user, verification-token and membership repositories plus password
 * hashing, brute-force protection, workspace bootstrap and audit logging. Every method
 * that touches untrusted input re-validates with the shared Zod schemas (defence in
 * depth): the transport already validated, but services never trust the transport.
 */
export class AuthService extends BaseService {
  private readonly users: UserRepository
  private readonly tokens: VerificationTokenRepository
  private readonly memberships: MembershipRepository
  private readonly audit: AuditService
  private readonly bruteForce: BruteForceGuard
  private readonly bootstrapWorkspace: (userId: string, name: string) => Promise<BootstrapResult>
  private readonly deliver: (msg: DeliverMessage) => Promise<void>
  private readonly revokeSessions: (userId: string, exceptSid?: string) => Promise<void>

  constructor(ctx: RequestContext, deps: AuthServiceDeps = {}) {
    super(ctx)
    this.users = deps.users ?? new UserRepository()
    this.tokens = deps.tokens ?? new VerificationTokenRepository()
    this.memberships = deps.memberships ?? new MembershipRepository()
    this.audit = deps.audit ?? new AuditService(ctx)
    this.bruteForce = deps.bruteForce ?? defaultBruteForceGuard
    this.bootstrapWorkspace =
      deps.bootstrapWorkspace ?? ((userId, name) => bootstrapPersonalWorkspace(ctx, userId, name))
    this.deliver = deps.deliver ?? ((msg) => this.defaultDeliver(msg))
    this.revokeSessions = deps.revokeSessions ?? ((userId, exceptSid) => this.defaultRevokeSessions(userId, exceptSid))
  }

  // --- Sign up + email verification ----------------------------------------

  async signup(raw: unknown): Promise<SignupResult> {
    const input = validationService.validate(signUpSchema, raw)

    if (await this.users.emailExists(input.email)) {
      // Same message shape as success is not required here: the sign-up form owns this.
      throw new ConflictError('An account with this email already exists')
    }

    const passwordHash = await hashPassword(input.password)
    const user = await this.users.create({
      email: input.email,
      name: input.name,
      passwordHash,
      emailVerified: null,
    })

    const code = await this.issueVerificationCode(user.email)
    await this.audit.record({
      action: 'auth.signup',
      targetType: 'User',
      targetId: user.id,
      actorId: user.id,
      after: { email: user.email, name: user.name },
    })
    this.logger.info('auth.signup', { userId: user.id })

    return { user: toUserDTO(user), devCode: isProduction() ? undefined : code }
  }

  /** Create + deliver a fresh 6-digit verification code, invalidating any previous. */
  private async issueVerificationCode(email: string): Promise<string> {
    const identifier = tokenIdentifier(TokenPurpose.EMAIL_VERIFY, email)
    await this.tokens.invalidateAll(identifier)
    const code = generateNumericCode(6)
    await this.tokens.create(
      identifier,
      hashToken(code),
      expiresInMinutes(getAuthEnv().VERIFY_TOKEN_TTL_MIN),
    )
    await this.deliver({ to: email, kind: 'verify', secret: code })
    return code
  }

  async resendVerification(raw: unknown): Promise<{ devCode?: string }> {
    const input = validationService.validate(resendVerificationSchema, raw)
    const user = await this.users.findByEmail(input.email)
    // No account enumeration: always report success.
    if (!user || user.emailVerified) return {}
    const code = await this.issueVerificationCode(user.email)
    return { devCode: isProduction() ? undefined : code }
  }

  async verifyEmail(raw: unknown): Promise<VerifyResult> {
    const input = validationService.validate(verifyEmailSchema, raw)
    const identifier = tokenIdentifier(TokenPurpose.EMAIL_VERIFY, input.email)
    const record = await this.tokens.findValid(identifier, hashToken(input.code))
    if (!record) throw new BadRequestError('Invalid or expired verification code')

    const user = await this.users.findByEmail(input.email)
    if (!user) throw new BadRequestError('Invalid or expired verification code')

    await this.tokens.consume(identifier, record.token)
    const verified = user.emailVerified
      ? user
      : await this.users.markEmailVerified(user.id)

    // Give brand-new users their first workspace (idempotent: only when none exists).
    let workspaceId: string | null = null
    const existing = await this.memberships.listByUser(user.id)
    if (existing.length === 0) {
      const result = await this.bootstrapWorkspace(user.id, user.name ?? user.email)
      workspaceId = result.workspaceId
    } else {
      workspaceId = existing[0].workspaceId
    }

    await this.audit.record({
      action: 'auth.email.verified',
      targetType: 'User',
      targetId: user.id,
      actorId: user.id,
      workspaceId: workspaceId ?? undefined,
    })
    this.logger.info('auth.email.verified', { userId: user.id, workspaceId })

    return { user: toUserDTO(verified), workspaceId }
  }

  // --- Forgot / reset password ---------------------------------------------

  async forgotPassword(raw: unknown): Promise<{ devToken?: string }> {
    const input = validationService.validate(forgotPasswordSchema, raw)
    const user = await this.users.findByEmail(input.email)
    // Always succeed — never reveal whether the account exists (AUTH_FLOW.md §5).
    if (!user) return {}

    const identifier = tokenIdentifier(TokenPurpose.PASSWORD_RESET, user.email)
    await this.tokens.invalidateAll(identifier)
    const token = generateToken()
    await this.tokens.create(
      identifier,
      hashToken(token),
      expiresInMinutes(getAuthEnv().RESET_TOKEN_TTL_MIN),
    )
    await this.deliver({ to: user.email, kind: 'reset', secret: token })
    this.logger.info('auth.password.reset_requested', { userId: user.id })
    return { devToken: isProduction() ? undefined : token }
  }

  async resetPassword(raw: unknown): Promise<{ ok: true }> {
    const input = validationService.validate(resetPasswordSchema, raw)
    const record = await this.tokens.findByToken(hashToken(input.token))
    if (
      !record ||
      !record.identifier.startsWith(`${TokenPurpose.PASSWORD_RESET}:`) ||
      record.expires.getTime() <= Date.now()
    ) {
      throw new BadRequestError('Invalid or expired reset token')
    }

    const email = record.identifier.slice(TokenPurpose.PASSWORD_RESET.length + 1)
    const user = await this.users.findByEmail(email)
    if (!user) throw new BadRequestError('Invalid or expired reset token')

    await this.users.setPasswordHash(user.id, await hashPassword(input.password))
    await this.tokens.consume(record.identifier, record.token)
    // Force re-login everywhere after a credential change (AUTH_FLOW.md §5).
    await this.revokeSessions(user.id)

    await this.audit.record({
      action: 'auth.password.reset',
      targetType: 'User',
      targetId: user.id,
      actorId: user.id,
    })
    this.logger.info('auth.password.reset', { userId: user.id })
    return { ok: true }
  }

  async changePassword(userId: string, raw: unknown): Promise<{ ok: true }> {
    const input = validationService.validate(changePasswordSchema, raw)
    const user = await this.users.requireById(userId)
    if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
      throw new UnauthenticatedError('Current password is incorrect')
    }
    await this.users.setPasswordHash(user.id, await hashPassword(input.newPassword))
    await this.revokeSessions(user.id, this.ctx.sessionId)

    await this.audit.record({
      action: 'auth.password.changed',
      targetType: 'User',
      targetId: user.id,
      actorId: user.id,
    })
    this.logger.info('auth.password.changed', { userId: user.id })
    return { ok: true }
  }

  // --- Credentials authentication (Auth.js `authorize`) --------------------

  /**
   * Verify email + password with brute-force protection and audit. Returns the identity
   * for a valid credential, or `null` for any failure (no user enumeration). Throws only
   * when the account is temporarily locked out.
   */
  async authenticate(email: string, password: string): Promise<AuthenticatedIdentity | null> {
    const key = bruteForceKey(email, this.ctx.ip)
    const status = this.bruteForce.status(key)
    if (status.locked) {
      this.logger.warn('auth.login.locked', { email, retryAfterSeconds: status.retryAfterSeconds })
      throw new UnauthenticatedError(
        `Too many failed attempts. Try again in ${status.retryAfterSeconds ?? 0}s.`,
      )
    }

    const user = await this.users.findByEmail(email)
    const ok = user ? await verifyPassword(password, user.passwordHash) : false
    if (!user || !ok) {
      this.bruteForce.recordFailure(key)
      await this.audit.record({
        action: 'auth.login.failed',
        targetType: 'User',
        targetId: user?.id ?? 'unknown',
        actorId: user?.id ?? null,
      })
      this.logger.warn('auth.login.failed', { email })
      return null
    }

    this.bruteForce.reset(key)
    // Transparently upgrade a weak hash on successful login.
    if (needsRehash(user.passwordHash ?? '')) {
      await this.users.setPasswordHash(user.id, await hashPassword(password)).catch(() => undefined)
    }
    await this.audit.record({
      action: 'auth.login',
      targetType: 'User',
      targetId: user.id,
      actorId: user.id,
    })
    this.logger.info('auth.login', { userId: user.id })
    return this.toIdentity(user)
  }

  private toIdentity(user: User): AuthenticatedIdentity {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified !== null,
    }
  }

  // --- helpers -------------------------------------------------------------

  /** Lazily import the session service to avoid a circular module dependency. */
  private async defaultRevokeSessions(userId: string, exceptSid?: string): Promise<void> {
    const { SessionService } = await import('@/server/services/session.service')
    await new SessionService(this.ctx).revokeAll(userId, exceptSid)
  }

  private async defaultDeliver(msg: DeliverMessage): Promise<void> {
    // Structural log (secret never logged in production) …
    this.logger.info('auth.deliver', {
      to: msg.to,
      kind: msg.kind,
      ...(isProduction() ? {} : { secret: msg.secret }),
    })
    // … then dispatch via the Mission 7 email service (Resend when configured, else
    // logged). Lazily imported to avoid a circular dependency; never throws.
    try {
      const { EmailService } = await import('@/server/services/email.service')
      const email = new EmailService()
      if (msg.kind === 'verify') await email.sendVerification(msg.to, msg.secret)
      else await email.sendPasswordReset(msg.to, msg.secret)
    } catch (err) {
      this.logger.error('auth.deliver.email_failed', {
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
}

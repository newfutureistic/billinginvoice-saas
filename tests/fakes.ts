/**
 * In-memory repository fakes for offline integration tests.
 *
 * Each fake implements the exact public surface the services call and is injected via
 * the services' `deps` seams (cast to the concrete repo type). No Prisma, no database —
 * the service logic (validation, RBAC, guardrails, token flows) is exercised end to end.
 */
import type {
  Membership,
  MemberStatus,
  Role,
  User,
  VerificationToken,
  Invitation,
  InviteStatus,
} from '@prisma/client'
import type { UserRepository, UserCreateData } from '@/server/repositories/user.repository'
import type { VerificationTokenRepository } from '@/server/repositories/verification-token.repository'
import type {
  MembershipRepository,
  MembershipCreateData,
  MembershipWithWorkspace,
} from '@/server/repositories/membership.repository'
import type {
  InvitationRepository,
  InvitationCreateData,
} from '@/server/repositories/invitation.repository'
import { createSystemContext, type RequestContext } from '@/server/http/context'
import type { AuditService } from '@/server/services/audit.service'

let seq = 0
const id = (p: string) => `${p}_${(++seq).toString(36).padStart(6, '0')}`
const lower = (s: string) => s.trim().toLowerCase()

export class FakeUserRepo {
  readonly rows: User[] = []

  private make(data: UserCreateData): User {
    const now = new Date()
    return {
      id: id('user'),
      name: data.name ?? null,
      email: lower(data.email),
      emailVerified: data.emailVerified ?? null,
      passwordHash: data.passwordHash ?? null,
      image: data.image ?? null,
      timezone: data.timezone ?? 'UTC',
      createdAt: now,
      updatedAt: now,
    }
  }

  async findById(idv: string) {
    return this.rows.find((u) => u.id === idv) ?? null
  }
  async findByEmail(email: string) {
    return this.rows.find((u) => u.email === lower(email)) ?? null
  }
  async requireById(idv: string) {
    const u = await this.findById(idv)
    if (!u) throw new Error('user not found')
    return u
  }
  async create(data: UserCreateData) {
    const u = this.make(data)
    this.rows.push(u)
    return u
  }
  async setPasswordHash(idv: string, passwordHash: string) {
    const u = await this.requireById(idv)
    u.passwordHash = passwordHash
    u.updatedAt = new Date()
    return u
  }
  async markEmailVerified(idv: string, when: Date = new Date()) {
    const u = await this.requireById(idv)
    u.emailVerified = when
    return u
  }
  async emailExists(email: string) {
    return (await this.findByEmail(email)) !== null
  }
  asRepo(): UserRepository {
    return this as unknown as UserRepository
  }
}

export class FakeTokenRepo {
  readonly rows: VerificationToken[] = []

  async create(identifier: string, tokenHash: string, expires: Date) {
    const row = { identifier, token: tokenHash, expires }
    this.rows.push(row)
    return row
  }
  async findValid(identifier: string, tokenHash: string, now = new Date()) {
    const row = this.rows.find((r) => r.identifier === identifier && r.token === tokenHash)
    if (!row || row.expires.getTime() <= now.getTime()) return null
    return row
  }
  async findByToken(tokenHash: string) {
    return this.rows.find((r) => r.token === tokenHash) ?? null
  }
  async consume(identifier: string, tokenHash: string) {
    const i = this.rows.findIndex((r) => r.identifier === identifier && r.token === tokenHash)
    if (i >= 0) this.rows.splice(i, 1)
  }
  async invalidateAll(identifier: string) {
    let n = 0
    for (let i = this.rows.length - 1; i >= 0; i--) {
      if (this.rows[i].identifier === identifier) {
        this.rows.splice(i, 1)
        n++
      }
    }
    return n
  }
  async countActive(identifier: string, now = new Date()) {
    return this.rows.filter((r) => r.identifier === identifier && r.expires > now).length
  }
  asRepo(): VerificationTokenRepository {
    return this as unknown as VerificationTokenRepository
  }
}

export class FakeMembershipRepo {
  readonly rows: Membership[] = []
  readonly workspaces = new Map<string, { id: string; name: string; slug: string }>()

  seedWorkspace(wsId: string, name = 'WS', slug = wsId) {
    this.workspaces.set(wsId, { id: wsId, name, slug })
  }

  async find(userId: string, workspaceId: string) {
    return this.rows.find((m) => m.userId === userId && m.workspaceId === workspaceId) ?? null
  }
  async require(userId: string, workspaceId: string) {
    const m = await this.find(userId, workspaceId)
    if (!m) throw new Error('membership not found')
    return m
  }
  async findById(idv: string) {
    return this.rows.find((m) => m.id === idv) ?? null
  }
  async create(data: MembershipCreateData) {
    const m: Membership = {
      id: id('mem'),
      userId: data.userId,
      workspaceId: data.workspaceId,
      role: (data.role ?? 'MEMBER') as Role,
      status: (data.status ?? 'ACTIVE') as MemberStatus,
      joinedAt: new Date(),
    }
    this.rows.push(m)
    return m
  }
  async listByWorkspace(workspaceId: string) {
    return this.rows.filter((m) => m.workspaceId === workspaceId)
  }
  async listByUser(userId: string): Promise<MembershipWithWorkspace[]> {
    return this.rows
      .filter((m) => m.userId === userId && m.status === 'ACTIVE')
      .map((m) => ({
        ...m,
        workspace: {
          id: m.workspaceId,
          name: this.workspaces.get(m.workspaceId)?.name ?? 'WS',
          slug: this.workspaces.get(m.workspaceId)?.slug ?? m.workspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      })) as unknown as MembershipWithWorkspace[]
  }
  async updateRole(idv: string, role: Role) {
    const m = this.rows.find((r) => r.id === idv)
    if (!m) throw new Error('not found')
    m.role = role
    return m
  }
  async updateStatus(idv: string, status: MemberStatus) {
    const m = this.rows.find((r) => r.id === idv)
    if (!m) throw new Error('not found')
    m.status = status
    return m
  }
  async remove(idv: string) {
    const i = this.rows.findIndex((r) => r.id === idv)
    const [m] = this.rows.splice(i, 1)
    return m
  }
  async countByRole(workspaceId: string, role: Role) {
    return this.rows.filter((m) => m.workspaceId === workspaceId && m.role === role).length
  }
  async listOwners(workspaceId: string) {
    return this.rows.filter((m) => m.workspaceId === workspaceId && m.role === 'OWNER')
  }
  asRepo(): MembershipRepository {
    return this as unknown as MembershipRepository
  }
}

export class FakeInvitationRepo {
  readonly rows: Invitation[] = []

  async create(data: InvitationCreateData) {
    const inv: Invitation = {
      id: id('inv'),
      workspaceId: data.workspaceId,
      email: lower(data.email),
      role: data.role,
      token: data.tokenHash,
      status: 'PENDING',
      invitedById: data.invitedById ?? null,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    }
    this.rows.push(inv)
    return inv
  }
  async findByTokenHash(tokenHash: string) {
    return this.rows.find((r) => r.token === tokenHash) ?? null
  }
  async findValid(tokenHash: string, now = new Date()) {
    const r = await this.findByTokenHash(tokenHash)
    if (!r || r.status !== 'PENDING' || r.expiresAt.getTime() <= now.getTime()) return null
    return r
  }
  async findPendingForEmail(workspaceId: string, email: string, now = new Date()) {
    return (
      this.rows.find(
        (r) =>
          r.workspaceId === workspaceId &&
          r.email === lower(email) &&
          r.status === 'PENDING' &&
          r.expiresAt > now,
      ) ?? null
    )
  }
  async listByWorkspace(workspaceId: string, status?: InviteStatus) {
    return this.rows.filter((r) => r.workspaceId === workspaceId && (!status || r.status === status))
  }
  async setStatus(idv: string, status: InviteStatus) {
    const r = this.rows.find((x) => x.id === idv)
    if (!r) throw new Error('not found')
    r.status = status
    return r
  }
  asRepo(): InvitationRepository {
    return this as unknown as InvitationRepository
  }
}

/** A no-op audit service that records nothing but satisfies the injected type. */
export function fakeAudit(): AuditService {
  return { record: async () => undefined } as unknown as AuditService
}

/** A test context with optional authenticated principal / workspace role. */
export function testContext(
  overrides: Partial<Pick<RequestContext, 'user' | 'role' | 'workspaceId' | 'sessionId' | 'ip'>> = {},
): RequestContext {
  const ctx = createSystemContext('test')
  Object.assign(ctx, overrides)
  return ctx
}

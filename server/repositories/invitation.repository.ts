import { Prisma, type Invitation, type InviteStatus, type Role } from '@prisma/client'
import { BaseRepository } from '@/server/repositories/base.repository'

export interface InvitationCreateData {
  workspaceId: string
  email: string
  role: Role
  /** Hash of the raw invite token carried in the email link. */
  tokenHash: string
  invitedById?: string | null
  expiresAt: Date
}

/**
 * Invitation repository (RBAC.md §6). The stored `token` is the hash of the raw token
 * placed in the invite link; acceptance re-hashes the incoming token to look it up, so a
 * database leak never yields a usable invitation.
 */
export class InvitationRepository extends BaseRepository {
  create(data: InvitationCreateData): Promise<Invitation> {
    const input: Prisma.InvitationUncheckedCreateInput = {
      workspaceId: data.workspaceId,
      email: data.email.trim().toLowerCase(),
      role: data.role,
      token: data.tokenHash,
      invitedById: data.invitedById ?? null,
      expiresAt: data.expiresAt,
    }
    return this.run(() => this.db.invitation.create({ data: input }))
  }

  findByTokenHash(tokenHash: string): Promise<Invitation | null> {
    return this.run(() => this.db.invitation.findUnique({ where: { token: tokenHash } }))
  }

  /** A pending, unexpired invitation for the given token hash. */
  async findValid(tokenHash: string, now: Date = new Date()): Promise<Invitation | null> {
    const invite = await this.findByTokenHash(tokenHash)
    if (!invite) return null
    if (invite.status !== 'PENDING') return null
    if (invite.expiresAt.getTime() <= now.getTime()) return null
    return invite
  }

  /** Any outstanding (pending, unexpired) invite for this email in a workspace. */
  findPendingForEmail(
    workspaceId: string,
    email: string,
    now: Date = new Date(),
  ): Promise<Invitation | null> {
    return this.run(() =>
      this.db.invitation.findFirst({
        where: {
          workspaceId,
          email: email.trim().toLowerCase(),
          status: 'PENDING',
          expiresAt: { gt: now },
        },
      }),
    )
  }

  listByWorkspace(workspaceId: string, status?: InviteStatus): Promise<Invitation[]> {
    return this.run(() =>
      this.db.invitation.findMany({
        where: { workspaceId, ...(status ? { status } : {}) },
        orderBy: { createdAt: 'desc' },
      }),
    )
  }

  setStatus(id: string, status: InviteStatus): Promise<Invitation> {
    return this.run(() => this.db.invitation.update({ where: { id }, data: { status } }))
  }
}

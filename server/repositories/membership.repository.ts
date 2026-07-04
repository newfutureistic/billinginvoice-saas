import { Prisma, type Membership, type MemberStatus, type Role } from '@prisma/client'
import { BaseRepository } from '@/server/repositories/base.repository'
import { NotFoundError } from '@/server/db/errors'

export type MembershipWithUser = Prisma.MembershipGetPayload<{ include: { user: true } }>
export type MembershipWithWorkspace = Prisma.MembershipGetPayload<{ include: { workspace: true } }>

export interface MembershipCreateData {
  userId: string
  workspaceId: string
  role?: Role
  status?: MemberStatus
}

/**
 * Membership repository — the join between {@link User} and {@link Workspace} that
 * carries the per-workspace {@link Role} (RBAC.md §2). Because a membership is queried
 * both by workspace (member lists) and by user (workspace switcher), this extends
 * {@link BaseRepository} and takes explicit ids rather than the single-tenant base.
 */
export class MembershipRepository extends BaseRepository {
  find(userId: string, workspaceId: string): Promise<Membership | null> {
    return this.run(() =>
      this.db.membership.findUnique({ where: { userId_workspaceId: { userId, workspaceId } } }),
    )
  }

  async require(userId: string, workspaceId: string): Promise<Membership> {
    const membership = await this.find(userId, workspaceId)
    if (!membership) throw new NotFoundError('Membership', { userId, workspaceId })
    return membership
  }

  findById(id: string): Promise<Membership | null> {
    return this.run(() => this.db.membership.findUnique({ where: { id } }))
  }

  create(data: MembershipCreateData): Promise<Membership> {
    const input: Prisma.MembershipUncheckedCreateInput = {
      userId: data.userId,
      workspaceId: data.workspaceId,
      ...(data.role ? { role: data.role } : {}),
      ...(data.status ? { status: data.status } : {}),
    }
    return this.run(() => this.db.membership.create({ data: input }))
  }

  /** All memberships in a workspace, with the user joined (team page). */
  listByWorkspace(workspaceId: string): Promise<MembershipWithUser[]> {
    return this.run(() =>
      this.db.membership.findMany({
        where: { workspaceId },
        include: { user: true },
        orderBy: { joinedAt: 'asc' },
      }),
    )
  }

  /** All active memberships for a user, with the workspace joined (switcher). */
  listByUser(userId: string): Promise<MembershipWithWorkspace[]> {
    return this.run(() =>
      this.db.membership.findMany({
        where: { userId, status: 'ACTIVE', workspace: { deletedAt: null } },
        include: { workspace: true },
        orderBy: { joinedAt: 'asc' },
      }),
    )
  }

  updateRole(id: string, role: Role): Promise<Membership> {
    return this.run(() => this.db.membership.update({ where: { id }, data: { role } }))
  }

  updateStatus(id: string, status: MemberStatus): Promise<Membership> {
    return this.run(() => this.db.membership.update({ where: { id }, data: { status } }))
  }

  remove(id: string): Promise<Membership> {
    return this.run(() => this.db.membership.delete({ where: { id } }))
  }

  countByRole(workspaceId: string, role: Role): Promise<number> {
    return this.run(() => this.db.membership.count({ where: { workspaceId, role } }))
  }

  /** Active owners of a workspace — used for last-owner protection. */
  listOwners(workspaceId: string): Promise<Membership[]> {
    return this.run(() =>
      this.db.membership.findMany({ where: { workspaceId, role: 'OWNER' } }),
    )
  }
}

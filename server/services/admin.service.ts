import { BaseService } from '@/server/services/base.service'
import { AuditService } from '@/server/services/audit.service'
import { UserRepository } from '@/server/repositories/user.repository'
import { MembershipRepository } from '@/server/repositories/membership.repository'
import { BusinessError, NotFoundError } from '@/server/errors/app-error'
import { runInTransaction } from '@/server/db/transaction'
import type { RequestContext } from '@/server/http/context'

/**
 * Site-admin actions that cut across workspaces (RBAC.md's per-workspace `Role` doesn't
 * cover these — see `server/auth/site-admin.ts`). Callers must run {@link assertSiteAdmin}
 * before invoking anything here; this service does not re-check the allowlist itself.
 */
export class AdminService extends BaseService {
  private readonly users: UserRepository
  private readonly memberships: MembershipRepository
  private readonly audit: AuditService

  constructor(ctx: RequestContext) {
    super(ctx)
    this.users = new UserRepository()
    this.memberships = new MembershipRepository()
    this.audit = new AuditService(ctx)
  }

  /**
   * Delete a platform user.
   *
   * A user can be the sole OWNER of a workspace other members depend on — deleting them
   * outright would cascade their `Membership` rows away and leave that workspace with no
   * OWNER at all (nobody could manage billing, delete it, or promote a new owner). So:
   *  - any workspace where the target is OWNER *and* other active members exist blocks the
   *    whole deletion (ownership must be transferred there first, same as leaving/removal);
   *  - any workspace they solely own (no other active members) is deleted along with them,
   *    cascading its documents/clients/etc — there is no one left to use it anyway.
   */
  async deleteUser(targetUserId: string): Promise<void> {
    const actorId = this.ctx.user?.id
    if (targetUserId === actorId) {
      throw new BusinessError('You cannot delete your own account from here')
    }

    const target = await this.users.findById(targetUserId)
    if (!target) throw new NotFoundError('User', { id: targetUserId })

    const owned = (await this.memberships.listByUser(targetUserId)).filter((m) => m.role === 'OWNER')
    const soloWorkspaceIds: string[] = []
    for (const m of owned) {
      const others = await this.memberships.countOtherActive(m.workspaceId, targetUserId)
      if (others > 0) {
        throw new BusinessError(
          `This user owns "${m.workspace.name}", which has other members. Transfer ownership there before deleting this account.`,
        )
      }
      soloWorkspaceIds.push(m.workspaceId)
    }

    await runInTransaction(async (tx) => {
      if (soloWorkspaceIds.length > 0) {
        await tx.workspace.deleteMany({ where: { id: { in: soloWorkspaceIds } } })
      }
      await tx.user.delete({ where: { id: targetUserId } })
    })

    await this.audit.record({
      action: 'admin.user.deleted',
      targetType: 'User',
      targetId: targetUserId,
      before: { email: target.email, deletedWorkspaceIds: soloWorkspaceIds },
    })
    this.logger.info('admin.user.deleted', { userId: targetUserId, deletedWorkspaces: soloWorkspaceIds.length })
  }
}

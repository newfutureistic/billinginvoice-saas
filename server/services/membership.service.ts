import type { Membership, Role } from '@prisma/client'
import { BaseService } from '@/server/services/base.service'
import { AuditService } from '@/server/services/audit.service'
import { MembershipRepository } from '@/server/repositories/membership.repository'
import { InvitationRepository } from '@/server/repositories/invitation.repository'
import { UserRepository } from '@/server/repositories/user.repository'
import {
  requirePermission,
  canManageRole,
  canAssignRole,
} from '@/server/auth/rbac'
import { generateToken, hashToken, expiresInDays } from '@/server/auth/tokens'
import {
  inviteMemberSchema,
  acceptInviteSchema,
  changeRoleSchema,
  transferOwnershipSchema,
} from '@/lib/validation/auth.schema'
import { validationService } from '@/server/services/validation.service'
import {
  AuthorizationError,
  BadRequestError,
  BusinessError,
  ConflictError,
} from '@/server/errors/app-error'
import { getAuthEnv } from '@/server/config/env'
import { runInTransaction } from '@/server/db/transaction'
import type { RequestContext } from '@/server/http/context'

export interface DeliverInvite {
  to: string
  workspaceId: string
  role: Role
  token: string
}

export interface MembershipServiceDeps {
  memberships?: MembershipRepository
  invitations?: InvitationRepository
  users?: UserRepository
  audit?: AuditService
  deliver?: (invite: DeliverInvite) => Promise<void>
  /** The atomic ownership swap (transaction). Injectable for offline testing. */
  transferExecutor?: (currentMembershipId: string, targetMembershipId: string) => Promise<void>
}

interface Actor {
  userId: string
  role: Role
  workspaceId: string
}

/**
 * Workspace membership lifecycle (RBAC.md §6). Every mutation enforces the RBAC matrix
 * plus the structural guardrails: no privilege escalation (you can only assign roles at
 * or below your own and only manage members strictly junior to you), no self-role
 * changes, and last-owner protection (the sole OWNER cannot be demoted or removed —
 * ownership must be transferred first, atomically).
 */
export class MembershipService extends BaseService {
  private readonly memberships: MembershipRepository
  private readonly invitations: InvitationRepository
  private readonly users: UserRepository
  private readonly audit: AuditService
  private readonly deliver: (invite: DeliverInvite) => Promise<void>
  private readonly transferExecutor: (currentMembershipId: string, targetMembershipId: string) => Promise<void>

  constructor(ctx: RequestContext, deps: MembershipServiceDeps = {}) {
    super(ctx)
    this.memberships = deps.memberships ?? new MembershipRepository()
    this.invitations = deps.invitations ?? new InvitationRepository()
    this.users = deps.users ?? new UserRepository()
    this.audit = deps.audit ?? new AuditService(ctx)
    this.deliver = deps.deliver ?? ((invite) => this.defaultDeliver(invite))
    this.transferExecutor = deps.transferExecutor ?? ((curId, tgtId) => this.defaultTransfer(curId, tgtId))
  }

  /** The acting principal, from context (populated by the membership middleware). */
  private actor(): Actor {
    const { user, role, workspaceId } = this.ctx
    if (!user || !role || !workspaceId) {
      throw new AuthorizationError('Workspace membership context is required')
    }
    return { userId: user.id, role, workspaceId }
  }

  // --- Invitations ---------------------------------------------------------

  async invite(raw: unknown): Promise<{ invitationId: string; devToken?: string }> {
    const actor = this.actor()
    const input = validationService.validate(inviteMemberSchema, raw)

    requirePermission(actor.role, 'member:invite')
    if (!canAssignRole(actor.role, input.role)) {
      throw new AuthorizationError(`You cannot invite a member with the ${input.role} role`)
    }

    // Already a member?
    const existingUser = await this.users.findByEmail(input.email)
    if (existingUser && (await this.memberships.find(existingUser.id, actor.workspaceId))) {
      throw new ConflictError('That person is already a member of this workspace')
    }
    if (await this.invitations.findPendingForEmail(actor.workspaceId, input.email)) {
      throw new ConflictError('An invitation is already pending for this email')
    }

    const token = generateToken()
    const invitation = await this.invitations.create({
      workspaceId: actor.workspaceId,
      email: input.email,
      role: input.role,
      tokenHash: hashToken(token),
      invitedById: actor.userId,
      expiresAt: expiresInDays(getAuthEnv().INVITE_TTL_DAYS),
    })
    await this.deliver({
      to: input.email,
      workspaceId: actor.workspaceId,
      role: input.role,
      token,
    })
    await this.audit.record({
      action: 'member.invited',
      targetType: 'Invitation',
      targetId: invitation.id,
      after: { email: input.email, role: input.role },
    })
    this.logger.info('member.invited', { invitationId: invitation.id, role: input.role })
    return {
      invitationId: invitation.id,
      devToken: process.env.NODE_ENV === 'production' ? undefined : token,
    }
  }

  /** Accept an invitation as the currently-authenticated user. */
  async acceptInvite(userId: string, raw: unknown): Promise<Membership> {
    const input = validationService.validate(acceptInviteSchema, raw)
    const invite = await this.invitations.findValid(hashToken(input.token))
    if (!invite) throw new BadRequestError('This invitation is invalid or has expired')

    const user = await this.users.requireById(userId)
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      throw new AuthorizationError('This invitation was issued to a different email address')
    }
    if (await this.memberships.find(userId, invite.workspaceId)) {
      await this.invitations.setStatus(invite.id, 'ACCEPTED')
      throw new ConflictError('You are already a member of this workspace')
    }

    const membership = await this.memberships.create({
      userId,
      workspaceId: invite.workspaceId,
      role: invite.role,
      status: 'ACTIVE',
    })
    await this.invitations.setStatus(invite.id, 'ACCEPTED')
    await this.audit.record({
      action: 'member.joined',
      targetType: 'Membership',
      targetId: membership.id,
      actorId: userId,
      workspaceId: invite.workspaceId,
      after: { role: invite.role },
    })
    this.logger.info('member.joined', { membershipId: membership.id })
    return membership
  }

  // --- Role / removal ------------------------------------------------------

  async changeRole(targetUserId: string, raw: unknown): Promise<Membership> {
    const actor = this.actor()
    const input = validationService.validate(changeRoleSchema, raw)
    requirePermission(actor.role, 'member:update')

    if (targetUserId === actor.userId) {
      throw new BusinessError('You cannot change your own role')
    }
    const target = await this.memberships.require(targetUserId, actor.workspaceId)
    if (!canManageRole(actor.role, target.role)) {
      throw new AuthorizationError('You cannot manage a member at or above your own level')
    }
    if (!canAssignRole(actor.role, input.role)) {
      throw new AuthorizationError(`You cannot assign the ${input.role} role`)
    }
    await this.assertNotLastOwner(target, 'demote')

    const updated = await this.memberships.updateRole(target.id, input.role)
    await this.audit.record({
      action: 'member.role.changed',
      targetType: 'Membership',
      targetId: target.id,
      before: { role: target.role },
      after: { role: input.role },
    })
    this.logger.info('member.role.changed', { membershipId: target.id, role: input.role })
    return updated
  }

  async removeMember(targetUserId: string): Promise<void> {
    const actor = this.actor()
    requirePermission(actor.role, 'member:remove')

    if (targetUserId === actor.userId) {
      throw new BusinessError('Use "leave workspace" to remove yourself')
    }
    const target = await this.memberships.require(targetUserId, actor.workspaceId)
    if (!canManageRole(actor.role, target.role)) {
      throw new AuthorizationError('You cannot remove a member at or above your own level')
    }
    await this.assertNotLastOwner(target, 'remove')

    await this.memberships.remove(target.id)
    await this.audit.record({
      action: 'member.removed',
      targetType: 'Membership',
      targetId: target.id,
      before: { userId: targetUserId, role: target.role },
    })
    this.logger.info('member.removed', { membershipId: target.id })
  }

  /**
   * Transfer ownership atomically: promote the target to OWNER and demote the current
   * OWNER to ADMIN in one transaction (RBAC.md §6). Only the current OWNER may do this.
   */
  async transferOwnership(raw: unknown): Promise<void> {
    const actor = this.actor()
    if (actor.role !== 'OWNER') {
      throw new AuthorizationError('Only the workspace owner can transfer ownership')
    }
    const input = validationService.validate(transferOwnershipSchema, raw)
    if (input.userId === actor.userId) {
      throw new BusinessError('You already own this workspace')
    }

    const current = await this.memberships.require(actor.userId, actor.workspaceId)
    const target = await this.memberships.require(input.userId, actor.workspaceId)
    if (target.status !== 'ACTIVE') {
      throw new BusinessError('Ownership can only be transferred to an active member')
    }

    await this.transferExecutor(current.id, target.id)
    await this.audit.record({
      action: 'workspace.ownership.transferred',
      targetType: 'Workspace',
      targetId: actor.workspaceId,
      before: { owner: actor.userId },
      after: { owner: input.userId },
    })
    this.logger.info('workspace.ownership.transferred', {
      from: actor.userId,
      to: input.userId,
    })
  }

  // --- guards --------------------------------------------------------------

  /** Block demoting/removing the sole OWNER — ownership must be transferred first. */
  private async assertNotLastOwner(target: Membership, action: 'demote' | 'remove'): Promise<void> {
    if (target.role !== 'OWNER') return
    const owners = await this.memberships.countByRole(target.workspaceId, 'OWNER')
    if (owners <= 1) {
      throw new BusinessError(
        `Cannot ${action} the only owner. Transfer ownership to another member first.`,
      )
    }
  }

  /** Production ownership swap: promote target to OWNER, demote current to ADMIN, atomically. */
  private async defaultTransfer(currentMembershipId: string, targetMembershipId: string): Promise<void> {
    await runInTransaction(async (tx) => {
      const repo = new MembershipRepository(tx)
      await repo.updateRole(targetMembershipId, 'OWNER')
      await repo.updateRole(currentMembershipId, 'ADMIN')
    })
  }

  private async defaultDeliver(invite: DeliverInvite): Promise<void> {
    this.logger.info('member.invite.deliver', {
      to: invite.to,
      role: invite.role,
      ...(process.env.NODE_ENV === 'production' ? {} : { token: invite.token }),
    })
    try {
      const { EmailService } = await import('@/server/services/email.service')
      await new EmailService().sendInvite(
        invite.to,
        invite.token,
        this.ctx.workspace?.name ?? '',
        invite.role,
        invite.workspaceId,
      )
    } catch (err) {
      this.logger.error('member.invite.email_failed', {
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
}

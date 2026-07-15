import { Prisma } from '@prisma/client'
import { BaseService } from '@/server/services/base.service'
import { AuditService } from '@/server/services/audit.service'
import { ActivityService } from '@/server/services/activity.service'
import { WorkspaceRepository } from '@/server/repositories/workspace.repository'
import { MembershipRepository } from '@/server/repositories/membership.repository'
import { bootstrapPersonalWorkspace } from '@/server/services/workspace-bootstrap'
import { runInTransaction } from '@/server/db/transaction'
import { parseWith } from '@/server/http/middleware/validation'
import {
  workspaceCreateSchema,
  workspaceUpdateSchema,
  organizationSettingsSchema,
} from '@/lib/validation/workspace.schema'
import {
  toWorkspaceDTO,
  toOrganizationDTO,
  type WorkspaceOutputDTO,
  type OrganizationOutputDTO,
} from '@/lib/dto/workspace.dto'
import {
  ConflictError,
  NotFoundError,
  UnauthenticatedError,
} from '@/server/errors/app-error'
import type { RequestContext } from '@/server/http/context'

export interface WorkspaceDetailDTO {
  workspace: WorkspaceOutputDTO
  organization: OrganizationOutputDTO | null
}

/**
 * Workspace (tenant container) CRUD (Mission 5 §1). Creating a workspace makes the caller
 * its OWNER (workspace + settings + OWNER membership + FREE subscription, atomically);
 * list returns the caller's workspaces; detail/update/delete operate on the active
 * workspace and are permission-gated at the route (workspace:read/update/delete).
 */
export class WorkspaceService extends BaseService {
  private readonly workspaces: WorkspaceRepository
  private readonly memberships: MembershipRepository
  private readonly audit: AuditService
  private readonly activity: ActivityService

  constructor(ctx: RequestContext) {
    super(ctx)
    this.workspaces = new WorkspaceRepository()
    this.memberships = new MembershipRepository()
    this.audit = new AuditService(ctx)
    this.activity = new ActivityService(ctx)
  }

  /** The workspaces the authenticated user belongs to (frozen WorkspaceSwitcher). */
  async listForUser(): Promise<WorkspaceOutputDTO[]> {
    if (!this.ctx.user) throw new UnauthenticatedError()
    let memberships = await this.memberships.listByUser(this.ctx.user.id)

    // Self-heal: every user must have a personal workspace, otherwise every tenant-scoped
    // request 403s ("Could not load your dashboard"). Credentials signups are bootstrapped on
    // email verification — but if that never completes (e.g. email delivery isn't configured),
    // the user is left with none. Provision it now, idempotently, so the dashboard works. The
    // slug is random-suffixed, so a concurrent request can't create a duplicate; if one races
    // us we simply re-read.
    if (memberships.length === 0) {
      try {
        await bootstrapPersonalWorkspace(this.ctx, this.ctx.user.id, this.ctx.user.name ?? this.ctx.user.email)
      } catch (err) {
        this.ctx.logger.warn('lazy workspace bootstrap failed', {
          error: err instanceof Error ? err.message : String(err),
        })
      }
      memberships = await this.memberships.listByUser(this.ctx.user.id)
    }

    return memberships.map((m) => toWorkspaceDTO(m.workspace))
  }

  async create(raw: unknown): Promise<WorkspaceOutputDTO> {
    if (!this.ctx.user) throw new UnauthenticatedError()
    const input = parseWith(workspaceCreateSchema, raw)
    if (await this.workspaces.findBySlug(input.slug)) {
      throw new ConflictError('That workspace URL is already taken')
    }
    const userId = this.ctx.user.id

    const workspaceId = await runInTransaction(async (tx) => {
      const ws = await tx.workspace.create({ data: { name: input.name, slug: input.slug } })
      await tx.workspaceSettings.create({ data: { workspaceId: ws.id } })
      await tx.membership.create({
        data: { userId, workspaceId: ws.id, role: 'OWNER', status: 'ACTIVE' },
      })
      const freePlan = await tx.plan.findUnique({ where: { tier: 'FREE' } })
      if (freePlan) {
        await tx.subscription.create({
          data: { workspaceId: ws.id, planId: freePlan.id, planTier: 'FREE' },
        })
      }
      return ws.id
    })

    const workspace = await this.workspaces.requireById(workspaceId)
    await this.audit.record({
      action: 'workspace.create',
      targetType: 'Workspace',
      targetId: workspace.id,
      workspaceId: workspace.id,
      after: { name: workspace.name, slug: workspace.slug },
    })
    await this.activity.record({
      verb: 'created',
      summary: `created workspace "${workspace.name}"`,
      relatedType: 'Workspace',
      relatedId: workspace.id,
      workspaceId: workspace.id,
    })
    return toWorkspaceDTO(workspace)
  }

  async getDetail(id: string): Promise<WorkspaceDetailDTO> {
    const ws = await this.workspaces.getWithSettings(id)
    if (!ws) throw new NotFoundError('Workspace', { id })
    return {
      workspace: toWorkspaceDTO(ws),
      organization: ws.settings ? toOrganizationDTO(ws.settings) : null,
    }
  }

  async update(id: string, raw: unknown): Promise<WorkspaceOutputDTO> {
    const before = await this.workspaces.requireById(id)
    const input = parseWith(workspaceUpdateSchema, raw)
    const workspace = await this.workspaces.update(id, { name: input.name })
    await this.audit.record({
      action: 'workspace.update',
      targetType: 'Workspace',
      targetId: id,
      before: { name: before.name },
      after: { name: workspace.name },
    })
    await this.activity.record({
      verb: 'updated',
      summary: `updated workspace "${workspace.name}"`,
      relatedType: 'Workspace',
      relatedId: id,
    })
    return toWorkspaceDTO(workspace)
  }

  /** The workspace's business/organization profile (WorkspaceSettings). */
  async getOrganization(workspaceId: string): Promise<OrganizationOutputDTO | null> {
    const settings = await this.workspaces.getSettings(workspaceId)
    return settings ? toOrganizationDTO(settings) : null
  }

  /** Update the organization profile — reuses the onboarding `organizationSettingsSchema`. */
  async updateOrganization(workspaceId: string, raw: unknown): Promise<OrganizationOutputDTO> {
    const input = parseWith(organizationSettingsSchema, raw)
    const data: Prisma.WorkspaceSettingsUpdateInput = {
      ...(input.legalName !== undefined ? { legalName: input.legalName } : {}),
      ...(input.businessType !== undefined ? { businessType: input.businessType } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.address !== undefined
        ? { address: JSON.parse(JSON.stringify(input.address)) as Prisma.InputJsonValue }
        : {}),
      ...(input.taxId !== undefined ? { taxId: input.taxId } : {}),
      ...(input.taxRegion !== undefined ? { taxRegion: input.taxRegion } : {}),
      ...(input.defaultTaxType !== undefined ? { defaultTaxType: input.defaultTaxType } : {}),
      ...(input.defaultCurrency !== undefined ? { defaultCurrency: input.defaultCurrency } : {}),
      ...(input.brandColor !== undefined ? { brandColor: input.brandColor } : {}),
      ...(input.numberFormat !== undefined ? { numberFormat: input.numberFormat } : {}),
    }
    const settings = await this.workspaces.updateSettings(workspaceId, data)
    await this.audit.record({
      action: 'workspace.settings.updated',
      targetType: 'WorkspaceSettings',
      targetId: workspaceId,
      workspaceId,
    })
    await this.activity.record({
      verb: 'updated',
      summary: 'updated organization settings',
      relatedType: 'Workspace',
      relatedId: workspaceId,
      workspaceId,
    })
    return toOrganizationDTO(settings)
  }

  async remove(id: string): Promise<void> {
    const before = await this.workspaces.requireById(id)
    await this.workspaces.softDelete(id)
    await this.audit.record({
      action: 'workspace.delete',
      targetType: 'Workspace',
      targetId: id,
      workspaceId: id,
      before: { name: before.name },
    })
    await this.activity.record({
      verb: 'deleted',
      summary: `deleted workspace "${before.name}"`,
      relatedType: 'Workspace',
      relatedId: id,
      workspaceId: id,
    })
  }
}

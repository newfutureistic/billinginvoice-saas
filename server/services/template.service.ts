import { randomBytes } from 'node:crypto'
import { Prisma, type TemplateAsset } from '@prisma/client'
import { BaseService } from '@/server/services/base.service'
import { AuditService } from '@/server/services/audit.service'
import { ActivityService } from '@/server/services/activity.service'
import { TemplateRepository } from '@/server/repositories/template.repository'
import { WorkspaceRepository } from '@/server/repositories/workspace.repository'
import { parseWith } from '@/server/http/middleware/validation'
import {
  templateCreateSchema,
  templateUpdateSchema,
  duplicateTemplateSchema,
} from '@/lib/validation/template.schema'
import {
  toTemplateDTO,
  toTemplatePreviewDTO,
  type TemplateOutputDTO,
  type TemplatePreviewDTO,
} from '@/lib/dto/template.dto'
import type { ServiceListResult } from '@/server/services/crud.service'
import type { PaginationInput } from '@/server/db/utils'
import { ConflictError, TenantRequiredError } from '@/server/errors/app-error'
import type { RequestContext } from '@/server/http/context'

function jsonify(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

/**
 * Invoice-template CRUD (Mission 5 §4): create / update / delete workspace templates,
 * duplicate any visible template, set the workspace default, and expose preview metadata.
 * System presets are read-only; mutations only touch workspace-owned rows. Templates have
 * no soft-delete column, so removal is permanent (audited + timeline-logged).
 */
export class TemplateService extends BaseService {
  private readonly wsId: string
  private readonly repo: TemplateRepository
  private readonly workspaces: WorkspaceRepository
  private readonly audit: AuditService
  private readonly activity: ActivityService

  constructor(ctx: RequestContext) {
    super(ctx)
    if (!ctx.workspaceId) throw new TenantRequiredError()
    this.wsId = ctx.workspaceId
    this.repo = new TemplateRepository(ctx.workspaceId)
    this.workspaces = new WorkspaceRepository()
    this.audit = new AuditService(ctx)
    this.activity = new ActivityService(ctx)
  }

  private async defaultTemplateId(): Promise<string | null> {
    const settings = await this.workspaces.getSettings(this.wsId)
    return settings?.defaultTemplateId ?? null
  }

  async list(pagination?: PaginationInput): Promise<ServiceListResult<TemplateOutputDTO>> {
    const [page, defaultId] = await Promise.all([this.repo.list(pagination), this.defaultTemplateId()])
    return { items: page.data.map((t) => toTemplateDTO(t, defaultId)), pagination: page.meta }
  }

  async get(id: string): Promise<TemplateOutputDTO> {
    const [template, defaultId] = await Promise.all([
      this.repo.requireVisibleById(id),
      this.defaultTemplateId(),
    ])
    return toTemplateDTO(template, defaultId)
  }

  async preview(id: string): Promise<TemplatePreviewDTO> {
    const [template, defaultId] = await Promise.all([
      this.repo.requireVisibleById(id),
      this.defaultTemplateId(),
    ])
    return toTemplatePreviewDTO(template, defaultId)
  }

  async create(raw: unknown): Promise<TemplateOutputDTO> {
    const input = parseWith(templateCreateSchema, raw)
    if (await this.repo.keyExists(input.key)) {
      throw new ConflictError(`A template with key "${input.key}" already exists`)
    }
    const template = await this.repo.create({
      key: input.key,
      name: input.name,
      description: input.description ?? null,
      colors: jsonify(input.colors),
    })
    await this.trace('create', template, `created template "${template.name}"`)
    return toTemplateDTO(template, await this.defaultTemplateId())
  }

  async update(id: string, raw: unknown): Promise<TemplateOutputDTO> {
    const input = parseWith(templateUpdateSchema, raw)
    const template = await this.repo.update(id, {
      name: input.name,
      description: input.description ?? undefined,
      colors: input.colors ? jsonify(input.colors) : undefined,
    })
    await this.trace('update', template, `updated template "${template.name}"`)
    return toTemplateDTO(template, await this.defaultTemplateId())
  }

  async remove(id: string): Promise<void> {
    const template = await this.repo.delete(id)
    await this.trace('delete', template, `deleted template "${template.name}"`, true)
  }

  /** Copy any visible template into a new editable workspace template. */
  async duplicate(id: string, raw: unknown): Promise<TemplateOutputDTO> {
    const input = parseWith(duplicateTemplateSchema, raw)
    const source = await this.repo.requireVisibleById(id)
    const key = `${source.key}-copy-${randomBytes(3).toString('hex')}`
    const template = await this.repo.create({
      key,
      name: input.name ?? `${source.name} (Copy)`,
      description: source.description,
      colors: jsonify(source.colors),
    })
    await this.trace('duplicate', template, `duplicated template "${source.name}"`)
    return toTemplateDTO(template, await this.defaultTemplateId())
  }

  /** Set the workspace's default template (must be a visible template). */
  async setDefault(id: string): Promise<TemplateOutputDTO> {
    const template = await this.repo.requireVisibleById(id)
    await this.workspaces.setDefaultTemplate(this.wsId, template.id)
    await this.trace('default', template, `set default template to "${template.name}"`)
    return toTemplateDTO(template, template.id)
  }

  private async trace(action: string, template: TemplateAsset, summary: string, removed = false): Promise<void> {
    await this.audit.record({
      action: `template.${action}`,
      targetType: 'Template',
      targetId: template.id,
      after: removed ? undefined : (toTemplateDTO(template) as unknown as Record<string, unknown>),
    })
    await this.activity.record({
      verb: action,
      summary,
      relatedType: 'Template',
      relatedId: template.id,
    })
  }
}

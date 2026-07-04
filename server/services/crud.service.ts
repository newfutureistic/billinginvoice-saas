import type { ZodType } from 'zod'
import type { PageMeta, Paginated, PaginationInput } from '@/server/db/utils'
import { parseWith } from '@/server/http/middleware/validation'
import { BaseService } from '@/server/services/base.service'
import { AuditService } from '@/server/services/audit.service'
import { ActivityService } from '@/server/services/activity.service'
import { parseSort, type SortInput } from '@/server/utils/sort'
import type { RequestContext } from '@/server/http/context'

/**
 * The repository shape a CRUD service needs. Satisfied by the tenant repositories
 * (Client/Product/Template) which compose Read + Write + SoftDelete contracts and add
 * hard-delete + deleted-listing for the recycle-bin lifecycle.
 */
export interface CrudRepository<Model, Filter, CreateData, UpdateData> {
  findById(id: string): Promise<Model | null>
  requireById(id: string): Promise<Model>
  list(filter?: Filter, pagination?: PaginationInput, sort?: SortInput): Promise<Paginated<Model>>
  count(filter?: Filter): Promise<number>
  create(data: CreateData): Promise<Model>
  update(id: string, data: UpdateData): Promise<Model>
  softDelete(id: string): Promise<Model>
  restore(id: string): Promise<Model>
  hardDelete(id: string): Promise<Model>
  listDeleted(filter?: Filter, pagination?: PaginationInput): Promise<Paginated<Model>>
}

export interface ServiceListResult<DTO> {
  items: DTO[]
  pagination: PageMeta
}

export interface ListParams {
  pagination?: PaginationInput
  /** Raw client sort string (e.g. `-createdAt`); validated against `sortable`. */
  sort?: string
}

type CrudAction = 'create' | 'update' | 'delete' | 'restore' | 'purge'

const ACTION_VERB: Record<CrudAction, string> = {
  create: 'created',
  update: 'updated',
  delete: 'deleted',
  restore: 'restored',
  purge: 'permanently deleted',
}

/**
 * Reusable tenant CRUD service. A concrete service supplies its repository, Zod
 * create/update schemas, DTO mapper, input→data mappers, and resource metadata; it
 * inherits validated, tenant-scoped, DTO-shaped operations **plus** audit logging and an
 * activity-timeline entry on every mutation, the soft-delete recycle-bin lifecycle
 * (soft delete → restore → permanent delete + deleted listing), and allow-listed sorting.
 * Abstract by design — Mission 5 wires the concrete Client/Product/Template services on top.
 */
export abstract class TenantCrudService<
  Model,
  DTO,
  CreateInput,
  UpdateInput,
  CreateData,
  UpdateData,
  Filter = unknown,
> extends BaseService {
  protected abstract readonly repo: CrudRepository<Model, Filter, CreateData, UpdateData>
  protected abstract readonly createSchema: ZodType<CreateInput>
  protected abstract readonly updateSchema: ZodType<UpdateInput>
  /** Aggregate name — audit `targetType`, audit action prefix, activity subject. */
  protected abstract readonly resource: string
  /** Columns clients may sort by (allow-list). */
  protected abstract readonly sortable: readonly string[]
  protected abstract toDTO(model: Model): DTO
  protected abstract toCreateData(input: CreateInput): CreateData
  protected abstract toUpdateData(input: UpdateInput): UpdateData
  /** Stable id of a model (audit target + activity relatedId). */
  protected abstract entityId(model: Model): string
  /** Human label of a model (activity summary). */
  protected abstract entityLabel(model: Model): string

  protected readonly audit: AuditService
  protected readonly activity: ActivityService
  protected readonly defaultSort: SortInput = { field: 'createdAt', direction: 'desc' }

  constructor(ctx: RequestContext, deps: { audit?: AuditService; activity?: ActivityService } = {}) {
    super(ctx)
    this.audit = deps.audit ?? new AuditService(ctx)
    this.activity = deps.activity ?? new ActivityService(ctx)
  }

  private resolveSort(raw?: string): SortInput {
    return parseSort(raw, this.sortable, this.defaultSort)
  }

  async get(id: string): Promise<DTO> {
    return this.toDTO(await this.repo.requireById(id))
  }

  async list(filter?: Filter, params: ListParams = {}): Promise<ServiceListResult<DTO>> {
    const page = await this.repo.list(filter, params.pagination, this.resolveSort(params.sort))
    return { items: page.data.map((m) => this.toDTO(m)), pagination: page.meta }
  }

  async listDeleted(
    filter?: Filter,
    pagination?: PaginationInput,
  ): Promise<ServiceListResult<DTO>> {
    const page = await this.repo.listDeleted(filter, pagination)
    return { items: page.data.map((m) => this.toDTO(m)), pagination: page.meta }
  }

  async create(raw: unknown): Promise<DTO> {
    const input = parseWith(this.createSchema, raw)
    const model = await this.repo.create(this.toCreateData(input))
    await this.trace('create', model)
    return this.toDTO(model)
  }

  async update(id: string, raw: unknown): Promise<DTO> {
    const before = await this.repo.requireById(id)
    const input = parseWith(this.updateSchema, raw)
    const model = await this.repo.update(id, this.toUpdateData(input))
    await this.trace('update', model, { before })
    return this.toDTO(model)
  }

  /** Soft delete (recoverable). */
  async remove(id: string): Promise<void> {
    const before = await this.repo.requireById(id)
    await this.repo.softDelete(id)
    await this.trace('delete', before, { removed: true })
  }

  async restore(id: string): Promise<DTO> {
    const model = await this.repo.restore(id)
    await this.trace('restore', model)
    return this.toDTO(model)
  }

  /** Permanent, irreversible delete (recycle-bin purge; works on soft-deleted rows). */
  async hardDelete(id: string): Promise<void> {
    const removed = await this.repo.hardDelete(id)
    await this.trace('purge', removed, { removed: true })
  }

  /** Emit the audit record + activity-timeline entry for one mutation. */
  private async trace(
    action: CrudAction,
    subject: Model,
    opts: { before?: Model; removed?: boolean } = {},
  ): Promise<void> {
    const id = this.entityId(subject)
    const label = this.entityLabel(subject)
    const verb = ACTION_VERB[action]
    await this.audit.record({
      action: `${this.resource.toLowerCase()}.${action}`,
      targetType: this.resource,
      targetId: id,
      before: opts.before ? (this.toDTO(opts.before) as unknown as Record<string, unknown>) : undefined,
      after: opts.removed ? undefined : (this.toDTO(subject) as unknown as Record<string, unknown>),
    })
    await this.activity.record({
      verb,
      summary: `${verb} ${this.resource.toLowerCase()} "${label}"`,
      relatedType: this.resource,
      relatedId: id,
    })
  }
}

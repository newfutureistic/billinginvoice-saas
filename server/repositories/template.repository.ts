import { Prisma, type TemplateAsset } from '@prisma/client'
import { prisma, type DbClient } from '@/server/db/prisma'
import { BaseRepository } from '@/server/repositories/base.repository'
import { NotFoundError } from '@/server/db/errors'
import {
  buildPageMeta,
  resolvePagination,
  type Paginated,
  type PaginationInput,
} from '@/server/db/utils'

/** Create data for a workspace template (repo injects `workspaceId`). */
export interface TemplateCreateData {
  key: string
  name: string
  description?: string | null
  colors: Prisma.InputJsonValue
}

export interface TemplateUpdateData {
  name?: string
  description?: string | null
  colors?: Prisma.InputJsonValue
}

/**
 * Template-asset repository. Templates are either **system** presets (shared, read-only,
 * `workspaceId = null`, `isSystem = true`) or **workspace** templates (owned, editable).
 * Reads return both; mutations are restricted to workspace-owned rows. `TemplateAsset`
 * has no soft-delete column, so deletion is permanent.
 */
export class TemplateRepository extends BaseRepository {
  constructor(
    private readonly workspaceId: string,
    db: DbClient = prisma,
  ) {
    super(db)
  }

  /** Visible to this workspace: its own templates plus system presets. */
  private visibleWhere(): Prisma.TemplateAssetWhereInput {
    return { OR: [{ workspaceId: this.workspaceId }, { isSystem: true }] }
  }

  list(pagination?: PaginationInput): Promise<Paginated<TemplateAsset>> {
    const where = this.visibleWhere()
    const { page, pageSize, skip, take } = resolvePagination(pagination)
    return this.run(async () => {
      const [total, data] = await Promise.all([
        this.db.templateAsset.count({ where }),
        this.db.templateAsset.findMany({
          where,
          orderBy: [{ isSystem: 'desc' }, { createdAt: 'asc' }],
          skip,
          take,
        }),
      ])
      return { data, meta: buildPageMeta(total, page, pageSize) }
    })
  }

  /** Any template visible to the workspace (system or owned). */
  findVisibleById(id: string): Promise<TemplateAsset | null> {
    return this.run(() =>
      this.db.templateAsset.findFirst({ where: { id, ...this.visibleWhere() } }),
    )
  }

  async requireVisibleById(id: string): Promise<TemplateAsset> {
    const t = await this.findVisibleById(id)
    if (!t) throw new NotFoundError('Template', { id })
    return t
  }

  /** A workspace-owned (editable) template. System presets are excluded. */
  findOwnedById(id: string): Promise<TemplateAsset | null> {
    return this.run(() =>
      this.db.templateAsset.findFirst({
        where: { id, workspaceId: this.workspaceId, isSystem: false },
      }),
    )
  }

  async requireOwnedById(id: string): Promise<TemplateAsset> {
    const t = await this.findOwnedById(id)
    if (!t) throw new NotFoundError('Template', { id })
    return t
  }

  keyExists(key: string): Promise<TemplateAsset | null> {
    return this.run(() =>
      this.db.templateAsset.findFirst({ where: { workspaceId: this.workspaceId, key } }),
    )
  }

  create(data: TemplateCreateData): Promise<TemplateAsset> {
    return this.run(() =>
      this.db.templateAsset.create({
        data: {
          workspaceId: this.workspaceId,
          key: data.key,
          name: data.name,
          description: data.description ?? null,
          colors: data.colors,
          isSystem: false,
        },
      }),
    )
  }

  async update(id: string, data: TemplateUpdateData): Promise<TemplateAsset> {
    await this.requireOwnedById(id)
    return this.run(() =>
      this.db.templateAsset.update({
        where: { id },
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.colors !== undefined ? { colors: data.colors } : {}),
        },
      }),
    )
  }

  async delete(id: string): Promise<TemplateAsset> {
    const owned = await this.requireOwnedById(id)
    await this.run(() => this.db.templateAsset.delete({ where: { id } }))
    return owned
  }
}

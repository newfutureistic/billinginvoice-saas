import { Prisma, type Workspace, type WorkspaceSettings } from '@prisma/client'
import { BaseRepository } from '@/server/repositories/base.repository'
import { NotFoundError } from '@/server/db/errors'

/** Workspace payload including its 1:1 settings row. */
export type WorkspaceWithSettings = Prisma.WorkspaceGetPayload<{ include: { settings: true } }>

/**
 * Root tenant aggregate. Unlike the tenant-scoped repositories, the workspace is keyed
 * by its own id; access-control (membership) is enforced a layer up (later mission).
 */
export class WorkspaceRepository extends BaseRepository {
  findById(id: string): Promise<Workspace | null> {
    return this.run(() => this.db.workspace.findFirst({ where: { id, deletedAt: null } }))
  }

  async requireById(id: string): Promise<Workspace> {
    const ws = await this.findById(id)
    if (!ws) throw new NotFoundError('Workspace', { id })
    return ws
  }

  findBySlug(slug: string): Promise<Workspace | null> {
    return this.run(() => this.db.workspace.findFirst({ where: { slug, deletedAt: null } }))
  }

  getWithSettings(id: string): Promise<WorkspaceWithSettings | null> {
    return this.run(() =>
      this.db.workspace.findFirst({ where: { id, deletedAt: null }, include: { settings: true } }),
    )
  }

  getSettings(workspaceId: string): Promise<WorkspaceSettings | null> {
    return this.run(() => this.db.workspaceSettings.findUnique({ where: { workspaceId } }))
  }

  updateSettings(
    workspaceId: string,
    data: Prisma.WorkspaceSettingsUpdateInput,
  ): Promise<WorkspaceSettings> {
    return this.run(() => this.db.workspaceSettings.update({ where: { workspaceId }, data }))
  }

  async setDefaultTemplate(workspaceId: string, templateId: string): Promise<void> {
    await this.run(() =>
      this.db.workspaceSettings.update({
        where: { workspaceId },
        data: { defaultTemplateId: templateId },
      }),
    )
  }

  create(data: Prisma.WorkspaceCreateInput): Promise<Workspace> {
    return this.run(() => this.db.workspace.create({ data }))
  }

  update(id: string, data: Prisma.WorkspaceUpdateInput): Promise<Workspace> {
    return this.run(() => this.db.workspace.update({ where: { id }, data }))
  }

  softDelete(id: string): Promise<Workspace> {
    return this.run(() => this.db.workspace.update({ where: { id }, data: { deletedAt: new Date() } }))
  }
}

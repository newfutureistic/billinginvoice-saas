import { type DocumentType, type Tool, type ToolCategory } from '@prisma/client'
import { BaseRepository } from '@/server/repositories/base.repository'
import { NotFoundError } from '@/server/db/errors'

export type ToolWithCategory = Tool & { category: ToolCategory }

/**
 * Global tool-registry reads. The catalogue is shared across tenants (not workspace
 * scoped), so this extends the non-tenant `BaseRepository`. Reads only: the registry is
 * managed via seed/migrations, not runtime CRUD.
 */
export class ToolRepository extends BaseRepository {
  findBySlug(slug: string): Promise<Tool | null> {
    return this.run(() => this.db.tool.findUnique({ where: { slug } }))
  }

  async requireBySlug(slug: string): Promise<Tool> {
    const tool = await this.findBySlug(slug)
    if (!tool) throw new NotFoundError('Tool', { slug })
    return tool
  }

  listActive(): Promise<Tool[]> {
    return this.run(() =>
      this.db.tool.findMany({ where: { isActive: true }, orderBy: [{ sortWeight: 'asc' }, { name: 'asc' }] }),
    )
  }

  /** The tool that produces a given document type (invoice-generator, quotes, …). */
  findByOutputType(type: DocumentType): Promise<Tool | null> {
    return this.run(() =>
      this.db.tool.findFirst({
        where: { outputType: type, isActive: true },
        orderBy: { sortWeight: 'asc' },
      }),
    )
  }

  /** Any active document-producing tool — fallback when no exact output-type match. */
  firstDocumentTool(): Promise<Tool | null> {
    return this.run(() =>
      this.db.tool.findFirst({ where: { kind: 'DOCUMENT', isActive: true }, orderBy: { sortWeight: 'asc' } }),
    )
  }

  listByCategory(categorySlug: string): Promise<Tool[]> {
    return this.run(() =>
      this.db.tool.findMany({
        where: { isActive: true, category: { slug: categorySlug } },
        orderBy: { name: 'asc' },
      }),
    )
  }

  listCategories(): Promise<ToolCategory[]> {
    return this.run(() => this.db.toolCategory.findMany({ orderBy: { sortWeight: 'asc' } }))
  }
}

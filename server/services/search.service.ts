import { BaseService } from '@/server/services/base.service'
import { ClientRepository } from '@/server/repositories/client.repository'
import { ProductRepository } from '@/server/repositories/product.repository'
import { DocumentRepository } from '@/server/repositories/document.repository'
import { TemplateRepository } from '@/server/repositories/template.repository'
import type {
  SearchEntity,
  SearchResultDTO,
  SearchResponseDTO,
} from '@/lib/dto/search.dto'
import { TenantRequiredError } from '@/server/errors/app-error'
import type { RequestContext } from '@/server/http/context'

/**
 * Global search (Mission 5 §7). Workspace-scoped fan-out across clients, products,
 * documents and templates, normalized into one card shape. Each entity is a single
 * tenant-scoped query capped at `limit`, run in parallel — no N+1, never crosses the
 * tenant boundary (every repo injects `workspaceId`).
 */
export class SearchService extends BaseService {
  private readonly wsId: string

  constructor(ctx: RequestContext) {
    super(ctx)
    if (!ctx.workspaceId) throw new TenantRequiredError()
    this.wsId = ctx.workspaceId
  }

  async search(query: string, limit = 5): Promise<SearchResponseDTO> {
    const clients = new ClientRepository(this.wsId)
    const products = new ProductRepository(this.wsId)
    const documents = new DocumentRepository(this.wsId)
    const templates = new TemplateRepository(this.wsId)

    const [clientPage, productPage, documentPage, templatePage] = await Promise.all([
      clients.list({ search: query }, { pageSize: limit }),
      products.list({ search: query }, { pageSize: limit }),
      documents.list({ search: query }, { pageSize: limit }),
      templates.list({ pageSize: limit * 4 }),
    ])

    const results: SearchResultDTO[] = [
      ...clientPage.data.map(
        (c): SearchResultDTO => ({
          entity: 'client',
          id: c.id,
          title: c.name,
          subtitle: c.email,
          badge: c.status,
        }),
      ),
      ...productPage.data.map(
        (p): SearchResultDTO => ({
          entity: 'product',
          id: p.id,
          title: p.name,
          subtitle: p.sku,
          badge: p.category,
        }),
      ),
      ...documentPage.data.map(
        (d): SearchResultDTO => ({
          entity: 'document',
          id: d.id,
          title: d.number,
          subtitle: d.type,
          badge: d.status,
        }),
      ),
      ...templatePage.data
        .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit)
        .map(
          (t): SearchResultDTO => ({
            entity: 'template',
            id: t.id,
            title: t.name,
            subtitle: t.description,
            badge: t.isSystem ? 'system' : 'custom',
          }),
        ),
    ]

    const counts = results.reduce(
      (acc, r) => {
        acc[r.entity] += 1
        return acc
      },
      { client: 0, product: 0, document: 0, template: 0 } as Record<SearchEntity, number>,
    )

    return { query, total: results.length, results, counts }
  }
}

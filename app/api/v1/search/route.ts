import { defineRoute } from '@/server/http/handler'
import { SearchService } from '@/server/services/search.service'
import { searchQuerySchema, type SearchQuery } from '@/lib/validation/common.schema'
import type { SearchResponseDTO } from '@/lib/dto/search.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/search?q=… — workspace-scoped global search across clients, products,
 * documents and templates. Any workspace member may search; results never cross the
 * tenant boundary.
 */
export const GET = defineRoute<SearchResponseDTO, undefined, SearchQuery>({
  requireMembership: true,
  schema: { query: searchQuerySchema },
  rateLimit: { limit: 60, windowMs: 60_000 },
  handler: ({ query, ctx }) => new SearchService(ctx).search(query.q, query.limit),
})

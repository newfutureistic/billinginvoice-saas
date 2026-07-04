import { defineRoute } from '@/server/http/handler'
import { DocumentService } from '@/server/services/document.service'
import { documentListQuerySchema, type DocumentListQuery } from '@/lib/validation/document.schema'
import type { DocumentOutputDTO } from '@/lib/dto/document.dto'
import type { ListResult } from '@/server/http/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/v1/documents/deleted — recycle bin of soft-deleted documents (`document:read`). */
export const GET = defineRoute<ListResult<DocumentOutputDTO>, undefined, DocumentListQuery>({
  permission: 'document:read',
  schema: { query: documentListQuerySchema },
  handler: ({ query, ctx }) =>
    new DocumentService(ctx).listDeleted(
      { type: query.type, status: query.status, clientId: query.clientId, search: query.search },
      { page: query.page, pageSize: query.pageSize },
    ),
})

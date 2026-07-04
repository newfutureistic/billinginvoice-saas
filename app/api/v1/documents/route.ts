import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { DocumentService } from '@/server/services/document.service'
import {
  documentCreateSchema,
  documentListQuerySchema,
  documentTypeSchema,
  type DocumentCreateInput,
  type DocumentListQuery,
} from '@/lib/validation/document.schema'
import type { DocumentOutputDTO, DocumentDetailDTO } from '@/lib/dto/document.dto'
import type { ListResult } from '@/server/http/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const createQuerySchema = z.object({ type: documentTypeSchema.optional() })
type CreateQuery = z.infer<typeof createQuerySchema>

/**
 * GET /api/v1/documents — list any document type (invoice, quote, receipt, PO, credit
 * note, salary slip …) with filter + search + date range + sort + pagination
 * (`document:read`). POST creates one via the generic engine (`document:create`); the
 * type comes from `?type=` or the body, defaulting to INVOICE.
 */
export const GET = defineRoute<ListResult<DocumentOutputDTO>, undefined, DocumentListQuery>({
  permission: 'document:read',
  schema: { query: documentListQuerySchema },
  handler: ({ query, ctx }) =>
    new DocumentService(ctx).list(
      {
        type: query.type,
        status: query.status,
        clientId: query.clientId,
        search: query.search,
        dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
        dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      },
      { pagination: { page: query.page, pageSize: query.pageSize }, sort: query.sort },
    ),
})

export const POST = defineRoute<DocumentDetailDTO, DocumentCreateInput, CreateQuery>({
  permission: 'document:create',
  schema: { body: documentCreateSchema, query: createQuerySchema },
  csrf: true,
  status: 201,
  handler: ({ body, query, ctx }) => new DocumentService(ctx).create(body, { type: query.type }),
})

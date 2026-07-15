import { defineRoute } from '@/server/http/handler'
import { FileService, type UploadTicket } from '@/server/services/file.service'
import { fileUploadRequestSchema, type FileUploadRequestInput } from '@/lib/validation/file.schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/files/upload — validate (mime allow-list + size cap + plan quota) and mint
 * a direct-to-storage signed upload URL. The client PUTs bytes to storage, then calls
 * `/files/commit`. Any workspace member may upload.
 */
export const POST = defineRoute<UploadTicket, FileUploadRequestInput>({
  requireMembership: true,
  schema: { body: fileUploadRequestSchema },
  csrf: true,
  rateLimit: { limit: 60, windowMs: 60_000 },
  handler: ({ body, ctx }) => new FileService(ctx).createUploadUrl(body),
})

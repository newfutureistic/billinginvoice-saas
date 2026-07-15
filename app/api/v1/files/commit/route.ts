import { defineRoute } from '@/server/http/handler'
import { FileService } from '@/server/services/file.service'
import { fileCommitConfirmSchema, type FileCommitConfirmInput } from '@/lib/validation/file.schema'
import type { FileOutputDTO } from '@/lib/dto/file.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/v1/files/commit — confirm a completed direct upload: verify the object exists
 * in storage and within this workspace's path, then record the `FileObject`.
 */
export const POST = defineRoute<FileOutputDTO, FileCommitConfirmInput>({
  requireMembership: true,
  schema: { body: fileCommitConfirmSchema },
  csrf: true,
  status: 201,
  handler: ({ body, ctx }) => new FileService(ctx).commit(body),
})

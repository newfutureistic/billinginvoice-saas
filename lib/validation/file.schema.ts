import { z } from 'zod'
import { fileKindValues } from '@/lib/validation/common.schema'

// Validation only — actual storage / signed uploads are a later mission.
export const fileKindSchema = z.enum(fileKindValues)

export const fileUploadRequestSchema = z.object({
  kind: fileKindSchema,
  mimeType: z.string().min(1).max(120),
  sizeBytes: z.number().int().positive().max(50 * 1024 * 1024),
  checksum: z.string().max(128).optional(),
})

export const fileCommitSchema = z.object({
  fileId: z.string().min(1),
})

export type FileUploadRequestInput = z.infer<typeof fileUploadRequestSchema>
export type FileCommitInput = z.infer<typeof fileCommitSchema>

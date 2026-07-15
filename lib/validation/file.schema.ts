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

// --- Mission 7: commit confirmation, QR generation, document email ----------
export const fileCommitConfirmSchema = z.object({
  fileId: z.string().min(1).max(80),
  path: z.string().min(1).max(400),
  kind: fileKindSchema,
  mimeType: z.string().min(1).max(120),
  sizeBytes: z.number().int().positive().max(50 * 1024 * 1024),
  checksum: z.string().max(128).optional(),
})

export const qrGenerateSchema = z.object({
  data: z.string().min(1, 'QR content is required').max(2000),
  format: z.enum(['png', 'svg']).default('png'),
  size: z.number().int().min(64).max(1024).default(256),
  margin: z.number().int().min(0).max(16).default(2),
  store: z.coerce.boolean().default(false),
})

export const sendDocumentEmailSchema = z.object({
  /** Override recipient; defaults to the document's recipient email. */
  to: z.string().email().optional(),
})

export type FileUploadRequestInput = z.infer<typeof fileUploadRequestSchema>
export type FileCommitInput = z.infer<typeof fileCommitSchema>
export type FileCommitConfirmInput = z.infer<typeof fileCommitConfirmSchema>
export type QrGenerateInput = z.infer<typeof qrGenerateSchema>
export type SendDocumentEmailInput = z.infer<typeof sendDocumentEmailSchema>

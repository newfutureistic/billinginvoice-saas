import type { FileObject } from '@prisma/client'
import { iso } from '@/lib/dto/common.dto'

export interface FileOutputDTO {
  id: string
  kind: string
  mimeType: string
  sizeBytes: number
  createdAt: string
}

export function toFileDTO(file: FileObject): FileOutputDTO {
  return {
    id: file.id,
    kind: file.kind,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    createdAt: iso(file.createdAt),
  }
}

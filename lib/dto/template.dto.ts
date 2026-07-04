import type { Prisma, TemplateAsset } from '@prisma/client'
import { iso } from '@/lib/dto/common.dto'

export interface TemplateOutputDTO {
  id: string
  key: string
  name: string
  description: string | null
  colors: Prisma.JsonValue
  isSystem: boolean
  isDefault: boolean
  createdAt: string
}

/** Lightweight preview metadata for the frozen template gallery. */
export interface TemplatePreviewDTO {
  id: string
  name: string
  colors: Prisma.JsonValue
  isSystem: boolean
  isDefault: boolean
}

export function toTemplateDTO(template: TemplateAsset, defaultTemplateId?: string | null): TemplateOutputDTO {
  return {
    id: template.id,
    key: template.key,
    name: template.name,
    description: template.description,
    colors: template.colors,
    isSystem: template.isSystem,
    isDefault: defaultTemplateId ? template.id === defaultTemplateId : false,
    createdAt: iso(template.createdAt),
  }
}

export function toTemplatePreviewDTO(
  template: TemplateAsset,
  defaultTemplateId?: string | null,
): TemplatePreviewDTO {
  return {
    id: template.id,
    name: template.name,
    colors: template.colors,
    isSystem: template.isSystem,
    isDefault: defaultTemplateId ? template.id === defaultTemplateId : false,
  }
}

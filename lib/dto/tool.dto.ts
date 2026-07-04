import type { Tool, ToolCategory } from '@prisma/client'
import { iso } from '@/lib/dto/common.dto'

export interface ToolOutputDTO {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  categoryId: string
  kind: string
  outputType: string | null
  status: string | null
  minPlan: string
  featured: boolean
  isActive: boolean
  addedAt: string
}

export interface ToolCategoryOutputDTO {
  id: string
  slug: string
  name: string
  description: string
  icon: string
}

export function toToolDTO(tool: Tool): ToolOutputDTO {
  return {
    id: tool.id,
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline,
    description: tool.description,
    categoryId: tool.categoryId,
    kind: tool.kind,
    outputType: tool.outputType,
    status: tool.status,
    minPlan: tool.minPlan,
    featured: tool.featured,
    isActive: tool.isActive,
    addedAt: iso(tool.addedAt),
  }
}

export function toToolCategoryDTO(category: ToolCategory): ToolCategoryOutputDTO {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    icon: category.icon,
  }
}

import { z } from 'zod'
import { hexColorSchema } from '@/lib/validation/common.schema'

export const templateColorsSchema = z.object({
  primary: hexColorSchema,
  accent: hexColorSchema,
  text: hexColorSchema,
  background: hexColorSchema,
})

export const templateCreateSchema = z.object({
  key: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  colors: templateColorsSchema,
})

export const templateUpdateSchema = templateCreateSchema.partial()

/** Duplicate an existing template (optionally renaming the copy). */
export const duplicateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
})

export type TemplateColors = z.infer<typeof templateColorsSchema>
export type TemplateCreateInput = z.infer<typeof templateCreateSchema>
export type TemplateUpdateInput = z.infer<typeof templateUpdateSchema>
export type DuplicateTemplateInput = z.infer<typeof duplicateTemplateSchema>

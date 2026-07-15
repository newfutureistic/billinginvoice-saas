import { z } from 'zod'

/** Blog CMS validation (Mission 3). Reused by the admin API + service. */
export const blogSlugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase words separated by hyphens')

export const blogStatusSchema = z.enum(['DRAFT', 'PUBLISHED'])

export const blogCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: blogSlugSchema.optional(), // derived from title when omitted
  excerpt: z.string().max(400).optional(),
  content: z.string().min(1, 'Content is required'),
  coverImage: z.string().url().optional().or(z.literal('')),
  coverAlt: z.string().max(200).optional(),
  category: z.string().min(1).max(60).default('General'),
  tags: z.array(z.string().min(1).max(40)).max(20).default([]),
  authorName: z.string().min(1).max(120).optional(),
  status: blogStatusSchema.default('DRAFT'),
  featured: z.boolean().default(false),
  pinned: z.boolean().default(false),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(300).optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  scheduledAt: z.string().datetime().optional(),
})

export const blogUpdateSchema = blogCreateSchema.partial()

export const blogListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  status: blogStatusSchema.optional(),
  category: z.string().max(60).optional(),
  tag: z.string().max(40).optional(),
  q: z.string().max(120).optional(),
  includeDeleted: z.coerce.boolean().optional(),
})

export type BlogCreateInput = z.infer<typeof blogCreateSchema>
export type BlogUpdateInput = z.infer<typeof blogUpdateSchema>
export type BlogListQuery = z.infer<typeof blogListQuerySchema>

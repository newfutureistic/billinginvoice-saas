import { z } from 'zod'
import { idSchema, listQuerySchema, notificationCategoryValues } from '@/lib/validation/common.schema'

export const notificationCategorySchema = z.enum(notificationCategoryValues)

export const notificationCreateSchema = z.object({
  recipientUserId: idSchema,
  category: notificationCategorySchema,
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  relatedType: z.string().max(60).optional(),
  relatedId: z.string().max(60).optional(),
})

export const notificationUpdateSchema = z.object({
  read: z.boolean().optional(),
  seen: z.boolean().optional(),
})

export const notificationFilterSchema = z.object({
  category: notificationCategorySchema.optional(),
  unreadOnly: z.coerce.boolean().optional(),
})

export const notificationListQuerySchema = listQuerySchema(notificationFilterSchema.shape)

export type NotificationCreateInput = z.infer<typeof notificationCreateSchema>
export type NotificationUpdateInput = z.infer<typeof notificationUpdateSchema>
export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>

import type { Notification } from '@prisma/client'
import { iso, isoOrNull } from '@/lib/dto/common.dto'

export interface NotificationOutputDTO {
  id: string
  category: string
  title: string
  body: string
  relatedType: string | null
  relatedId: string | null
  read: boolean
  seen: boolean
  createdAt: string
  readAt: string | null
}

export function toNotificationDTO(n: Notification): NotificationOutputDTO {
  return {
    id: n.id,
    category: n.category,
    title: n.title,
    body: n.body,
    relatedType: n.relatedType,
    relatedId: n.relatedId,
    read: n.readAt !== null,
    seen: n.seenAt !== null,
    createdAt: iso(n.createdAt),
    readAt: isoOrNull(n.readAt),
  }
}

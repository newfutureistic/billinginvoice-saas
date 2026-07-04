import type { NotificationCategory } from '@prisma/client'
import { dbLogger } from '@/server/db/logger'

/**
 * Notification service INTERFACE (implementation is a later mission). Defining the
 * contract now lets other services depend on it today. A no-op default logs and returns.
 */
export interface NotificationDispatch {
  workspaceId: string
  recipientUserId: string
  category: NotificationCategory
  title: string
  body: string
  relatedType?: string
  relatedId?: string
  channels?: string[]
}

export interface NotificationService {
  /** Fan a domain event out to a recipient across the configured channels. */
  dispatch(event: NotificationDispatch): Promise<void>
}

export class NoopNotificationService implements NotificationService {
  async dispatch(event: NotificationDispatch): Promise<void> {
    dbLogger.debug('notification.dispatch(noop)', {
      category: event.category,
      recipientUserId: event.recipientUserId,
    })
  }
}

export const notificationService: NotificationService = new NoopNotificationService()

import { Prisma, type Notification, type NotificationCategory } from '@prisma/client'
import { BaseRepository } from '@/server/repositories/base.repository'
import { NotFoundError } from '@/server/db/errors'
import {
  buildPageMeta,
  resolvePagination,
  type Paginated,
  type PaginationInput,
} from '@/server/db/utils'

export interface NotificationFilter {
  category?: NotificationCategory
  unreadOnly?: boolean
}

export interface NotificationCreateData {
  workspaceId: string
  recipientUserId: string
  category: NotificationCategory
  title: string
  body: string
  relatedType?: string | null
  relatedId?: string | null
}

/**
 * Per-recipient notification repository. Notifications are scoped to both the workspace
 * and the recipient user, so every query is keyed by `(workspaceId, recipientUserId)` —
 * a user only ever sees their own notifications within the active workspace.
 */
export class NotificationRepository extends BaseRepository {
  private where(
    workspaceId: string,
    recipientUserId: string,
    filter: NotificationFilter = {},
  ): Prisma.NotificationWhereInput {
    return {
      workspaceId,
      recipientUserId,
      ...(filter.category ? { category: filter.category } : {}),
      ...(filter.unreadOnly ? { readAt: null } : {}),
    }
  }

  list(
    workspaceId: string,
    recipientUserId: string,
    filter: NotificationFilter = {},
    pagination?: PaginationInput,
  ): Promise<Paginated<Notification>> {
    const where = this.where(workspaceId, recipientUserId, filter)
    const { page, pageSize, skip, take } = resolvePagination(pagination)
    return this.run(async () => {
      const [total, data] = await Promise.all([
        this.db.notification.count({ where }),
        this.db.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      ])
      return { data, meta: buildPageMeta(total, page, pageSize) }
    })
  }

  unreadCount(workspaceId: string, recipientUserId: string): Promise<number> {
    return this.run(() =>
      this.db.notification.count({ where: { workspaceId, recipientUserId, readAt: null } }),
    )
  }

  async markRead(id: string, recipientUserId: string, when: Date = new Date()): Promise<Notification> {
    const res = await this.run(() =>
      this.db.notification.updateMany({
        where: { id, recipientUserId },
        data: { readAt: when, seenAt: when },
      }),
    )
    if (res.count === 0) throw new NotFoundError('Notification', { id })
    const row = await this.run(() => this.db.notification.findUnique({ where: { id } }))
    if (!row) throw new NotFoundError('Notification', { id })
    return row
  }

  async markAllRead(workspaceId: string, recipientUserId: string, when: Date = new Date()): Promise<number> {
    const res = await this.run(() =>
      this.db.notification.updateMany({
        where: { workspaceId, recipientUserId, readAt: null },
        data: { readAt: when, seenAt: when },
      }),
    )
    return res.count
  }

  create(data: NotificationCreateData): Promise<Notification> {
    return this.run(() =>
      this.db.notification.create({
        data: {
          workspaceId: data.workspaceId,
          recipientUserId: data.recipientUserId,
          category: data.category,
          title: data.title,
          body: data.body,
          relatedType: data.relatedType ?? null,
          relatedId: data.relatedId ?? null,
          channelsSent: [],
        },
      }),
    )
  }
}

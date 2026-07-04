import type { NotificationCategory } from '@prisma/client'
import { BaseService } from '@/server/services/base.service'
import {
  NotificationRepository,
  type NotificationFilter,
} from '@/server/repositories/notification.repository'
import { toNotificationDTO, type NotificationOutputDTO } from '@/lib/dto/notification.dto'
import type { ServiceListResult } from '@/server/services/crud.service'
import type { PaginationInput } from '@/server/db/utils'
import { TenantRequiredError, UnauthenticatedError } from '@/server/errors/app-error'
import type { RequestContext } from '@/server/http/context'

/**
 * Notification feed service (Mission 6). Serves the signed-in user's notifications within
 * the active workspace: list (filterable), unread count, mark one/all read. Also exposes
 * `notify()` so other services can enqueue a notification. Scoped to
 * `(workspaceId, recipientUserId)` throughout — a user never sees another's notifications.
 */
export class NotificationFeedService extends BaseService {
  private readonly wsId: string
  private readonly userId: string
  private readonly repo: NotificationRepository

  constructor(ctx: RequestContext, repo: NotificationRepository = new NotificationRepository()) {
    super(ctx)
    if (!ctx.workspaceId) throw new TenantRequiredError()
    if (!ctx.user) throw new UnauthenticatedError()
    this.wsId = ctx.workspaceId
    this.userId = ctx.user.id
    this.repo = repo
  }

  async list(
    filter: NotificationFilter = {},
    pagination?: PaginationInput,
  ): Promise<ServiceListResult<NotificationOutputDTO>> {
    const page = await this.repo.list(this.wsId, this.userId, filter, pagination)
    return { items: page.data.map(toNotificationDTO), pagination: page.meta }
  }

  unreadCount(): Promise<number> {
    return this.repo.unreadCount(this.wsId, this.userId)
  }

  async markRead(id: string): Promise<NotificationOutputDTO> {
    const row = await this.repo.markRead(id, this.userId)
    this.logger.info('notification.read', { id })
    return toNotificationDTO(row)
  }

  async markAllRead(): Promise<{ updated: number }> {
    const updated = await this.repo.markAllRead(this.wsId, this.userId)
    this.logger.info('notification.read_all', { updated })
    return { updated }
  }

  /** Enqueue a notification for a workspace member (used by other services). */
  async notify(input: {
    recipientUserId: string
    category: NotificationCategory
    title: string
    body: string
    relatedType?: string
    relatedId?: string
  }): Promise<void> {
    await this.repo.create({ workspaceId: this.wsId, ...input })
  }
}

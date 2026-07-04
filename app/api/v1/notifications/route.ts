import { defineRoute } from '@/server/http/handler'
import { NotificationFeedService } from '@/server/services/notification-feed.service'
import {
  notificationListQuerySchema,
  type NotificationListQuery,
} from '@/lib/validation/notification.schema'
import type { NotificationOutputDTO } from '@/lib/dto/notification.dto'
import type { ListResult } from '@/server/http/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/v1/notifications — the signed-in user's notifications in the active workspace. */
export const GET = defineRoute<ListResult<NotificationOutputDTO>, undefined, NotificationListQuery>({
  requireMembership: true,
  schema: { query: notificationListQuerySchema },
  handler: ({ query, ctx }) =>
    new NotificationFeedService(ctx).list(
      { category: query.category, unreadOnly: query.unreadOnly },
      { page: query.page, pageSize: query.pageSize },
    ),
})

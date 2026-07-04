import { defineRoute } from '@/server/http/handler'
import { NotificationFeedService } from '@/server/services/notification-feed.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/v1/notifications/unread-count — badge count for the frozen bell icon. */
export const GET = defineRoute<{ count: number }>({
  requireMembership: true,
  handler: async ({ ctx }) => ({ count: await new NotificationFeedService(ctx).unreadCount() }),
})

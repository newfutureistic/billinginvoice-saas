import { defineRoute } from '@/server/http/handler'
import { NotificationFeedService } from '@/server/services/notification-feed.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** POST /api/v1/notifications/read-all — mark every notification read. */
export const POST = defineRoute<{ updated: number }>({
  requireMembership: true,
  csrf: true,
  handler: ({ ctx }) => new NotificationFeedService(ctx).markAllRead(),
})

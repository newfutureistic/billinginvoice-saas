import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { NotificationFeedService } from '@/server/services/notification-feed.service'
import { idSchema } from '@/lib/validation/common.schema'
import type { NotificationOutputDTO } from '@/lib/dto/notification.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ id: idSchema })
type Params = z.infer<typeof paramsSchema>

/** POST /api/v1/notifications/:id/read — mark a single notification read. */
export const POST = defineRoute<NotificationOutputDTO, undefined, undefined, Params>({
  requireMembership: true,
  schema: { params: paramsSchema },
  csrf: true,
  handler: ({ params, ctx }) => new NotificationFeedService(ctx).markRead(params.id),
})

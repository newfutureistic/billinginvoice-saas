import { defineRoute } from '@/server/http/handler'
import { ToolRepository } from '@/server/repositories/tool.repository'
import { buildPageMeta } from '@/server/db/utils'
import { toToolDTO, type ToolOutputDTO } from '@/lib/dto/tool.dto'
import type { ListResult } from '@/server/http/response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/tools — read-only tool registry listing. Demonstrates a list endpoint:
 * repository read → DTO mapping → standard `{ items, pagination }` list envelope, with
 * rate limiting and CORS applied by the wrapper.
 */
export const GET = defineRoute<ListResult<ToolOutputDTO>>({
  cors: { origin: '*' },
  rateLimit: { limit: 120, windowMs: 60_000 },
  handler: async () => {
    const tools = await new ToolRepository().listActive()
    const items = tools.map(toToolDTO)
    return { items, pagination: buildPageMeta(items.length, 1, Math.max(1, items.length)) }
  },
})

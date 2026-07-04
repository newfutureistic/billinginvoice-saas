import { z } from 'zod'
import { defineRoute } from '@/server/http/handler'
import { ToolRepository } from '@/server/repositories/tool.repository'
import { toToolDTO, type ToolOutputDTO } from '@/lib/dto/tool.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const paramsSchema = z.object({ slug: z.string().min(1).max(80) })

/**
 * GET /api/v1/tools/[slug] — single tool by slug. Demonstrates typed path-param
 * validation and repository `requireBySlug` → 404 via the error funnel when missing.
 */
export const GET = defineRoute<ToolOutputDTO, undefined, undefined, { slug: string }>({
  cors: { origin: '*' },
  schema: { params: paramsSchema },
  handler: async ({ params }) => {
    const tool = await new ToolRepository().requireBySlug(params.slug)
    return toToolDTO(tool)
  },
})

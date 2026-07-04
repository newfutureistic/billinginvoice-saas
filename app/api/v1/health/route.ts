import { defineRoute } from '@/server/http/handler'
import { pingDatabase } from '@/server/db/utils'

// Node runtime (Prisma pg adapter); never statically cached.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface HealthData {
  status: 'ok'
  db: 'up' | 'down'
  version: string
  uptimeSeconds: number
}

/**
 * GET /api/v1/health — system probe demonstrating the full pipeline (request id,
 * security/CORS headers, logging, error envelope) end to end with no tenant required.
 */
export const GET = defineRoute<HealthData>({
  cors: { origin: '*' },
  handler: async () => ({
    status: 'ok',
    db: (await pingDatabase()) ? 'up' : 'down',
    version: 'v1',
    uptimeSeconds: Math.round(process.uptime()),
  }),
})

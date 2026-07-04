import { defineRoute } from '@/server/http/handler'
import { WorkspaceService } from '@/server/services/workspace.service'
import { organizationSettingsSchema } from '@/lib/validation/workspace.schema'
import type { OrganizationSettingsInput } from '@/lib/validation/workspace.schema'
import type { OrganizationOutputDTO } from '@/lib/dto/workspace.dto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * The active workspace's organization profile (WorkspaceSettings), used by the frozen
 * onboarding + settings screens. GET (any member); PATCH requires `settings:manage`.
 */
export const GET = defineRoute<OrganizationOutputDTO | null>({
  permission: 'workspace:read',
  handler: ({ ctx }) => new WorkspaceService(ctx).getOrganization(ctx.workspaceId as string),
})

export const PATCH = defineRoute<OrganizationOutputDTO, OrganizationSettingsInput>({
  permission: 'settings:manage',
  schema: { body: organizationSettingsSchema },
  csrf: true,
  handler: ({ body, ctx }) =>
    new WorkspaceService(ctx).updateOrganization(ctx.workspaceId as string, body),
})

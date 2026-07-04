import { randomBytes } from 'node:crypto'
import type { RequestContext } from '@/server/http/context'
import { runInTransaction } from '@/server/db/transaction'

/**
 * First-workspace bootstrap (AUTH_FLOW.md §3): when a user finishes verification (or
 * signs up via OAuth) with no workspace yet, atomically create their personal
 * workspace, its settings row, an OWNER membership, and — when a FREE plan is seeded —
 * a FREE subscription. Runs in one transaction so a partial tenant never exists.
 */
export interface BootstrapResult {
  workspaceId: string
}

/** Turn a display name into a URL-safe, collision-resistant slug. */
export function personalWorkspaceSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40)
  const suffix = randomBytes(4).toString('hex')
  return `${base || 'workspace'}-${suffix}`
}

export async function bootstrapPersonalWorkspace(
  ctx: RequestContext,
  userId: string,
  displayName: string,
): Promise<BootstrapResult> {
  const name = displayName.trim() || 'My Workspace'
  const slug = personalWorkspaceSlug(name)

  const workspaceId = await runInTransaction(async (tx) => {
    const workspace = await tx.workspace.create({ data: { name, slug } })
    await tx.workspaceSettings.create({ data: { workspaceId: workspace.id } })
    await tx.membership.create({
      data: { userId, workspaceId: workspace.id, role: 'OWNER', status: 'ACTIVE' },
    })

    const freePlan = await tx.plan.findUnique({ where: { tier: 'FREE' } })
    if (freePlan) {
      await tx.subscription.create({
        data: { workspaceId: workspace.id, planId: freePlan.id, planTier: 'FREE' },
      })
    }
    return workspace.id
  })

  ctx.logger.info('workspace.bootstrapped', { userId, workspaceId })
  return { workspaceId }
}

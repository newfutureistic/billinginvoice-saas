import { prisma, type DbClient } from '@/server/db/prisma'
import { BaseRepository } from '@/server/repositories/base.repository'

/**
 * Tenant-scoped repository base.
 *
 * Every workspace-owned model extends this. `scope()` / `activeScope()` inject the
 * `workspaceId` (and, for soft-deletable models, `deletedAt: null`) into every `where`
 * clause, so it is impossible to write a query in a subclass that forgets the tenant
 * boundary — the enforcement lives here, not in each call site.
 *
 * For transactional work, construct a repository with the transaction client:
 *   `new DocumentRepository(workspaceId, tx)`.
 */
export abstract class TenantRepository extends BaseRepository {
  constructor(
    protected readonly workspaceId: string,
    db: DbClient = prisma,
  ) {
    super(db)
  }

  /** Merge the tenant filter into a `where` object. */
  protected scope<W extends object>(where?: W): W & { workspaceId: string } {
    return { ...(where ?? ({} as W)), workspaceId: this.workspaceId } as W & { workspaceId: string }
  }

  /** Merge tenant filter + not-soft-deleted into a `where` object. */
  protected activeScope<W extends object>(
    where?: W,
  ): W & { workspaceId: string; deletedAt: null } {
    return {
      ...(where ?? ({} as W)),
      workspaceId: this.workspaceId,
      deletedAt: null,
    } as W & { workspaceId: string; deletedAt: null }
  }
}

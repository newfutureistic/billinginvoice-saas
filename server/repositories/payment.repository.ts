import { Prisma, type Payment } from '@prisma/client'
import { TenantRepository } from '@/server/repositories/tenant.repository'

/** Create input with the tenant key removed — `workspaceId` is injected by the repo. */
export type PaymentCreateData = Omit<Prisma.PaymentUncheckedCreateInput, 'workspaceId'>

/**
 * Data access for `Payment` + `PaymentAllocation` (Mission — payment engine). Tenant-scoped
 * via {@link TenantRepository}. A payment carries one-or-more allocations against documents;
 * a document's paid amount is the authoritative sum of its allocations.
 */
export class PaymentRepository extends TenantRepository {
  /** Create a payment (with its nested allocations). */
  create(data: PaymentCreateData): Promise<Payment> {
    return this.run(() => this.db.payment.create({ data: { ...data, workspaceId: this.workspaceId } }))
  }

  /** Look up a payment by its idempotency key (tenant-scoped) — gateway de-duplication. */
  findByIdempotencyKey(idempotencyKey: string): Promise<Payment | null> {
    return this.run(() => this.db.payment.findFirst({ where: this.scope({ idempotencyKey }) }))
  }

  /** Payments that have an allocation against a document (newest first) — payment history. */
  listByDocument(documentId: string): Promise<Payment[]> {
    return this.run(() =>
      this.db.payment.findMany({
        where: this.scope({ allocations: { some: { documentId } } }),
        orderBy: { receivedAt: 'desc' },
      }),
    )
  }

  /** Authoritative amount paid against a document = sum of its allocations (tenant-scoped). */
  async sumAllocatedForDocument(documentId: string): Promise<number> {
    const r = await this.run(() =>
      this.db.paymentAllocation.aggregate({
        where: { documentId, payment: { workspaceId: this.workspaceId } },
        _sum: { amount: true },
      }),
    )
    return r._sum.amount ? Number(r._sum.amount) : 0
  }
}

import { Prisma, type Document, type DocumentStatus, type DocumentType } from '@prisma/client'
import { BaseService } from '@/server/services/base.service'
import { AuditService } from '@/server/services/audit.service'
import { ActivityService } from '@/server/services/activity.service'
import {
  DocumentRepository,
  DOCUMENT_SORTABLE,
  type DocumentFilter,
  type DocumentItemCreateData,
} from '@/server/repositories/document.repository'
import { DocumentSequenceRepository } from '@/server/repositories/document-sequence.repository'
import { ToolRepository } from '@/server/repositories/tool.repository'
import { runInTransaction } from '@/server/db/transaction'
import { parseWith } from '@/server/http/middleware/validation'
import { computeDocumentTotals } from '@/server/utils/document-totals'
import { formatDocumentNumber } from '@/server/utils/invoice-number'
import { roundTo } from '@/server/utils/decimal'
import { parseSort } from '@/server/utils/sort'
import { requireOwnership } from '@/server/auth/rbac'
import type { OwnableAction } from '@/server/auth/permissions'
import {
  documentCreateSchema,
  documentUpdateSchema,
  type DocumentCreateInput,
} from '@/lib/validation/document.schema'
import {
  toDocumentDTO,
  toDocumentDetailDTO,
  type DocumentOutputDTO,
  type DocumentDetailDTO,
} from '@/lib/dto/document.dto'
import type { ServiceListResult, ListParams } from '@/server/services/crud.service'
import type { PaginationInput } from '@/server/db/utils'
import {
  AuthorizationError,
  BadRequestError,
  BusinessError,
  NotFoundError,
  TenantRequiredError,
} from '@/server/errors/app-error'
import type { RequestContext } from '@/server/http/context'

/** Per-type numbering prefix (e.g. INV-2026-001, QUO-2026-004). */
const TYPE_PREFIX: Record<DocumentType, string> = {
  INVOICE: 'INV',
  QUOTE: 'QUO',
  RECEIPT: 'RCP',
  CREDIT_NOTE: 'CN',
  SALARY_SLIP: 'SAL',
  PURCHASE_ORDER: 'PO',
  PROPOSAL: 'PRO',
  DELIVERY_NOTE: 'DN',
}

function jsonify(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

function parseDate(value: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new BadRequestError(`Invalid date: ${value}`)
  return date
}

/**
 * Generic document engine (Mission 5 §5). ONE service handles every document type —
 * invoice, quote/estimate, receipt, purchase order, credit note, salary slip — selecting
 * behavior from `DocumentType` rather than duplicating logic per type. It computes totals
 * (shared engine), allocates a gap-free number via `DocumentSequence` in a transaction,
 * persists the document + its line items atomically, enforces per-record ownership for
 * MEMBERs (RBAC `:own`), and records an audit entry + activity-timeline event per mutation.
 */
export class DocumentService extends BaseService {
  private readonly wsId: string
  private readonly repo: DocumentRepository
  private readonly tools: ToolRepository
  private readonly audit: AuditService
  private readonly activity: ActivityService

  constructor(ctx: RequestContext) {
    super(ctx)
    if (!ctx.workspaceId) throw new TenantRequiredError()
    this.wsId = ctx.workspaceId
    this.repo = new DocumentRepository(ctx.workspaceId)
    this.tools = new ToolRepository()
    this.audit = new AuditService(ctx)
    this.activity = new ActivityService(ctx)
  }

  // --- reads ---------------------------------------------------------------

  async get(id: string): Promise<DocumentDetailDTO> {
    const doc = await this.repo.findByIdWithItems(id)
    if (!doc) throw new NotFoundError('Document', { id })
    return toDocumentDetailDTO(doc)
  }

  async list(
    filter: DocumentFilter = {},
    params: ListParams = {},
  ): Promise<ServiceListResult<DocumentOutputDTO>> {
    const sort = parseSort(params.sort, DOCUMENT_SORTABLE, { field: 'issueDate', direction: 'desc' })
    const page = await this.repo.list(filter, params.pagination, sort)
    return { items: page.data.map(toDocumentDTO), pagination: page.meta }
  }

  async listDeleted(
    filter: DocumentFilter = {},
    pagination?: PaginationInput,
  ): Promise<ServiceListResult<DocumentOutputDTO>> {
    const page = await this.repo.listDeleted(filter, pagination)
    return { items: page.data.map(toDocumentDTO), pagination: page.meta }
  }

  // --- create --------------------------------------------------------------

  async create(raw: unknown, opts: { type?: DocumentType } = {}): Promise<DocumentDetailDTO> {
    const input = parseWith(documentCreateSchema, raw)
    const type = input.type ?? opts.type ?? 'INVOICE'

    const tool = (await this.tools.findByOutputType(type)) ?? (await this.tools.firstDocumentTool())
    if (!tool) {
      throw new BusinessError('No document tool is configured; seed the tool registry first.')
    }

    const totals = computeDocumentTotals(
      input.items,
      { rate: input.tax.rate, basis: input.tax.basis },
      input.discount,
      input.shipping,
    )
    const issueDate = parseDate(input.issueDate)
    const dueDate = input.dueDate ? parseDate(input.dueDate) : null
    const period = String(issueDate.getUTCFullYear())

    const discount = input.discount ?? { type: 'fixed', value: 0, applied: false }
    const shipping = input.shipping ?? { cost: 0, applied: false }
    const items = this.buildItems(input)

    const created = await runInTransaction(async (tx) => {
      let number = input.number
      if (!number) {
        const alloc = await new DocumentSequenceRepository(tx).allocate(this.wsId, type, period, {
          prefix: TYPE_PREFIX[type],
          padding: 3,
        })
        number = formatDocumentNumber({
          prefix: alloc.prefix,
          period: alloc.period,
          sequence: alloc.sequence,
          padding: alloc.padding,
        })
      }
      const repo = new DocumentRepository(this.wsId, tx)
      return repo.createWithItems(
        {
          type,
          number,
          status: 'DRAFT',
          issueDate,
          dueDate,
          currency: input.currency,
          issuer: jsonify(input.business),
          recipient: jsonify(input.client),
          clientId: input.clientId ?? null,
          taxConfig: jsonify(input.tax),
          discount: jsonify(discount),
          shipping: jsonify(shipping),
          subtotal: totals.subtotal,
          taxTotal: totals.taxTotal,
          total: totals.total,
          amountPaid: 0,
          notes: input.notes ?? null,
          terms: input.terms ?? null,
          paymentInstructions: input.paymentInstructions ?? null,
          templateId: input.templateId ?? null,
          toolId: tool.id,
          createdById: this.ctx.user?.id ?? null,
        },
        items,
      )
    })

    await this.trace('create', created, `created ${type.toLowerCase()} ${created.number}`)
    return toDocumentDetailDTO(created)
  }

  private buildItems(input: DocumentCreateInput): DocumentItemCreateData[] {
    return input.items.map((it, i) => ({
      description: it.description,
      quantity: it.quantity,
      rate: it.rate,
      unit: it.unit ?? null,
      taxRate: 0,
      amount: roundTo(it.quantity * it.rate),
      position: i,
      productId: null,
    }))
  }

  // --- update / lifecycle --------------------------------------------------

  async update(id: string, raw: unknown): Promise<DocumentDetailDTO> {
    const existing = await this.repo.requireById(id)
    this.assertOwnership('document:update', existing)
    const input = parseWith(documentUpdateSchema, raw)

    const data: Prisma.DocumentUpdateInput = {}
    if (input.issueDate !== undefined) data.issueDate = parseDate(input.issueDate)
    if (input.dueDate !== undefined) data.dueDate = input.dueDate ? parseDate(input.dueDate) : null
    if (input.currency !== undefined) data.currency = input.currency
    if (input.business !== undefined) data.issuer = jsonify(input.business)
    if (input.client !== undefined) data.recipient = jsonify(input.client)
    if (input.notes !== undefined) data.notes = input.notes ?? null
    if (input.terms !== undefined) data.terms = input.terms ?? null
    if (input.paymentInstructions !== undefined) data.paymentInstructions = input.paymentInstructions ?? null
    if (input.templateId !== undefined) {
      data.template = input.templateId ? { connect: { id: input.templateId } } : { disconnect: true }
    }
    if (input.clientId !== undefined) {
      data.client = input.clientId ? { connect: { id: input.clientId } } : { disconnect: true }
    }

    // Financial recompute requires both the new items and the tax config.
    const recompute = input.items !== undefined
    if (recompute && input.tax === undefined) {
      throw new BadRequestError('Updating line items also requires the tax configuration')
    }

    await runInTransaction(async (tx) => {
      const repo = new DocumentRepository(this.wsId, tx)
      if (recompute && input.items && input.tax) {
        const discount = input.discount ?? { type: 'fixed' as const, value: 0, applied: false }
        const shipping = input.shipping ?? { cost: 0, applied: false }
        const totals = computeDocumentTotals(
          input.items,
          { rate: input.tax.rate, basis: input.tax.basis },
          discount,
          shipping,
        )
        data.taxConfig = jsonify(input.tax)
        data.discount = jsonify(discount)
        data.shipping = jsonify(shipping)
        data.subtotal = totals.subtotal
        data.taxTotal = totals.taxTotal
        data.total = totals.total
        await tx.documentItem.deleteMany({ where: { documentId: id } })
        await tx.documentItem.createMany({
          data: this.buildItems({ ...input, items: input.items } as DocumentCreateInput).map((it) => ({
            ...it,
            documentId: id,
          })),
        })
      }
      await repo.update(id, data)
    })

    const updated = await this.repo.findByIdWithItems(id)
    if (!updated) throw new NotFoundError('Document', { id })
    await this.trace('update', updated, `updated ${updated.type.toLowerCase()} ${updated.number}`)
    return toDocumentDetailDTO(updated)
  }

  /** Transition status (send → SENT, accept → ACCEPTED, mark paid → PAID …). */
  async setStatus(id: string, status: DocumentStatus): Promise<DocumentDetailDTO> {
    const existing = await this.repo.requireById(id)
    this.assertOwnership(status === 'SENT' ? 'document:send' : 'document:update', existing)

    const data: Prisma.DocumentUpdateInput = { status }
    if (status === 'PAID') data.amountPaid = existing.total
    await this.repo.update(id, data)

    const updated = await this.repo.findByIdWithItems(id)
    if (!updated) throw new NotFoundError('Document', { id })
    await this.trace('status', updated, `marked ${updated.type.toLowerCase()} ${updated.number} as ${status.toLowerCase()}`)
    return toDocumentDetailDTO(updated)
  }

  async remove(id: string): Promise<void> {
    const existing = await this.repo.requireById(id)
    this.assertOwnership('document:delete', existing)
    await this.repo.softDelete(id)
    await this.trace('delete', existing, `deleted ${existing.type.toLowerCase()} ${existing.number}`, true)
  }

  async restore(id: string): Promise<DocumentDetailDTO> {
    const restored = await this.repo.restore(id)
    const detail = await this.repo.findByIdWithItems(id)
    await this.trace('restore', restored, `restored ${restored.type.toLowerCase()} ${restored.number}`)
    return detail ? toDocumentDetailDTO(detail) : toDocumentDetailDTO({ ...restored, items: [] })
  }

  async hardDelete(id: string): Promise<void> {
    const removed = await this.repo.hardDelete(id)
    this.assertOwnership('document:delete', removed)
    await this.trace('purge', removed, `permanently deleted ${removed.type.toLowerCase()} ${removed.number}`, true)
  }

  // --- helpers -------------------------------------------------------------

  private assertOwnership(action: OwnableAction, doc: Document): void {
    const { role, user } = this.ctx
    if (!role || !user) throw new AuthorizationError('Workspace membership context is required')
    requireOwnership(role, action, doc.createdById, user.id)
  }

  private async trace(action: string, doc: Document, summary: string, removed = false): Promise<void> {
    await this.audit.record({
      action: `document.${action}`,
      targetType: 'Document',
      targetId: doc.id,
      after: removed ? undefined : (toDocumentDTO(doc) as unknown as Record<string, unknown>),
    })
    await this.activity.record({
      verb: action,
      summary,
      relatedType: 'Document',
      relatedId: doc.id,
    })
  }
}

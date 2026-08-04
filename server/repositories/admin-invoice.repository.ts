import { Prisma } from '@prisma/client'
import { BaseRepository } from '@/server/repositories/base.repository'

export type AdminDocumentRow = Prisma.DocumentGetPayload<{
  include: {
    createdBy: { select: { id: true; name: true; email: true } }
    workspace: { select: { id: true; name: true } }
    pdfFile: { select: { id: true; bucket: true; path: true } }
  }
}>

export type AdminDownloadLogRow = Prisma.InvoiceDownloadLogGetPayload<{
  include: { user: { select: { id: true; name: true; email: true } } }
}>

/**
 * Cross-workspace invoice activity for the site-admin "All Invoices" view. Deliberately
 * NOT a `TenantRepository` — every other document/file repository is scoped to one
 * workspace, but this one intentionally reads across all of them (like
 * `UserRepository.listAllWithInvoiceCounts`).
 */
export class AdminInvoiceRepository extends BaseRepository {
  /** Saved, dashboard-created invoices (any workspace), most recent first. */
  listDocuments(take: number): Promise<AdminDocumentRow[]> {
    return this.run(() =>
      this.db.document.findMany({
        where: { deletedAt: null },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          workspace: { select: { id: true, name: true } },
          pdfFile: { select: { id: true, bucket: true, path: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
      }),
    )
  }

  /** PDFs downloaded from the public, no-signup builder — guest or signed-in. */
  listDownloadLogs(take: number): Promise<AdminDownloadLogRow[]> {
    return this.run(() =>
      this.db.invoiceDownloadLog.findMany({
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take,
      }),
    )
  }

  findDocumentById(id: string): Promise<AdminDocumentRow | null> {
    return this.run(() =>
      this.db.document.findUnique({
        where: { id },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          workspace: { select: { id: true, name: true } },
          pdfFile: { select: { id: true, bucket: true, path: true } },
        },
      }),
    )
  }

  findDownloadLogById(id: string): Promise<AdminDownloadLogRow | null> {
    return this.run(() =>
      this.db.invoiceDownloadLog.findUnique({
        where: { id },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
    )
  }
}

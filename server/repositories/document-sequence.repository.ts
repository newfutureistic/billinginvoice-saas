import { type DocumentType } from '@prisma/client'
import { BaseRepository } from '@/server/repositories/base.repository'

export interface AllocatedNumber {
  sequence: number
  prefix: string
  padding: number
  period: string
}

/**
 * Gap-free document-number allocation via the `DocumentSequence` table.
 *
 * `nextValue` always holds the *next* number to hand out. Allocation must run inside a
 * transaction (construct this repository with the `tx` client) so the read-and-increment
 * is atomic and two concurrent documents never collide on `@@unique([workspaceId,number])`.
 */
export class DocumentSequenceRepository extends BaseRepository {
  async allocate(
    workspaceId: string,
    documentType: DocumentType,
    period: string,
    opts: { prefix: string; padding: number },
  ): Promise<AllocatedNumber> {
    const existing = await this.run(() =>
      this.db.documentSequence.findUnique({
        where: { workspaceId_documentType_period: { workspaceId, documentType, period } },
      }),
    )

    if (!existing) {
      const created = await this.run(() =>
        this.db.documentSequence.create({
          data: {
            workspaceId,
            documentType,
            period,
            prefix: opts.prefix,
            padding: opts.padding,
            nextValue: 2, // we hand out 1 now; the next is 2
          },
        }),
      )
      return { sequence: 1, prefix: created.prefix, padding: created.padding, period }
    }

    await this.run(() =>
      this.db.documentSequence.update({
        where: { id: existing.id },
        data: { nextValue: { increment: 1 } },
      }),
    )
    return {
      sequence: existing.nextValue,
      prefix: existing.prefix,
      padding: existing.padding,
      period,
    }
  }
}

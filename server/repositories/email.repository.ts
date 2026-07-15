import { type EmailMessage, type EmailKind, type EmailStatus } from '@prisma/client'
import { BaseRepository } from '@/server/repositories/base.repository'

export interface EmailCreateData {
  workspaceId?: string | null
  toEmail: string
  kind: EmailKind
  templateKey: string
  relatedType?: string | null
  relatedId?: string | null
  provider?: string | null
  status?: EmailStatus
}

/**
 * Email-log repository (`EmailMessage`). Every send is recorded (queued → sent/failed)
 * for deliverability auditing. Not tenant-scoped — auth emails (verify/reset) are sent
 * before any workspace exists, so `workspaceId` is optional.
 */
export class EmailRepository extends BaseRepository {
  create(data: EmailCreateData): Promise<EmailMessage> {
    return this.run(() =>
      this.db.emailMessage.create({
        data: {
          workspaceId: data.workspaceId ?? null,
          toEmail: data.toEmail,
          kind: data.kind,
          templateKey: data.templateKey,
          relatedType: data.relatedType ?? null,
          relatedId: data.relatedId ?? null,
          provider: data.provider ?? null,
          status: data.status ?? 'QUEUED',
        },
      }),
    )
  }

  updateStatus(
    id: string,
    status: EmailStatus,
    opts: { providerMessageId?: string; sentAt?: Date } = {},
  ): Promise<EmailMessage> {
    return this.run(() =>
      this.db.emailMessage.update({
        where: { id },
        data: {
          status,
          ...(opts.providerMessageId ? { providerMessageId: opts.providerMessageId } : {}),
          ...(opts.sentAt ? { sentAt: opts.sentAt } : {}),
        },
      }),
    )
  }
}

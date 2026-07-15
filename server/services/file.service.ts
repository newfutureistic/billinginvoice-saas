import { randomBytes } from 'node:crypto'
import type { FileKind, FileObject, PlanTier } from '@prisma/client'
import { BaseService } from '@/server/services/base.service'
import { AuditService } from '@/server/services/audit.service'
import { FileRepository } from '@/server/repositories/file.repository'
import { storageService, type StorageService } from '@/server/services/storage.service'
import { prisma } from '@/server/db/prisma'
import { getIntegrationsEnv } from '@/server/config/env'
import { toFileDTO, type FileOutputDTO } from '@/lib/dto/file.dto'
import {
  BadRequestError,
  BusinessError,
  TenantRequiredError,
  ValidationError,
} from '@/server/errors/app-error'
import type { RequestContext } from '@/server/http/context'

const MB = 1024 * 1024
const GB = 1024 * MB

const PLAN_STORAGE_LIMIT: Record<PlanTier, number> = {
  FREE: 100 * MB,
  PRO: 5 * GB,
  BUSINESS: 50 * GB,
}

const IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']

interface KindRule {
  mimes: string[]
  maxBytes: number
  folder: string
}

const KIND_RULES: Record<FileKind, KindRule> = {
  LOGO: { mimes: IMAGE_MIMES, maxBytes: 2 * MB, folder: 'logos' },
  AVATAR: { mimes: IMAGE_MIMES, maxBytes: 2 * MB, folder: 'avatars' },
  INVOICE_PDF: { mimes: ['application/pdf'], maxBytes: 25 * MB, folder: 'documents' },
  DOCUMENT_PDF: { mimes: ['application/pdf'], maxBytes: 25 * MB, folder: 'documents' },
  EXPORT: { mimes: ['text/csv', 'application/pdf'], maxBytes: 25 * MB, folder: 'exports' },
  ATTACHMENT: { mimes: [...IMAGE_MIMES, 'application/pdf'], maxBytes: 25 * MB, folder: 'attachments' },
  QR: { mimes: ['image/png', 'image/svg+xml'], maxBytes: 2 * MB, folder: 'generated' },
  BARCODE: { mimes: ['image/png', 'image/svg+xml'], maxBytes: 2 * MB, folder: 'generated' },
}

const MIME_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'text/csv': 'csv',
}

export interface CreateUploadInput {
  kind: FileKind
  mimeType: string
  sizeBytes: number
  checksum?: string
}

export interface UploadTicket {
  fileId: string
  bucket: string
  path: string
  uploadUrl: string
  token: string
  expiresInSeconds: number
}

export interface CommitInput {
  fileId: string
  path: string
  kind: FileKind
  mimeType: string
  sizeBytes: number
  checksum?: string
}

export interface DownloadUrl {
  url: string
  expiresInSeconds: number
}

/**
 * File service (Mission 7). The tenant-aware brain over the bytes-level
 * {@link StorageService}: it validates the mime allow-list + per-kind size caps + per-plan
 * quota, builds tenant-prefixed keys (`{workspaceId}/{folder}/{fileId}.{ext}`), mints
 * direct-to-storage upload URLs, and records every object as a `FileObject` (the source of
 * truth). `storeBuffer` is the server-side path used by the PDF and QR engines.
 */
export class FileService extends BaseService {
  private readonly wsId: string
  private readonly repo: FileRepository
  private readonly storage: StorageService
  private readonly audit: AuditService

  constructor(ctx: RequestContext, storage: StorageService = storageService) {
    super(ctx)
    if (!ctx.workspaceId) throw new TenantRequiredError()
    this.wsId = ctx.workspaceId
    this.repo = new FileRepository(ctx.workspaceId)
    this.storage = storage
    this.audit = new AuditService(ctx)
  }

  private get bucket(): string {
    return getIntegrationsEnv().STORAGE_BUCKET
  }

  private ruleFor(kind: FileKind): KindRule {
    return KIND_RULES[kind]
  }

  private extFor(mimeType: string): string {
    return MIME_EXT[mimeType] ?? 'bin'
  }

  private pathFor(kind: FileKind, fileId: string, mimeType: string): string {
    return `${this.wsId}/${this.ruleFor(kind).folder}/${fileId}.${this.extFor(mimeType)}`
  }

  private newFileId(): string {
    return `file_${randomBytes(16).toString('hex')}`
  }

  /** Validate mime + size against the kind's rules. */
  private validateKind(kind: FileKind, mimeType: string, sizeBytes: number): void {
    const rule = this.ruleFor(kind)
    if (!rule.mimes.includes(mimeType)) {
      throw new ValidationError('Unsupported file type', {
        mimeType: `Allowed for ${kind}: ${rule.mimes.join(', ')}`,
      })
    }
    if (sizeBytes <= 0 || sizeBytes > rule.maxBytes) {
      throw new ValidationError('File too large', {
        sizeBytes: `Max ${Math.round(rule.maxBytes / MB)}MB for ${kind}`,
      })
    }
  }

  /** Enforce the per-plan total-storage quota before accepting new bytes. */
  private async enforceQuota(sizeBytes: number): Promise<void> {
    const subscription = await prisma.subscription.findUnique({ where: { workspaceId: this.wsId } })
    const limit = PLAN_STORAGE_LIMIT[subscription?.planTier ?? 'FREE']
    const used = await this.repo.totalBytes()
    if (used + sizeBytes > limit) {
      throw new BusinessError('Storage quota exceeded for your plan', {
        details: { usedBytes: used, limitBytes: limit },
      })
    }
  }

  // --- direct-to-storage upload (sign → PUT → commit) ----------------------

  async createUploadUrl(input: CreateUploadInput): Promise<UploadTicket> {
    this.validateKind(input.kind, input.mimeType, input.sizeBytes)
    await this.enforceQuota(input.sizeBytes)

    const fileId = this.newFileId()
    const path = this.pathFor(input.kind, fileId, input.mimeType)
    const signed = await this.storage.createUploadUrl(this.bucket, path)
    return {
      fileId,
      bucket: this.bucket,
      path: signed.path,
      uploadUrl: signed.url,
      token: signed.token,
      expiresInSeconds: getIntegrationsEnv().SIGNED_URL_TTL_SEC,
    }
  }

  async commit(input: CommitInput): Promise<FileOutputDTO> {
    this.validateKind(input.kind, input.mimeType, input.sizeBytes)
    if (!input.path.startsWith(`${this.wsId}/`)) {
      throw new BadRequestError('File path is outside this workspace')
    }
    const present = await this.storage.exists(this.bucket, input.path)
    if (!present) throw new BadRequestError('Uploaded object was not found; upload it first')

    const file = await this.repo.create({
      id: input.fileId,
      kind: input.kind,
      bucket: this.bucket,
      path: input.path,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      checksum: input.checksum ?? null,
      createdById: this.ctx.user?.id ?? null,
    })
    await this.audit.record({
      action: 'file.uploaded',
      targetType: 'FileObject',
      targetId: file.id,
      after: { kind: file.kind, sizeBytes: file.sizeBytes },
    })
    return toFileDTO(file)
  }

  // --- server-side generated files (PDF / QR) ------------------------------

  /** Upload generated bytes + record the `FileObject`. Returns the row. */
  async storeBuffer(
    kind: FileKind,
    bytes: Uint8Array,
    opts: { mimeType: string; checksum?: string },
  ): Promise<FileObject> {
    this.validateKind(kind, opts.mimeType, bytes.byteLength)
    const fileId = this.newFileId()
    const path = this.pathFor(kind, fileId, opts.mimeType)
    await this.storage.upload(this.bucket, path, bytes, opts.mimeType)
    return this.repo.create({
      id: fileId,
      kind,
      bucket: this.bucket,
      path,
      mimeType: opts.mimeType,
      sizeBytes: bytes.byteLength,
      checksum: opts.checksum ?? null,
      createdById: this.ctx.user?.id ?? null,
    })
  }

  // --- serving + deletion --------------------------------------------------

  async getDownloadUrl(fileId: string): Promise<DownloadUrl> {
    const file = await this.repo.requireById(fileId)
    const url = await this.storage.createSignedUrl(file.bucket, file.path)
    return { url, expiresInSeconds: getIntegrationsEnv().SIGNED_URL_TTL_SEC }
  }

  async delete(fileId: string): Promise<void> {
    const file = await this.repo.requireById(fileId)
    await this.storage.remove(file.bucket, file.path).catch(() => undefined)
    await this.repo.delete(fileId)
    await this.audit.record({
      action: 'file.deleted',
      targetType: 'FileObject',
      targetId: fileId,
      before: { kind: file.kind, sizeBytes: file.sizeBytes },
    })
  }
}

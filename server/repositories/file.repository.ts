import { Prisma, type FileObject, type FileKind } from '@prisma/client'
import { TenantRepository } from '@/server/repositories/tenant.repository'
import { NotFoundError } from '@/server/db/errors'

export interface FileCreateData {
  id?: string
  kind: FileKind
  bucket: string
  path: string
  mimeType: string
  sizeBytes: number
  checksum?: string | null
  createdById?: string | null
}

/**
 * File metadata repository. Every stored object has a `FileObject` row — the source of
 * truth the app resolves through (never a raw storage path). Tenant-scoped: `FileObject`
 * has no soft-delete column, so removal is permanent and `scope()` (workspaceId) guards
 * every read/write.
 */
export class FileRepository extends TenantRepository {
  findById(id: string): Promise<FileObject | null> {
    return this.run(() =>
      this.db.fileObject.findFirst({ where: this.scope<Prisma.FileObjectWhereInput>({ id }) }),
    )
  }

  async requireById(id: string): Promise<FileObject> {
    const file = await this.findById(id)
    if (!file) throw new NotFoundError('File', { id })
    return file
  }

  create(data: FileCreateData): Promise<FileObject> {
    const input: Prisma.FileObjectUncheckedCreateInput = {
      ...(data.id ? { id: data.id } : {}),
      workspaceId: this.workspaceId,
      kind: data.kind,
      bucket: data.bucket,
      path: data.path,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
      checksum: data.checksum ?? null,
      createdById: data.createdById ?? null,
    }
    return this.run(() => this.db.fileObject.create({ data: input }))
  }

  async delete(id: string): Promise<FileObject> {
    const existing = await this.requireById(id)
    await this.run(() => this.db.fileObject.delete({ where: { id } }))
    return existing
  }

  listByKind(kind: FileKind): Promise<FileObject[]> {
    return this.run(() =>
      this.db.fileObject.findMany({
        where: this.scope<Prisma.FileObjectWhereInput>({ kind }),
        orderBy: { createdAt: 'desc' },
      }),
    )
  }

  /** Total bytes stored by the workspace — for quota enforcement. */
  async totalBytes(): Promise<number> {
    const result = await this.run(() =>
      this.db.fileObject.aggregate({
        where: this.scope<Prisma.FileObjectWhereInput>({}),
        _sum: { sizeBytes: true },
      }),
    )
    return result._sum.sizeBytes ?? 0
  }
}

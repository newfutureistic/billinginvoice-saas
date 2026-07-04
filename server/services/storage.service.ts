import type { FileKind } from '@prisma/client'
import { NotImplementedError } from '@/server/errors/app-error'

/**
 * Storage service INTERFACE (implementation is a later mission — Supabase Storage).
 * Defining it now lets file-producing services depend on a stable contract. The default
 * implementation refuses calls with a 501 so nothing silently pretends to store files.
 */
export interface SignedUpload {
  url: string
  fileId: string
  path: string
  expiresAt: number
}

export interface UploadRequest {
  workspaceId: string
  kind: FileKind
  mimeType: string
  sizeBytes: number
}

export interface StorageService {
  getUploadUrl(input: UploadRequest): Promise<SignedUpload>
  getSignedUrl(fileId: string, expiresInSeconds?: number): Promise<string>
  delete(fileId: string): Promise<void>
}

export class UnavailableStorageService implements StorageService {
  async getUploadUrl(): Promise<SignedUpload> {
    throw new NotImplementedError('Storage is not configured in this mission')
  }
  async getSignedUrl(): Promise<string> {
    throw new NotImplementedError('Storage is not configured in this mission')
  }
  async delete(): Promise<void> {
    throw new NotImplementedError('Storage is not configured in this mission')
  }
}

export const storageService: StorageService = new UnavailableStorageService()

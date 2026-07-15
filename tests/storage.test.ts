import { test } from 'node:test'
import assert from 'node:assert/strict'
import { UnavailableStorageService, type StorageService } from '@/server/services/storage.service'
import { isStorageEnabled, isEmailEnabled, getIntegrationsEnv } from '@/server/config/env'
import {
  fileUploadRequestSchema,
  fileCommitConfirmSchema,
  qrGenerateSchema,
} from '@/lib/validation/file.schema'

test('integration flags reflect env presence; defaults always resolve', () => {
  const env = getIntegrationsEnv()
  // Defaults resolve regardless of configuration.
  assert.ok(env.STORAGE_BUCKET.length > 0)
  assert.ok(env.EMAIL_FROM.length > 0)
  // The enabled flags are a pure function of which vars are set (env-agnostic assertion).
  assert.equal(
    isStorageEnabled(),
    Boolean(env.SUPABASE_URL && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY)),
  )
  assert.equal(isEmailEnabled(), Boolean(env.RESEND_API_KEY))
})

test('UnavailableStorageService refuses writes but reports not-enabled cleanly', async () => {
  const s: StorageService = new UnavailableStorageService()
  assert.equal(s.isEnabled(), false)
  assert.equal(await s.exists('bucket', 'path'), false)
  await assert.rejects(() => s.createUploadUrl('bucket', 'path'))
  await assert.rejects(() => s.createSignedUrl('bucket', 'path'))
  await assert.rejects(() => s.upload('bucket', 'path', new Uint8Array(), 'application/pdf'))
})

test('file upload/commit/QR schemas validate', () => {
  assert.equal(
    fileUploadRequestSchema.safeParse({ kind: 'LOGO', mimeType: 'image/png', sizeBytes: 1000 }).success,
    true,
  )
  assert.equal(
    fileUploadRequestSchema.safeParse({ kind: 'NOPE', mimeType: 'x', sizeBytes: 1 }).success,
    false,
  )
  assert.equal(
    fileCommitConfirmSchema.safeParse({
      fileId: 'file_abc',
      path: 'ws1/logos/file_abc.png',
      kind: 'LOGO',
      mimeType: 'image/png',
      sizeBytes: 1234,
    }).success,
    true,
  )
  const qr = qrGenerateSchema.parse({ data: 'https://x' })
  assert.equal(qr.size, 256)
  assert.equal(qr.format, 'png')
  assert.equal(qr.store, false)
})

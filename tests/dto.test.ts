import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { Client } from '@prisma/client'

import { toClientDTO } from '@/lib/dto/client.dto'
import { iso, isoOrNull } from '@/lib/dto/common.dto'

test('common: iso / isoOrNull', () => {
  const d = new Date('2024-01-01T00:00:00.000Z')
  assert.equal(iso(d), '2024-01-01T00:00:00.000Z')
  assert.equal(isoOrNull(null), null)
  assert.equal(isoOrNull(d), '2024-01-01T00:00:00.000Z')
})

test('toClientDTO: maps model → JSON-safe DTO with ISO dates', () => {
  const now = new Date('2024-06-01T12:00:00.000Z')
  const client: Client = {
    id: 'c1',
    workspaceId: 'w1',
    name: 'Acme',
    email: 'billing@acme.com',
    phone: null,
    address: null,
    taxId: null,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }
  const dto = toClientDTO(client)
  assert.deepEqual(dto, {
    id: 'c1',
    name: 'Acme',
    email: 'billing@acme.com',
    phone: null,
    address: null,
    taxId: null,
    status: 'active',
    createdAt: '2024-06-01T12:00:00.000Z',
    updatedAt: '2024-06-01T12:00:00.000Z',
  })
  // DTO must not leak the tenant key
  assert.equal('workspaceId' in dto, false)
})

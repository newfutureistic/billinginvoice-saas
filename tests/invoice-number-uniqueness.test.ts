import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DocumentRepository } from '@/server/repositories/document.repository'

/**
 * Uniqueness is expressed entirely by the WHERE clause `findByNumber` builds, so we assert that
 * predicate against a stubbed Prisma client. This pins the four rules that matter:
 *   - scoped to the current workspace  (numbers may repeat across workspaces)
 *   - `deletedAt: null`                (a soft-deleted invoice must not reserve its number)
 *   - `NOT: { id }` when editing       (an invoice never conflicts with itself)
 *   - no exclusion on create
 */
function stub() {
  const calls: Array<Record<string, unknown>> = []
  const db = {
    document: {
      findFirst: (args: Record<string, unknown>) => {
        calls.push(args)
        return Promise.resolve(null)
      },
    },
  }
  return { db, calls }
}

const whereOf = (calls: Array<Record<string, unknown>>) =>
  calls[0].where as Record<string, unknown>

test('uniqueness: create scopes to workspace and ignores soft-deleted rows', async () => {
  const { db, calls } = stub()
  const repo = new DocumentRepository('ws-1', db as never)
  await repo.findByNumber('INV-2024-001')
  const where = whereOf(calls)
  assert.equal(where.number, 'INV-2024-001')
  assert.equal(where.workspaceId, 'ws-1')
  assert.equal(where.deletedAt, null, 'soft-deleted invoices must not block number reuse')
  assert.ok(!('NOT' in where), 'create must not exclude any document')
})

test('uniqueness: editing excludes the document being edited', async () => {
  const { db, calls } = stub()
  const repo = new DocumentRepository('ws-1', db as never)
  await repo.findByNumber('INV-2024-001', 'doc-9')
  const where = whereOf(calls)
  assert.deepEqual(where.NOT, { id: 'doc-9' }, 'an invoice must not conflict with itself')
  assert.equal(where.deletedAt, null)
  assert.equal(where.workspaceId, 'ws-1')
})

test('uniqueness: a different workspace never sees another workspace’s numbers', async () => {
  const a = stub()
  const b = stub()
  await new DocumentRepository('ws-A', a.db as never).findByNumber('INV-001')
  await new DocumentRepository('ws-B', b.db as never).findByNumber('INV-001')
  assert.equal(whereOf(a.calls).workspaceId, 'ws-A')
  assert.equal(whereOf(b.calls).workspaceId, 'ws-B')
  assert.notEqual(whereOf(a.calls).workspaceId, whereOf(b.calls).workspaceId)
})

test('uniqueness: a duplicate hit is surfaced (non-null result)', async () => {
  const db = {
    document: { findFirst: () => Promise.resolve({ id: 'existing', number: 'INV-001' }) },
  }
  const repo = new DocumentRepository('ws-1', db as never)
  const clash = await repo.findByNumber('INV-001')
  assert.ok(clash, 'an existing live document with the same number must be returned')
})

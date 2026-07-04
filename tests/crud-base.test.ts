import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { z } from 'zod'
import { TenantCrudService, type CrudRepository } from '@/server/services/crud.service'
import { buildPageMeta, type Paginated, type PaginationInput } from '@/server/db/utils'
import type { SortInput } from '@/server/utils/sort'
import type { AuditService } from '@/server/services/audit.service'
import type { ActivityService } from '@/server/services/activity.service'
import { disconnectPrisma } from '@/server/db/prisma'
import { testContext } from './fakes'

after(async () => {
  await disconnectPrisma().catch(() => undefined)
})

interface Widget {
  id: string
  name: string
  createdAt: Date
}
type WidgetDTO = { id: string; name: string }
type WidgetCreate = { name: string }
type WidgetUpdate = { name?: string }

/** In-memory repository implementing the full CRUD + recycle-bin contract. */
class FakeWidgetRepo implements CrudRepository<Widget, unknown, WidgetCreate, WidgetUpdate> {
  rows: Widget[] = []
  deleted: Widget[] = []
  private seq = 0

  async findById(id: string) {
    return this.rows.find((w) => w.id === id) ?? null
  }
  async requireById(id: string) {
    const w = await this.findById(id)
    if (!w) throw new Error('not found')
    return w
  }
  async list(_f?: unknown, _p?: PaginationInput, _s?: SortInput): Promise<Paginated<Widget>> {
    return { data: [...this.rows], meta: buildPageMeta(this.rows.length, 1, 20) }
  }
  async count() {
    return this.rows.length
  }
  async create(data: WidgetCreate) {
    const w: Widget = { id: `w${++this.seq}`, name: data.name, createdAt: new Date() }
    this.rows.push(w)
    return w
  }
  async update(id: string, data: WidgetUpdate) {
    const w = await this.requireById(id)
    if (data.name !== undefined) w.name = data.name
    return w
  }
  async softDelete(id: string) {
    const i = this.rows.findIndex((w) => w.id === id)
    const [w] = this.rows.splice(i, 1)
    this.deleted.push(w)
    return w
  }
  async restore(id: string) {
    const i = this.deleted.findIndex((w) => w.id === id)
    const [w] = this.deleted.splice(i, 1)
    this.rows.push(w)
    return w
  }
  async hardDelete(id: string) {
    let i = this.rows.findIndex((w) => w.id === id)
    if (i >= 0) return this.rows.splice(i, 1)[0]
    i = this.deleted.findIndex((w) => w.id === id)
    return this.deleted.splice(i, 1)[0]
  }
  async listDeleted(): Promise<Paginated<Widget>> {
    return { data: [...this.deleted], meta: buildPageMeta(this.deleted.length, 1, 20) }
  }
}

const auditActions: string[] = []
const activityVerbs: string[] = []
const audit = { record: async (e: { action: string }) => void auditActions.push(e.action) } as unknown as AuditService
const activity = { record: async (e: { verb: string }) => void activityVerbs.push(e.verb) } as unknown as ActivityService

class WidgetService extends TenantCrudService<
  Widget,
  WidgetDTO,
  WidgetCreate,
  WidgetUpdate,
  WidgetCreate,
  WidgetUpdate,
  unknown
> {
  protected readonly repo: FakeWidgetRepo
  protected readonly createSchema = z.object({ name: z.string().min(1) })
  protected readonly updateSchema = z.object({ name: z.string().min(1).optional() })
  protected readonly resource = 'Widget'
  protected readonly sortable = ['name', 'createdAt'] as const

  constructor(repo: FakeWidgetRepo) {
    super(testContext({ user: { id: 'u1', email: 'u@x.com', name: 'U', image: null }, workspaceId: 'ws1' }), {
      audit,
      activity,
    })
    this.repo = repo
  }
  protected toDTO(w: Widget): WidgetDTO {
    return { id: w.id, name: w.name }
  }
  protected toCreateData(i: WidgetCreate) {
    return i
  }
  protected toUpdateData(i: WidgetUpdate) {
    return i
  }
  protected entityId(w: Widget) {
    return w.id
  }
  protected entityLabel(w: Widget) {
    return w.name
  }
}

test('CRUD base: full audited lifecycle (create → update → soft delete → restore → purge)', async () => {
  auditActions.length = 0
  activityVerbs.length = 0
  const repo = new FakeWidgetRepo()
  const service = new WidgetService(repo)

  const created = await service.create({ name: 'Alpha' })
  assert.equal(created.name, 'Alpha')
  assert.equal(repo.rows.length, 1)

  const updated = await service.update(created.id, { name: 'Beta' })
  assert.equal(updated.name, 'Beta')

  await service.remove(created.id)
  assert.equal(repo.rows.length, 0)
  assert.equal(repo.deleted.length, 1)

  const deletedList = await service.listDeleted()
  assert.equal(deletedList.items.length, 1)

  const restored = await service.restore(created.id)
  assert.equal(restored.name, 'Beta')
  assert.equal(repo.rows.length, 1)

  await service.hardDelete(created.id)
  assert.equal(repo.rows.length, 0)
  assert.equal(repo.deleted.length, 0)

  // Every mutation emitted an audit action + an activity verb.
  assert.deepEqual(auditActions, [
    'widget.create',
    'widget.update',
    'widget.delete',
    'widget.restore',
    'widget.purge',
  ])
  assert.deepEqual(activityVerbs, ['created', 'updated', 'deleted', 'restored', 'permanently deleted'])
})

test('CRUD base: create validates via the Zod schema', async () => {
  const service = new WidgetService(new FakeWidgetRepo())
  await assert.rejects(() => service.create({ name: '' }))
})

test('CRUD base: list maps rows to DTOs with pagination', async () => {
  const repo = new FakeWidgetRepo()
  const service = new WidgetService(repo)
  await service.create({ name: 'One' })
  await service.create({ name: 'Two' })
  const page = await service.list(undefined, { sort: 'name' })
  assert.equal(page.items.length, 2)
  assert.equal(page.pagination.total, 2)
  assert.deepEqual(
    page.items.map((w) => w.name),
    ['One', 'Two'],
  )
})

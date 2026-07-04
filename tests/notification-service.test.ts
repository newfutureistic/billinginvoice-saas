import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import type { Notification, NotificationCategory } from '@prisma/client'
import { NotificationFeedService } from '@/server/services/notification-feed.service'
import type {
  NotificationRepository,
  NotificationFilter,
  NotificationCreateData,
} from '@/server/repositories/notification.repository'
import { buildPageMeta, type Paginated, type PaginationInput } from '@/server/db/utils'
import { disconnectPrisma } from '@/server/db/prisma'
import { testContext } from './fakes'

after(async () => {
  await disconnectPrisma().catch(() => undefined)
})

let seq = 0
class FakeNotificationRepo {
  rows: Notification[] = []

  add(recipientUserId: string, workspaceId: string, read = false): Notification {
    const now = new Date()
    const row: Notification = {
      id: `n${++seq}`,
      workspaceId,
      recipientUserId,
      category: 'SYSTEM' as NotificationCategory,
      title: 'Hello',
      body: 'World',
      relatedType: null,
      relatedId: null,
      channelsSent: [],
      seenAt: read ? now : null,
      readAt: read ? now : null,
      createdAt: now,
    }
    this.rows.push(row)
    return row
  }

  private scoped(workspaceId: string, userId: string, filter: NotificationFilter = {}) {
    return this.rows.filter(
      (r) =>
        r.workspaceId === workspaceId &&
        r.recipientUserId === userId &&
        (!filter.category || r.category === filter.category) &&
        (!filter.unreadOnly || r.readAt === null),
    )
  }

  async list(
    workspaceId: string,
    userId: string,
    filter: NotificationFilter = {},
    _p?: PaginationInput,
  ): Promise<Paginated<Notification>> {
    const data = this.scoped(workspaceId, userId, filter)
    return { data, meta: buildPageMeta(data.length, 1, 20) }
  }
  async unreadCount(workspaceId: string, userId: string) {
    return this.scoped(workspaceId, userId, { unreadOnly: true }).length
  }
  async markRead(id: string, userId: string) {
    const row = this.rows.find((r) => r.id === id && r.recipientUserId === userId)
    if (!row) throw new Error('not found')
    row.readAt = new Date()
    row.seenAt = new Date()
    return row
  }
  async markAllRead(workspaceId: string, userId: string) {
    const unread = this.scoped(workspaceId, userId, { unreadOnly: true })
    unread.forEach((r) => {
      r.readAt = new Date()
      r.seenAt = new Date()
    })
    return unread.length
  }
  async create(_data: NotificationCreateData): Promise<Notification> {
    return this.add('u1', 'ws1')
  }
}

function makeService(repo: FakeNotificationRepo) {
  const ctx = testContext({ user: { id: 'u1', email: 'u@x.com', name: 'U', image: null }, workspaceId: 'ws1' })
  return new NotificationFeedService(ctx, repo as unknown as NotificationRepository)
}

test('lists only the recipient + workspace scoped notifications', async () => {
  const repo = new FakeNotificationRepo()
  repo.add('u1', 'ws1')
  repo.add('u1', 'ws1', true)
  repo.add('u2', 'ws1') // other user
  repo.add('u1', 'ws2') // other workspace
  const service = makeService(repo)

  const list = await service.list()
  assert.equal(list.items.length, 2)
  assert.equal(await service.unreadCount(), 1)
})

test('unreadOnly filter narrows results', async () => {
  const repo = new FakeNotificationRepo()
  repo.add('u1', 'ws1')
  repo.add('u1', 'ws1', true)
  const service = makeService(repo)
  const unread = await service.list({ unreadOnly: true })
  assert.equal(unread.items.length, 1)
})

test('markRead + markAllRead clear the unread count', async () => {
  const repo = new FakeNotificationRepo()
  const a = repo.add('u1', 'ws1')
  repo.add('u1', 'ws1')
  const service = makeService(repo)

  assert.equal(await service.unreadCount(), 2)
  const read = await service.markRead(a.id)
  assert.equal(read.read, true)
  assert.equal(await service.unreadCount(), 1)

  const result = await service.markAllRead()
  assert.equal(result.updated, 1)
  assert.equal(await service.unreadCount(), 0)
})

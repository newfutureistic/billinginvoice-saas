'use client'

import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/lib/api/hooks/use-notifications'
import { Bell, CheckCircle } from 'lucide-react'

export default function NotificationsPage() {
  const { data, isPending, isError } = useNotifications()
  const markAll = useMarkAllNotificationsRead()
  const markOne = useMarkNotificationRead()
  const notifications = data?.items ?? []

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="mt-2 text-muted-foreground">Manage your notifications and alerts.</p>
        </div>
        <button
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending || notifications.every((n) => n.read)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          <CheckCircle className="size-4" />
          Mark All as Read
        </button>
      </div>

      <div className="max-w-2xl space-y-2">
        {isPending ? (
          [0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg border border-border bg-muted/40" />)
        ) : isError ? (
          <div className="p-8 text-center text-sm text-destructive">Could not load notifications.</div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-12">
            <Bell className="mb-4 size-8 text-muted-foreground" />
            <p className="text-foreground font-medium">No notifications</p>
            <p className="text-muted-foreground text-sm">You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-lg border p-4 transition-colors hover:bg-muted/30 ${
                notif.read ? 'border-border bg-card' : 'border-brand/30 bg-brand/5'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${notif.read ? 'bg-muted' : 'bg-brand'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{notif.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{notif.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(notif.createdAt).toLocaleString()}</p>
                </div>
                {!notif.read && (
                  <button
                    onClick={() => markOne.mutate(notif.id)}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

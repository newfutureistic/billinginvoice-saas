'use client'

import { mockNotifications } from '@/lib/dashboard-data'
import { Bell, CheckCircle } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="mt-2 text-muted-foreground">Manage your notifications and alerts.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm hover:bg-muted">
          <CheckCircle className="size-4" />
          Mark All as Read
        </button>
      </div>

      <div className="max-w-2xl space-y-2">
        {mockNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-12">
            <Bell className="mb-4 size-8 text-muted-foreground" />
            <p className="text-foreground font-medium">No notifications</p>
            <p className="text-muted-foreground text-sm">You're all caught up!</p>
          </div>
        ) : (
          mockNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-lg border p-4 transition-colors hover:bg-muted/30 ${
                notif.read
                  ? 'border-border bg-card'
                  : 'border-brand/30 bg-brand/5'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${
                  notif.read ? 'bg-muted' : 'bg-brand'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{notif.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{notif.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{notif.timestamp}</p>
                </div>
                <button className="text-xs font-medium text-muted-foreground hover:text-foreground whitespace-nowrap">
                  Dismiss
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

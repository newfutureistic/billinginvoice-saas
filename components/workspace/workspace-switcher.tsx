'use client'

import { useState } from 'react'

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false)
  const [current] = useState('Acme Corporation')
  const workspaces = ['Acme Corporation', 'Personal', 'Freelance']

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
      >
        <span>{current}</span>
        <span className="text-xs">⌄</span>
      </button>

      {open && (
        <div className="absolute top-12 left-0 w-56 rounded-lg border border-border bg-card shadow-lg z-50 p-2">
          <div className="mb-2 border-b border-border pb-2 px-2">
            <p className="text-xs font-semibold text-muted-foreground">Workspaces</p>
          </div>
          {workspaces.map((ws) => (
            <button
              key={ws}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                ws === current
                  ? 'bg-brand/10 text-brand font-medium'
                  : 'text-foreground hover:bg-secondary'
              }`}
            >
              {ws}
            </button>
          ))}
          <div className="mt-2 border-t border-border pt-2">
            <button className="w-full px-3 py-2 rounded-md text-sm text-brand font-medium hover:bg-brand/10 transition-colors">
              + Create workspace
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function WorkspaceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8">
        <h2 className="text-xl font-semibold text-foreground mb-2">Workspace settings</h2>
        <p className="text-sm text-muted-foreground mb-6">Manage your workspace and team</p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Workspace name</label>
            <input
              type="text"
              defaultValue="Acme Corporation"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Invite members</label>
            <input
              type="email"
              placeholder="member@example.com"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

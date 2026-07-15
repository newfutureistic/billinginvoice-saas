'use client'

import { useMemo, useState } from 'react'
import { DataTable, StatusBadge } from '@/components/dashboard/dashboard-cards'
import { useMembers, useInviteMember } from '@/lib/api/hooks/use-members'
import { ApiError } from '@/lib/api/errors'
import { Plus, Search, X } from 'lucide-react'

const INVITABLE_ROLES = ['ADMIN', 'MANAGER', 'MEMBER', 'VIEWER'] as const

export default function TeamPage() {
  const { data, isPending, isError } = useMembers()
  const invite = useInviteMember()
  const [showInvite, setShowInvite] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<(typeof INVITABLE_ROLES)[number]>('MEMBER')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const rows = useMemo(() => {
    const members = data?.items ?? []
    const q = search.trim().toLowerCase()
    return members
      .filter((m) => !q || (m.name ?? '').toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
      .map((m) => ({
        name: m.name || m.email.split('@')[0],
        email: m.email,
        role: m.role,
        status: m.status,
        joinedDate: new Date(m.joinedAt).toLocaleDateString(),
      }))
  }, [data, search])

  async function submitInvite(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    if (!email.includes('@')) {
      setError('Enter a valid email address')
      return
    }
    try {
      await invite.mutateAsync({ email: email.trim(), role })
      setNotice(`Invitation sent to ${email.trim()}`)
      setEmail('')
      setShowInvite(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send the invitation')
    }
  }

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team</h1>
          <p className="mt-2 text-muted-foreground">Manage your team members and their permissions.</p>
        </div>
        <button
          onClick={() => {
            setShowInvite((s) => !s)
            setError(null)
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90"
        >
          {showInvite ? <X className="size-5" /> : <Plus className="size-5" />}
          {showInvite ? 'Close' : 'Invite Member'}
        </button>
      </div>

      {notice && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-2 text-sm text-success" role="status">
          {notice}
        </p>
      )}

      {showInvite && (
        <form onSubmit={submitInvite} className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <h2 className="text-lg font-semibold text-foreground">Invite a team member</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@company.com"
                required
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="sm:w-48">
              <label className="text-sm font-medium text-foreground">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as (typeof INVITABLE_ROLES)[number])}
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {INVITABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={invite.isPending}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
            >
              {invite.isPending ? 'Sending…' : 'Send invite'}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </form>
      )}

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team members..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        {isPending ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading members…</div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-destructive">Could not load team members.</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {search ? 'No members match your search.' : 'No team members yet. Invite someone to get started.'}
          </div>
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role', render: (value) => <StatusBadge status={value as string} /> },
              { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value as string} /> },
              { key: 'joinedDate', label: 'Joined' },
            ]}
            data={rows}
          />
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Role Permissions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Permission</th>
                <th className="px-4 py-3 text-center font-semibold">Admin</th>
                <th className="px-4 py-3 text-center font-semibold">Manager</th>
                <th className="px-4 py-3 text-center font-semibold">Member</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ['Create Invoices', true, true, true],
                  ['View Invoices', true, true, true],
                  ['Edit Invoices', true, true, true],
                  ['Delete Invoices', true, true, false],
                  ['Manage Clients', true, true, true],
                  ['Manage Team', true, false, false],
                  ['View Analytics', true, true, false],
                  ['Change Settings', true, false, false],
                ] as [string, boolean, boolean, boolean][]
              ).map(([perm, admin, manager, member]) => (
                <tr key={perm} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-foreground">{perm}</td>
                  <td className="px-4 py-3 text-center">{admin ? '✓' : '—'}</td>
                  <td className="px-4 py-3 text-center">{manager ? '✓' : '—'}</td>
                  <td className="px-4 py-3 text-center">{member ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

'use client'

import { mockTeamMembers } from '@/lib/dashboard-data'
import { DataTable, StatusBadge } from '@/components/dashboard/dashboard-cards'
import { Plus, Search } from 'lucide-react'

export default function TeamPage() {
  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team</h1>
          <p className="mt-2 text-muted-foreground">Manage your team members and their permissions.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90">
          <Plus className="size-5" />
          Invite Member
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search team members..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>

        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            {
              key: 'role',
              label: 'Role',
              render: (value) => <StatusBadge status={value as string} />,
            },
            {
              key: 'status',
              label: 'Status',
              render: (value) => <StatusBadge status={value as string} />,
            },
            { key: 'joinedDate', label: 'Joined' },
          ]}
          data={mockTeamMembers}
        />
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
                <th className="px-4 py-3 text-center font-semibold">User</th>
              </tr>
            </thead>
            <tbody>
              {[
                'Create Invoices',
                'View Invoices',
                'Edit Invoices',
                'Delete Invoices',
                'Manage Clients',
                'Manage Team',
                'View Analytics',
                'Change Settings',
              ].map((perm) => (
                <tr key={perm} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3 text-foreground">{perm}</td>
                  <td className="px-4 py-3 text-center">✓</td>
                  <td className="px-4 py-3 text-center">✓</td>
                  <td className="px-4 py-3 text-center">✓</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

'use client'

import { mockUserProfile } from '@/lib/dashboard-data'

export default function ProfilePage() {
  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="mt-2 text-muted-foreground">Manage your personal information and preferences.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Header */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-2xl font-bold text-brand-foreground">
              {mockUserProfile.avatar}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{mockUserProfile.name}</h2>
              <p className="text-muted-foreground">{mockUserProfile.role}</p>
              <button className="mt-4 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
                Change Avatar
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Personal Information</h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground">First Name</label>
                <input
                  type="text"
                  defaultValue="Sarah"
                  className="mt-2 w-full rounded-lg border border-border bg-muted/30 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Last Name</label>
                <input
                  type="text"
                  defaultValue="Johnson"
                  className="mt-2 w-full rounded-lg border border-border bg-muted/30 px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                defaultValue={mockUserProfile.email}
                className="mt-2 w-full rounded-lg border border-border bg-muted/30 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Phone</label>
              <input
                type="tel"
                defaultValue={mockUserProfile.phone}
                className="mt-2 w-full rounded-lg border border-border bg-muted/30 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Company</label>
              <input
                type="text"
                defaultValue={mockUserProfile.company}
                className="mt-2 w-full rounded-lg border border-border bg-muted/30 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Timezone</label>
              <select className="mt-2 w-full rounded-lg border border-border bg-muted/30 px-3 py-2">
                <option>{mockUserProfile.timezone}</option>
                <option>America/Chicago</option>
                <option>America/Denver</option>
              </select>
            </div>
            <button className="mt-6 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90">
              Save Changes
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Current Password</label>
              <input
                type="password"
                className="mt-2 w-full rounded-lg border border-border bg-muted/30 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">New Password</label>
              <input
                type="password"
                className="mt-2 w-full rounded-lg border border-border bg-muted/30 px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <input
                type="password"
                className="mt-2 w-full rounded-lg border border-border bg-muted/30 px-3 py-2"
              />
            </div>
            <button className="mt-6 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

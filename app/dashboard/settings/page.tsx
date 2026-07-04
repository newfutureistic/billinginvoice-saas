'use client'

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your account and application settings.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Sidebar */}
        <div className="rounded-lg border border-border bg-card p-4">
          <nav className="space-y-1">
            {[
              { label: 'General', active: true },
              { label: 'Billing', active: false },
              { label: 'Notifications', active: false },
              { label: 'Security', active: false },
              { label: 'Integrations', active: false },
              { label: 'API Keys', active: false },
            ].map((item) => (
              <button
                key={item.label}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-brand/10 text-brand'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
            <h2 className="mb-4 text-lg font-semibold text-foreground">General Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Company Name</label>
                <input
                  type="text"
                  defaultValue="ToolForge Co"
                  className="mt-2 w-full rounded-lg border border-border bg-muted/30 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  defaultValue="info@toolforge.com"
                  className="mt-2 w-full rounded-lg border border-border bg-muted/30 px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Timezone</label>
                <select className="mt-2 w-full rounded-lg border border-border bg-muted/30 px-3 py-2">
                  <option>America/New_York</option>
                  <option>America/Chicago</option>
                  <option>America/Denver</option>
                  <option>America/Los_Angeles</option>
                </select>
              </div>
              <button className="mt-6 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90">
                Save Changes
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-destructive">Danger Zone</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              These actions are irreversible. Please proceed with caution.
            </p>
            <button className="rounded-lg border border-destructive bg-destructive/10 px-4 py-2 font-medium text-destructive hover:bg-destructive/20">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

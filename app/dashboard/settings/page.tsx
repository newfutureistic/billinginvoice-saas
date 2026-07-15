'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { useWorkspaceSettings, useUpdateWorkspaceSettings } from '@/lib/api/hooks/use-workspaces'
import { ApiError } from '@/lib/api/errors'

const TABS = ['General', 'Billing', 'Notifications', 'Security', 'Integrations', 'API Keys'] as const
type Tab = (typeof TABS)[number]

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AED', 'AUD', 'CAD', 'SGD', 'CHF', 'JPY', 'NZD', 'SAR', 'QAR']

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('General')
  const { data: settings } = useWorkspaceSettings()
  const update = useUpdateWorkspaceSettings()

  const [legalName, setLegalName] = useState('')
  const [email, setEmail] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [brandColor, setBrandColor] = useState('#4f46e5')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Populate the form once real settings load.
  useEffect(() => {
    if (!settings) return
    setLegalName(settings.legalName ?? '')
    setEmail(settings.email ?? '')
    setCurrency(settings.defaultCurrency ?? 'USD')
    setBrandColor(settings.brandColor ?? '#4f46e5')
  }, [settings])

  async function saveGeneral(e: React.FormEvent) {
    e.preventDefault()
    setNotice(null)
    setError(null)
    try {
      await update.mutateAsync({
        legalName: legalName.trim() || undefined,
        email: email.trim() || undefined,
        defaultCurrency: currency as never,
        brandColor,
      })
      setNotice('Your changes have been saved.')
      window.setTimeout(() => setNotice(null), 4000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save settings')
    }
  }

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
            {TABS.map((label) => (
              <button
                key={label}
                onClick={() => setTab(label)}
                aria-current={tab === label ? 'page' : undefined}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  tab === label ? 'bg-brand/10 text-brand' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {tab === 'General' && (
            <>
              <form onSubmit={saveGeneral} className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
                <h2 className="mb-4 text-lg font-semibold text-foreground">General Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Company Name</label>
                    <input
                      type="text"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      placeholder="Your business name"
                      className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Billing Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="billing@company.com"
                      className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-foreground">Default Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Brand Color</label>
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="mt-2 h-10 w-16 cursor-pointer rounded-lg border border-border bg-background"
                        aria-label="Brand color"
                      />
                    </div>
                  </div>
                  {notice && (
                    <div
                      className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success"
                      role="status"
                    >
                      <CheckCircle2 className="size-5 shrink-0" />
                      {notice}
                    </div>
                  )}
                  {error && (
                    <div
                      className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
                      role="alert"
                    >
                      <AlertCircle className="size-5 shrink-0" />
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={update.isPending}
                    className="mt-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
                  >
                    {update.isPending ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>

              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
                <h2 className="mb-4 text-lg font-semibold text-destructive">Danger Zone</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  These actions are irreversible. Please proceed with caution.
                </p>
                <button
                  onClick={() =>
                    setNotice(
                      window.confirm('Deleting your account is permanent. Contact support to proceed.')
                        ? 'Account deletion must be confirmed by support — we’ve noted your request.'
                        : null,
                    )
                  }
                  className="rounded-lg border border-destructive bg-destructive/10 px-4 py-2 font-medium text-destructive hover:bg-destructive/20"
                >
                  Delete Account
                </button>
              </div>
            </>
          )}

          {tab === 'Billing' && (
            <SettingsPanel title="Billing">
              <p className="text-sm text-muted-foreground">
                You are on the <strong className="text-foreground">Free</strong> plan. Upgrade for unlimited documents,
                custom branding, and team roles.
              </p>
              <a
                href="/pricing"
                className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand/90"
              >
                View plans
              </a>
            </SettingsPanel>
          )}

          {tab === 'Notifications' && (
            <SettingsPanel title="Notifications">
              <div className="space-y-3">
                {['Invoice paid', 'Payment failed', 'Weekly summary'].map((n) => (
                  <label key={n} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{n}</span>
                    <input type="checkbox" defaultChecked className="size-4 accent-[var(--brand)]" />
                  </label>
                ))}
              </div>
            </SettingsPanel>
          )}

          {tab === 'Security' && (
            <SettingsPanel title="Security">
              <p className="text-sm text-muted-foreground">Manage how you sign in and protect your account.</p>
              <a
                href="/auth/forgot-password"
                className="mt-4 inline-flex rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Change password
              </a>
            </SettingsPanel>
          )}

          {tab === 'Integrations' && (
            <SettingsPanel title="Integrations">
              <ul className="space-y-3 text-sm">
                <IntegrationRow name="Razorpay (payments)" enabled={false} />
                <IntegrationRow name="Resend (email)" enabled={false} />
              </ul>
            </SettingsPanel>
          )}

          {tab === 'API Keys' && (
            <SettingsPanel title="API Keys">
              <p className="text-sm text-muted-foreground">
                Programmatic API access is not enabled for this workspace. Contact support to request keys.
              </p>
            </SettingsPanel>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  )
}

function IntegrationRow({ name, enabled }: { name: string; enabled: boolean }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
      <span className="text-foreground">{name}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          enabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
        }`}
      >
        {enabled ? 'Connected' : 'Not configured'}
      </span>
    </li>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Check } from 'lucide-react'

/** A small invoice-shaped thumbnail rendered from the template's own colors, so each looks distinct. */
function TemplateThumb({ colors }: { colors: unknown }) {
  const c = colors && typeof colors === 'object' ? (colors as Record<string, string>) : {}
  const primary = c.primary || '#4f46e5'
  const accent = c.accent || primary
  const bg = c.background || '#ffffff'
  const text = c.text || '#111827'
  return (
    <div className="mb-4 h-32 overflow-hidden rounded-lg border border-border p-3" style={{ background: bg }}>
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 rounded" style={{ background: primary }} />
        <div className="h-2 w-8 rounded" style={{ background: `${text}33` }} />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-1.5 w-full rounded" style={{ background: `${text}22` }} />
        <div className="h-1.5 w-4/5 rounded" style={{ background: `${text}22` }} />
        <div className="h-1.5 w-2/3 rounded" style={{ background: `${text}22` }} />
      </div>
      <div className="mt-3 flex justify-end">
        <div className="h-3 w-14 rounded" style={{ background: accent }} />
      </div>
    </div>
  )
}
import { useTemplates, useCreateTemplate, useSetDefaultTemplate } from '@/lib/api/hooks/use-templates'
import { ApiError } from '@/lib/api/errors'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 50) || 'template'
}

export default function TemplatesPage() {
  const router = useRouter()
  const { data, isPending, isError } = useTemplates()
  const create = useCreateTemplate()
  const setDefault = useSetDefaultTemplate()

  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [primary, setPrimary] = useState('#4f46e5')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const templates = data?.items ?? []

  async function useTemplate(id: string, tName: string) {
    setError(null)
    try {
      await setDefault.mutateAsync(id)
      setNotice(`“${tName}” is now your default template.`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not set this template as default')
    }
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    if (!name.trim()) {
      setError('Enter a template name')
      return
    }
    try {
      await create.mutateAsync({
        key: `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim(),
        colors: { primary, accent: primary, text: '#111827', background: '#ffffff' },
      })
      setNotice(`Template “${name.trim()}” created.`)
      setName('')
      setShowCreate(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create the template')
    }
  }

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates</h1>
          <p className="mt-2 text-muted-foreground">Manage your invoice templates.</p>
        </div>
        <button
          onClick={() => {
            setShowCreate((s) => !s)
            setError(null)
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90"
        >
          {showCreate ? <X className="size-5" /> : <Plus className="size-5" />}
          {showCreate ? 'Close' : 'Create Template'}
        </button>
      </div>

      {notice && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-4 py-2 text-sm text-success" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {showCreate && (
        <form onSubmit={submitCreate} className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <h2 className="text-lg font-semibold text-foreground">New template</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Studio Invoice"
                required
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Brand color</label>
              <input
                type="color"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="mt-2 h-10 w-16 cursor-pointer rounded-lg border border-border bg-background"
                aria-label="Brand color"
              />
            </div>
            <button
              type="submit"
              disabled={create.isPending}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
            >
              {create.isPending ? 'Creating…' : 'Create template'}
            </button>
          </div>
        </form>
      )}

      {isPending ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-lg border border-border bg-card" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-destructive">
          Could not load templates.
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No templates yet. Create your first one.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-brand hover:shadow-token-xs"
            >
              <TemplateThumb colors={template.colors} />
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{template.name}</h3>
                {template.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                    <Check className="size-3" /> Default
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{template.description || 'Invoice template'}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => useTemplate(template.id, template.name)}
                  disabled={setDefault.isPending || template.isDefault}
                  className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  {template.isDefault ? 'In use' : setDefault.isPending ? 'Setting…' : 'Use Template'}
                </button>
                <button
                  onClick={() => router.push(`/invoice/new?template=${template.key}`)}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

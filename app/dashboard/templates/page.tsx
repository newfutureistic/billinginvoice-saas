'use client'

import { mockTemplates } from '@/lib/dashboard-data'
import { Grid2x2, Plus } from 'lucide-react'

export default function TemplatesPage() {
  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates</h1>
          <p className="mt-2 text-muted-foreground">Manage your invoice templates.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90">
          <Plus className="size-5" />
          Create Template
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mockTemplates.map((template) => (
          <div
            key={template.id}
            className="group cursor-pointer rounded-lg border border-border bg-card p-4 hover:border-brand hover:shadow-token-xs transition-all"
          >
            <div className="mb-4 flex h-32 items-center justify-center rounded-lg border border-border bg-muted/50 group-hover:bg-muted">
              <Grid2x2 className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground">{template.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
            <p className="mt-3 text-xs text-muted-foreground">{template.used} invoices created</p>
            <button className="mt-4 w-full rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

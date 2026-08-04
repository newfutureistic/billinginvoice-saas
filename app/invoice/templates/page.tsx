import type { Metadata } from 'next'
import { INVOICE_TEMPLATES } from '@/lib/invoice-templates'
import { buildMetadata } from '@/lib/seo'
import Link from 'next/link'

export const metadata: Metadata = buildMetadata({
  title: 'Invoice Templates — Free Professional Designs',
  description: 'Choose a professional invoice template — modern, classic, minimal, and more. Free to use, no signup required to start.',
  path: '/invoice/templates',
})

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link href="/invoice" className="text-brand hover:underline text-sm mb-4 inline-block">
            ← Back to Invoices
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Invoice Templates</h1>
          <p className="text-muted-foreground">Choose a professional design for your invoice</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {INVOICE_TEMPLATES.map((template) => (
            <Link
              key={template.id}
              href="/invoice/new"
              className="group p-6 rounded-lg border-2 border-border hover:border-brand hover:bg-brand/5 transition-all"
            >
              <div
                className="h-32 rounded mb-4 flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: template.colors.background, color: template.colors.text }}
              >
                <div className="text-center">
                  <div
                    className="text-xl font-bold mb-2"
                    style={{ color: template.colors.primary }}
                  >
                    {template.name}
                  </div>
                  <p style={{ color: template.colors.text }} className="text-xs opacity-70">
                    Preview
                  </p>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-brand transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-muted-foreground">{template.description}</p>
              <button className="mt-3 w-full py-2 rounded-lg border border-brand text-brand text-sm font-medium hover:bg-brand/10 transition-colors">
                Use Template
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

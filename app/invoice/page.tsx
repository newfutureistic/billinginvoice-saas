import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'

export default function InvoiceHubPage() {
  const recentInvoices = [
    { id: '1', number: 'INV-2024-001', client: 'Acme Corp', amount: 8550, status: 'draft' },
    { id: '2', number: 'INV-2024-002', client: 'Tech Startup', amount: 5200, status: 'sent' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Invoices</h1>
          <p className="text-muted-foreground">Create, manage, and track your invoices</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link
            href="/invoice/new"
            className="p-6 rounded-lg border-2 border-brand bg-brand/5 hover:bg-brand/10 transition-colors flex items-center justify-between group"
          >
            <div>
              <h3 className="font-semibold text-foreground mb-1">Create Invoice</h3>
              <p className="text-sm text-muted-foreground">Start from scratch</p>
            </div>
            <Plus className="h-5 w-5 text-brand group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/invoice/templates"
            className="p-6 rounded-lg border-2 border-border hover:border-brand hover:bg-brand/5 transition-colors flex items-center justify-between group"
          >
            <div>
              <h3 className="font-semibold text-foreground mb-1">Templates</h3>
              <p className="text-sm text-muted-foreground">Choose a design</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-brand group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/invoice/preview"
            className="p-6 rounded-lg border-2 border-border hover:border-brand hover:bg-brand/5 transition-colors flex items-center justify-between group"
          >
            <div>
              <h3 className="font-semibold text-foreground mb-1">Preview</h3>
              <p className="text-sm text-muted-foreground">See your invoice</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-brand group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* Recent Invoices */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Invoices</h2>
          <div className="space-y-2">
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-4 rounded-lg border border-border hover:border-brand hover:bg-brand/5 transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="font-medium text-foreground">{inv.number}</p>
                  <p className="text-sm text-muted-foreground">{inv.client}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${inv.amount}</p>
                  <p className={`text-xs font-medium ${inv.status === 'draft' ? 'text-warning' : 'text-success'}`}>
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {recentInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No invoices yet. Create your first one!</p>
            <Link
              href="/invoice/new"
              className="inline-block px-6 py-2 rounded-lg bg-brand text-brand-foreground font-medium hover:bg-brand-muted transition-colors"
            >
              Create Invoice
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

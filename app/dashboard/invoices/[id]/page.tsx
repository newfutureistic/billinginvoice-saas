'use client'

import { mockInvoices } from '@/lib/dashboard-data'
import { StatusBadge } from '@/components/dashboard/dashboard-cards'
import { ArrowLeft, Download, Eye, Send } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const invoice = mockInvoices.find((i) => i.id === params.id)

  if (!invoice) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8 min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Invoice Not Found</h1>
          <p className="mt-2 text-muted-foreground">The invoice you're looking for doesn't exist.</p>
          <Link
            href="/dashboard/invoices"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90"
          >
            <ArrowLeft className="size-4" />
            Back to Invoices
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-brand hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-medium hover:bg-muted">
            <Eye className="size-4" />
            Preview
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-medium hover:bg-muted">
            <Send className="size-4" />
            Send
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90">
            <Download className="size-4" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-8 shadow-token-xs">
          {/* Invoice Preview */}
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Invoice</h1>
                <p className="mt-2 text-muted-foreground">{invoice.number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Invoice Date</p>
                <p className="text-foreground">{invoice.date}</p>
                <p className="mt-4 text-sm font-medium text-foreground">Due Date</p>
                <p className="text-foreground">{invoice.dueDate}</p>
              </div>
            </div>

            {/* From/To */}
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">From</p>
                <div className="mt-2 space-y-1">
                  <p className="font-semibold text-foreground">ToolForge Co</p>
                  <p className="text-sm text-muted-foreground">123 Business St</p>
                  <p className="text-sm text-muted-foreground">New York, NY 10001</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">To</p>
                <div className="mt-2 space-y-1">
                  <p className="font-semibold text-foreground">{invoice.client}</p>
                  <p className="text-sm text-muted-foreground">billing@client.com</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                    <th className="px-4 py-3 text-center font-semibold">Qty</th>
                    <th className="px-4 py-3 text-right font-semibold">Price</th>
                    <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3">Professional Invoice Template</td>
                    <td className="px-4 py-3 text-center">1</td>
                    <td className="px-4 py-3 text-right">$2,500</td>
                    <td className="px-4 py-3 text-right">$2,500</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Design Services</td>
                    <td className="px-4 py-3 text-center">10</td>
                    <td className="px-4 py-3 text-right">$150</td>
                    <td className="px-4 py-3 text-right">$1,500</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Consultation Hours</td>
                    <td className="px-4 py-3 text-center">5</td>
                    <td className="px-4 py-3 text-right">$200</td>
                    <td className="px-4 py-3 text-right">$1,000</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-80 space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">$5,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="font-medium">$500</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-brand">${invoice.amount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs h-fit">
          <h3 className="font-semibold text-foreground">Invoice Details</h3>
          <div className="mt-6 space-y-4">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Status</p>
              <div className="mt-2">
                <StatusBadge status={invoice.status} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Amount</p>
              <p className="mt-2 text-2xl font-bold text-foreground">${invoice.amount}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Invoice Number</p>
              <p className="mt-2 font-mono text-sm">{invoice.number}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

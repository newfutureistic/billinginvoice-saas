'use client'

import { InvoicePreview } from '@/components/invoice/invoice-preview'
import { MOCK_INVOICE } from '@/lib/invoice-state'
import { useState } from 'react'
import Link from 'next/link'
import { Download, Printer, Share2, Copy, Check } from 'lucide-react'

export default function PreviewPage() {
  const [mode, setMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-full px-6 py-4 flex items-center justify-between">
          <div>
            <Link href="/invoice" className="text-brand hover:underline text-sm mb-2 inline-block">
              ← Back to Invoices
            </Link>
            <h1 className="text-2xl font-bold text-foreground">{MOCK_INVOICE.invoiceNumber}</h1>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded hover:bg-secondary transition-colors" title="Print">
              <Printer className="h-5 w-5 text-foreground" />
            </button>
            <button className="p-2 rounded hover:bg-secondary transition-colors" title="Download PDF">
              <Download className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded hover:bg-secondary transition-colors"
              title="Copy link"
            >
              {copied ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <Copy className="h-5 w-5 text-foreground" />
              )}
            </button>
            <button className="p-2 rounded hover:bg-secondary transition-colors" title="Share">
              <Share2 className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Device Mode Selector */}
        <div className="flex items-center gap-2 px-6 py-2 border-t border-border">
          {(['mobile', 'tablet', 'desktop'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                mode === m
                  ? 'bg-brand text-brand-foreground'
                  : 'border border-border hover:bg-secondary'
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-hidden">
        <InvoicePreview invoice={MOCK_INVOICE} mode={mode} />
      </div>
    </div>
  )
}

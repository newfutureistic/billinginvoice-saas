'use client'

import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const lineItems = [
  { desc: 'Brand identity system', qty: 1, rate: 4200 },
  { desc: 'Website design — 8 pages', qty: 8, rate: 650 },
  { desc: 'Design tokens & handoff', qty: 1, rate: 1800 },
]

const subtotal = lineItems.reduce((s, i) => s + i.qty * i.rate, 0)
const taxRate = 0.08
const tax = subtotal * taxRate
const total = subtotal + tax

function money(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function InvoicePreview() {
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setPaid(true), 1400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative">
      {/* Floating status chip */}
      <div
        className={cn(
          'absolute -right-3 -top-3 z-20 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 shadow-token-lg transition-all duration-500 sm:-right-5',
          paid ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
        )}
      >
        <span className="flex size-4 items-center justify-center rounded-full bg-success text-success-foreground">
          <Check className="size-2.5" strokeWidth={3} />
        </span>
        <span className="text-xs font-medium text-foreground">Paid in full</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-token-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-[0.7rem] font-semibold text-primary-foreground">
                SM
              </span>
              <span className="text-sm font-semibold text-foreground">Studio Meridian</span>
            </div>
            <p className="mt-2 font-mono text-xs text-muted-foreground">INV-2048</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Total due</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-foreground tabular-nums">
              {money(total)}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-4 px-6 py-4 text-xs">
          <div>
            <p className="text-muted-foreground">Billed to</p>
            <p className="mt-1 font-medium text-foreground">Northwind Co.</p>
            <p className="text-muted-foreground">accounts@northwind.com</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Issued</p>
            <p className="mt-1 font-medium text-foreground">Jun 12, 2026</p>
            <p className="text-muted-foreground">Due Jun 26, 2026</p>
          </div>
        </div>

        {/* Line items */}
        <div className="px-6 pb-2">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border pb-2 text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Amount</span>
          </div>
          {lineItems.map((item, i) => (
            <div
              key={item.desc}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border/60 py-3 text-sm last:border-0"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="text-foreground">{item.desc}</span>
              <span className="text-right tabular-nums text-muted-foreground">{item.qty}</span>
              <span className="text-right font-medium tabular-nums text-foreground">
                {money(item.qty * item.rate)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1.5 border-t border-border px-6 py-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{money(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax (8%)</span>
            <span className="tabular-nums">{money(tax)}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold text-foreground">
            <span>Total</span>
            <span className="tabular-nums">{money(total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

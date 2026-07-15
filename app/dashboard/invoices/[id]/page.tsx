'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Copy, Pencil, Trash2, Send, CheckCircle2, Plus, Receipt, Download, Mail } from 'lucide-react'
import { StatusBadge } from '@/components/dashboard/dashboard-cards'
import { useDocument, useDeleteDocument, useSetDocumentStatus } from '@/lib/api/hooks/use-documents'
import { useDocumentPayments, useRecordPayment, useDownloadReceipt, useEmailReceipt } from '@/lib/api/hooks/use-payments'
import { documentToInvoiceData } from '@/lib/invoice-document'
import { RazorpayCheckoutButton } from '@/components/invoice/razorpay-checkout-button'
import { formatMoney } from '@/lib/currency-format'
import { ApiError } from '@/lib/api/errors'

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'NEFT_RTGS', label: 'NEFT / RTGS' },
  { value: 'CARD', label: 'Card' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'WALLET', label: 'Wallet' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'OTHER', label: 'Other' },
]

function jstr(json: unknown, key: string): string {
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    const v = (json as Record<string, unknown>)[key]
    if (typeof v === 'string') return v
  }
  return ''
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: doc, isPending, isError } = useDocument(id)
  const del = useDeleteDocument()
  const status = useSetDocumentStatus()
  const payments = useDocumentPayments(id)
  const record = useRecordPayment(id ?? '')
  const downloadReceipt = useDownloadReceipt(id ?? '')
  const emailReceipt = useEmailReceipt(id ?? '')
  const [receiptNotice, setReceiptNotice] = useState<string | null>(null)
  const [showPayForm, setShowPayForm] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState('CASH')
  const [payRef, setPayRef] = useState('')
  const [payDate, setPayDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [payErr, setPayErr] = useState<string | null>(null)

  const money = (n: number) => formatMoney(doc?.currency ?? 'USD', n)

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault()
    setPayErr(null)
    const amt = parseFloat(payAmount)
    if (!amt || amt <= 0) {
      setPayErr('Enter a valid amount')
      return
    }
    try {
      await record.mutateAsync({
        amount: amt,
        method: payMethod as never,
        reference: payRef.trim() || undefined,
        receivedAt: payDate ? new Date(payDate).toISOString() : undefined,
      })
      setShowPayForm(false)
      setPayAmount('')
      setPayRef('')
    } catch (err) {
      setPayErr(err instanceof ApiError ? err.message : 'Could not record payment')
    }
  }

  async function handleDelete() {
    if (!id) return
    if (!confirm('Delete this invoice? You can restore it later from the recycle bin.')) return
    await del.mutateAsync({ id })
    router.push('/dashboard/invoices')
  }

  async function setStatus(next: string) {
    if (!id) return
    await status.mutateAsync({ id, status: next })
  }

  if (isPending) {
    return <div className="p-6 sm:p-8"><div className="h-96 animate-pulse rounded-xl border border-border bg-card" /></div>
  }
  if (isError || !doc) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8 min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Invoice Not Found</h1>
          <p className="mt-2 text-muted-foreground">The invoice you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/dashboard/invoices" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90">
            <ArrowLeft className="size-4" />
            Back to Invoices
          </Link>
        </div>
      </div>
    )
  }

  const fromName = jstr(doc.issuer, 'businessName') || '—'
  const toName = jstr(doc.recipient, 'clientName') || '—'
  const balance = Math.max(0, doc.total - doc.amountPaid)
  // Status is now real (payment-driven). Render "PARTIALLY_PAID" as "partially paid".
  const displayStatus = doc.status.toLowerCase().replace(/_/g, ' ')

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-brand hover:underline">
          <ArrowLeft className="size-4" />
          Back
        </button>
        <div className="flex gap-3">
          {doc.status === 'DRAFT' && (
            <button
              onClick={() => setStatus('SENT')}
              disabled={status.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90 disabled:opacity-50"
            >
              <Send className="size-4" />
              {status.isPending ? 'Sending…' : 'Mark as Sent'}
            </button>
          )}
          {doc.status === 'PAID' && (
            <span className="inline-flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2 font-medium text-success">
              <CheckCircle2 className="size-4" />
              Paid
            </span>
          )}
          {doc.amountPaid > 0 && (
            <button
              onClick={() => downloadReceipt.mutate()}
              disabled={downloadReceipt.isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-medium hover:bg-muted disabled:opacity-50"
            >
              <Receipt className="size-4" />
              {downloadReceipt.isPending ? 'Preparing…' : 'Receipt'}
            </button>
          )}
          <Link href={`/invoice/new?id=${doc.id}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-medium hover:bg-muted">
            <Pencil className="size-4" />
            Edit
          </Link>
          <Link href={`/invoice/new?duplicate=${doc.id}`} className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-medium hover:bg-muted">
            <Copy className="size-4" />
            Duplicate
          </Link>
          <button
            onClick={handleDelete}
            disabled={del.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            {del.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-8 shadow-token-xs">
          <div className="space-y-8">
            <div className="flex items-start justify-between border-b border-border pb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Invoice</h1>
                <p className="mt-2 text-muted-foreground">{doc.number}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Invoice Date</p>
                <p className="text-foreground">{new Date(doc.issueDate).toLocaleDateString()}</p>
                <p className="mt-4 text-sm font-medium text-foreground">Due Date</p>
                <p className="text-foreground">{doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : '—'}</p>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">From</p>
                <div className="mt-2 space-y-1">
                  <p className="font-semibold text-foreground">{fromName}</p>
                  {[jstr(doc.issuer, 'address'), [jstr(doc.issuer, 'city'), jstr(doc.issuer, 'state')].filter(Boolean).join(', ')].filter(Boolean).map((l, i) => (
                    <p key={i} className="text-sm text-muted-foreground">{l}</p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">To</p>
                <div className="mt-2 space-y-1">
                  <p className="font-semibold text-foreground">{toName}</p>
                  {jstr(doc.recipient, 'email') && <p className="text-sm text-muted-foreground">{jstr(doc.recipient, 'email')}</p>}
                </div>
              </div>
            </div>

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
                  {doc.items.map((it) => (
                    <tr key={it.id}>
                      <td className="px-4 py-3">{it.description}</td>
                      <td className="px-4 py-3 text-center">{it.quantity}</td>
                      <td className="px-4 py-3 text-right">{money(it.rate)}</td>
                      <td className="px-4 py-3 text-right">{money(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-full sm:w-80 space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{money(doc.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">{money(doc.taxTotal)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-brand">{money(doc.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 h-fit">
          <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
            <h3 className="font-semibold text-foreground">Invoice Details</h3>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Status</p>
                <div className="mt-2"><StatusBadge status={displayStatus} /></div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Amount</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{money(doc.total)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Invoice Number</p>
                <p className="mt-2 font-mono text-sm">{doc.number}</p>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
            <h3 className="font-semibold text-foreground">Payments</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-medium text-success">{money(doc.amountPaid)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-semibold text-foreground">{money(balance)}</span>
              </div>
            </div>

            {/* Online payment (Razorpay) — only for a sent/part-paid invoice with a balance due. */}
            {(doc.status === 'SENT' || doc.status === 'PARTIALLY_PAID') && balance > 0.005 && (
              <RazorpayCheckoutButton
                documentId={doc.id}
                invoiceNumber={doc.number}
                balance={balance}
                currency={doc.currency}
                prefillName={toName}
                prefillEmail={jstr(doc.recipient, 'email')}
                onPaid={() => setReceiptNotice('Payment received — your receipt is ready to download or email below.')}
              />
            )}

            {balance > 0.005 ? (
              showPayForm ? (
                <form onSubmit={submitPayment} className="mt-4 space-y-3">
                  <input type="number" step="0.01" min="0" placeholder="Amount" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <input type="text" placeholder="Reference (optional)" value={payRef} onChange={(e) => setPayRef(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                  {payErr && <p className="text-xs text-destructive" role="alert">{payErr}</p>}
                  <div className="flex gap-2">
                    <button type="submit" disabled={record.isPending} className="flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-brand-foreground hover:bg-brand/90 disabled:opacity-50">{record.isPending ? 'Recording…' : 'Record'}</button>
                    <button type="button" onClick={() => { setShowPayForm(false); setPayErr(null) }} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">Cancel</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => { setShowPayForm(true); setPayAmount(balance.toFixed(2)) }} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand/90">
                  <Plus className="size-4" /> Record Payment
                </button>
              )
            ) : (
              <p className="mt-4 flex items-center gap-1 text-sm text-success"><CheckCircle2 className="size-4" /> Fully paid</p>
            )}

            {payments.data && payments.data.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-medium uppercase text-muted-foreground">History</p>
                <ul className="mt-3 space-y-3">
                  {payments.data.map((p) => (
                    <li key={p.id} className="border-l-2 border-brand pl-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{money(p.amount)}</span>
                        <span className="text-xs text-muted-foreground">{new Date(p.receivedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{p.method}{p.reference ? ` · ${p.reference}` : ''}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {doc.amountPaid > 0.005 && (
              <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
                <button
                  onClick={() =>
                    emailReceipt.mutate(undefined, {
                      onSuccess: (r) =>
                        setReceiptNotice(
                          r.sent
                            ? `Receipt emailed to ${r.to}`
                            : `Queued for ${r.to} — email provider not configured`,
                        ),
                      onError: () => setReceiptNotice('Could not email the receipt'),
                    })
                  }
                  disabled={emailReceipt.isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                >
                  <Mail className="size-4" /> {emailReceipt.isPending ? 'Sending…' : 'Email Receipt'}
                </button>
                {receiptNotice && (
                  <p className="text-xs text-muted-foreground" role="status">
                    {receiptNotice}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

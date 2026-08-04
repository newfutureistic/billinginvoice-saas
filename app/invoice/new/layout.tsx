import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

// The page itself is a Client Component (the invoice builder), which can't export
// `metadata` directly — a sibling layout is the only way to give this route its own
// canonical instead of inheriting `/invoice`'s from the parent layout.
export const metadata: Metadata = buildMetadata({
  title: 'Create Invoice — Free Invoice Generator',
  description: 'Fill in your business and client details, add line items, and download a professional, tax-ready invoice PDF in seconds — free, no signup required.',
  path: '/invoice/new',
})

export default function NewInvoiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

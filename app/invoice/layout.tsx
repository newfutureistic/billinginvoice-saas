import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Free Invoice Generator — Create Invoices Online',
  description:
    'Create professional, tax-ready invoices online for free. Add GST or VAT, choose a currency, and download a print-ready PDF in seconds — no signup required.',
  path: '/invoice',
  keywords: ['free invoice generator', 'create invoice online', 'invoice maker', 'gst invoice', 'invoice pdf'],
})

export default function InvoiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

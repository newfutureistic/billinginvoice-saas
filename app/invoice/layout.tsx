import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Invoice Generator — ToolForge',
  description: 'Create professional invoices in seconds. Download as PDF, print, or share instantly.',
}

export default function InvoiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

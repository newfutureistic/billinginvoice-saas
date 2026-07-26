import type { Metadata } from 'next'
import { AppShell } from '@/components/dashboard/app-shell'

export const metadata: Metadata = {
  title: 'Dashboard — Bill Maker',
  description: 'Manage your invoices, clients, and business operations.',
}

// Every page under /dashboard is authenticated, session-scoped content — never statically
// prerenderable. Without this, some builds attempt to prerender them anyway (observed as a
// `Cannot read properties of null (reading 'useState')` failure on /dashboard/notifications).
export const dynamic = 'force-dynamic'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}

import type { Metadata } from 'next'
import { AppShell } from '@/components/dashboard/app-shell'

export const metadata: Metadata = {
  title: 'Dashboard — ToolForge',
  description: 'Manage your invoices, clients, and business operations.',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}

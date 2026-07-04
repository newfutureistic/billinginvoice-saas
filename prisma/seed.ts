import { ToolKind, ToolStatus, PlanTier, type DocumentType, type Prisma } from '@prisma/client'
import { prisma, disconnectPrisma } from '@/server/db/prisma'
import { dbLogger } from '@/server/db/logger'

/**
 * Database seed — reference data only.
 *
 * Turns the frozen static catalogue (lib/site-data.ts, lib/invoice-templates.ts) and
 * the frozen pricing tiers into real rows, plus the Mission-2 future tools (salary
 * slip, purchase order, GST/EMI/loan calculators, number-to-words, barcode) to prove
 * new tools are *data*, not schema changes. Idempotent (upsert) so it is safe to re-run.
 *
 * A demo workspace with sample documents is created only when SEED_DEMO=true.
 * Requires a live database connection (real Supabase credentials in .env).
 */

const log = dbLogger.child({ script: 'seed' })

// --- Categories (frozen `categories`) ---------------------------------------
const categories = [
  { slug: 'billing-invoicing', name: 'Billing & Invoicing', icon: 'Receipt', sortWeight: 0, description: 'Create invoices, quotes, receipts and recurring bills that get you paid faster.' },
  { slug: 'documents-contracts', name: 'Documents & Contracts', icon: 'FileSignature', sortWeight: 1, description: 'Proposals, agreements, and templated paperwork ready to sign and send.' },
  { slug: 'finance-tax', name: 'Finance & Tax', icon: 'BarChart3', sortWeight: 2, description: 'Track expenses, compute tax, and understand profit with audit-ready reports.' },
  { slug: 'productivity', name: 'Productivity', icon: 'QrCode', sortWeight: 3, description: 'Fast, focused utilities — QR codes, file conversion, and everyday helpers.' },
]

// --- Tools (frozen catalogue + Mission-2 future tools) ----------------------
interface ToolSeed {
  slug: string
  name: string
  tagline: string
  description: string
  category: string
  kind: ToolKind
  schemaKey: string
  outputType?: DocumentType
  status?: ToolStatus
  minPlan?: PlanTier
  featured?: boolean
  sortWeight?: number
}

const tools: ToolSeed[] = [
  // Billing & Invoicing
  { slug: 'invoice-generator', name: 'Invoice Generator', tagline: 'Tax-ready invoices in under a minute', description: 'Create pixel-perfect, tax-ready invoices in under a minute.', category: 'billing-invoicing', kind: ToolKind.DOCUMENT, outputType: 'INVOICE', schemaKey: 'invoice.v1', status: ToolStatus.POPULAR, featured: true },
  { slug: 'quotes', name: 'Quote & Estimate Builder', tagline: 'Proposals that convert to deals', description: 'Branded, itemized estimates that convert straight to invoices when accepted.', category: 'billing-invoicing', kind: ToolKind.DOCUMENT, outputType: 'QUOTE', schemaKey: 'quote.v1', status: ToolStatus.POPULAR, featured: true },
  { slug: 'receipt-maker', name: 'Receipt Maker', tagline: 'Clean receipts, instantly', description: 'Generate professional receipts for any payment.', category: 'billing-invoicing', kind: ToolKind.DOCUMENT, outputType: 'RECEIPT', schemaKey: 'receipt.v1' },
  { slug: 'credit-note', name: 'Credit Note Generator', tagline: 'Refunds and adjustments, done right', description: 'Issue compliant credit notes against existing invoices.', category: 'billing-invoicing', kind: ToolKind.DOCUMENT, outputType: 'CREDIT_NOTE', schemaKey: 'credit-note.v1' },
  { slug: 'purchase-order', name: 'Purchase Order Generator', tagline: 'Order from suppliers, on the record', description: 'Create numbered purchase orders with supplier and delivery terms.', category: 'billing-invoicing', kind: ToolKind.DOCUMENT, outputType: 'PURCHASE_ORDER', schemaKey: 'purchase-order.v1', status: ToolStatus.NEW },
  { slug: 'recurring-billing', name: 'Recurring Billing', tagline: 'Set it once, bill on schedule', description: 'Automate repeat invoices for retainers and subscriptions.', category: 'billing-invoicing', kind: ToolKind.UTILITY, schemaKey: 'recurring-billing.v1', status: ToolStatus.PRO, minPlan: PlanTier.PRO },
  { slug: 'payment-reminders', name: 'Payment Reminders', tagline: 'Polite nudges that get you paid', description: 'Automatic, on-brand reminders for overdue invoices.', category: 'billing-invoicing', kind: ToolKind.UTILITY, schemaKey: 'payment-reminders.v1' },

  // Documents & Contracts
  { slug: 'contract-builder', name: 'Contract Builder', tagline: 'Agreements ready to sign', description: 'Draft clear service agreements from vetted templates.', category: 'documents-contracts', kind: ToolKind.GENERATOR, schemaKey: 'contract.v1', status: ToolStatus.POPULAR, featured: true },
  { slug: 'proposal-maker', name: 'Proposal Maker', tagline: 'Win work with polished proposals', description: 'Assemble persuasive, branded proposals clients can approve online.', category: 'documents-contracts', kind: ToolKind.DOCUMENT, outputType: 'PROPOSAL', schemaKey: 'proposal.v1', status: ToolStatus.NEW },
  { slug: 'nda-generator', name: 'NDA Generator', tagline: 'Protect confidential conversations', description: 'Create mutual or one-way non-disclosure agreements in minutes.', category: 'documents-contracts', kind: ToolKind.GENERATOR, schemaKey: 'nda.v1' },
  { slug: 'letterhead', name: 'Letterhead Designer', tagline: 'On-brand business letters', description: 'Design a reusable letterhead and compose formal business letters.', category: 'documents-contracts', kind: ToolKind.GENERATOR, schemaKey: 'letterhead.v1' },
  { slug: 'terms-generator', name: 'Terms & Conditions', tagline: 'Clear policies, fast', description: 'Generate readable terms of service tailored to your business type.', category: 'documents-contracts', kind: ToolKind.GENERATOR, schemaKey: 'terms.v1', status: ToolStatus.NEW },

  // Finance & Tax
  { slug: 'expenses', name: 'Expense Tracker', tagline: 'Every receipt, in one ledger', description: 'Capture receipts, categorize spend, and reconcile in one ledger.', category: 'finance-tax', kind: ToolKind.UTILITY, schemaKey: 'expenses.v1', status: ToolStatus.POPULAR, featured: true },
  { slug: 'tax', name: 'Tax Calculator', tagline: 'Correct tax, every region', description: 'Multi-region VAT, GST, and sales tax computed automatically.', category: 'finance-tax', kind: ToolKind.CALCULATOR, schemaKey: 'tax-calculator.v1', status: ToolStatus.POPULAR },
  { slug: 'gst-calculator', name: 'GST Calculator', tagline: 'GST in and out, instantly', description: 'Compute GST inclusive/exclusive amounts with correct rounding.', category: 'finance-tax', kind: ToolKind.CALCULATOR, schemaKey: 'gst-calculator.v1' },
  { slug: 'emi-calculator', name: 'EMI Calculator', tagline: 'Know your monthly payment', description: 'Calculate equated monthly instalments for any principal, rate and tenure.', category: 'finance-tax', kind: ToolKind.CALCULATOR, schemaKey: 'emi-calculator.v1' },
  { slug: 'loan-calculator', name: 'Loan Calculator', tagline: 'Total cost of borrowing', description: 'Amortization, total interest, and payoff schedule for any loan.', category: 'finance-tax', kind: ToolKind.CALCULATOR, schemaKey: 'loan-calculator.v1' },
  { slug: 'profit-margin', name: 'Profit Margin Calculator', tagline: 'Price with confidence', description: 'Work out margins, markups, and break-even pricing.', category: 'finance-tax', kind: ToolKind.CALCULATOR, schemaKey: 'profit-margin.v1' },
  { slug: 'salary-slip', name: 'Salary Slip Generator', tagline: 'Payslips your team can trust', description: 'Generate itemized salary slips with earnings, deductions and net pay.', category: 'finance-tax', kind: ToolKind.DOCUMENT, outputType: 'SALARY_SLIP', schemaKey: 'salary-slip.v1', status: ToolStatus.NEW },
  { slug: 'financial-report', name: 'Financial Report Builder', tagline: 'Profit and loss at a glance', description: 'Turn invoices and expenses into clean P&L summaries.', category: 'finance-tax', kind: ToolKind.GENERATOR, schemaKey: 'financial-report.v1', status: ToolStatus.PRO, minPlan: PlanTier.PRO },

  // Productivity
  { slug: 'qr-generator', name: 'QR Code Generator', tagline: 'Scannable codes in seconds', description: 'Create crisp, customizable QR codes for links, payments and contacts.', category: 'productivity', kind: ToolKind.GENERATOR, schemaKey: 'qr-generator.v1', status: ToolStatus.POPULAR },
  { slug: 'barcode-generator', name: 'Barcode Generator', tagline: 'Every format, print-ready', description: 'Generate EAN, UPC, Code128 and more as crisp PNG or SVG.', category: 'productivity', kind: ToolKind.GENERATOR, schemaKey: 'barcode-generator.v1' },
  { slug: 'number-to-words', name: 'Number to Words', tagline: 'Amounts spelled out correctly', description: 'Convert numeric amounts to words for cheques and invoices, any currency.', category: 'productivity', kind: ToolKind.UTILITY, schemaKey: 'number-to-words.v1' },
  { slug: 'unit-converter', name: 'Unit Converter', tagline: 'Convert anything, precisely', description: 'Fast, accurate conversions across length, weight, currency and more.', category: 'productivity', kind: ToolKind.CALCULATOR, schemaKey: 'unit-converter.v1' },
  { slug: 'pdf-splitter', name: 'PDF Splitter', tagline: 'Split and extract pages', description: 'Break large PDFs into pages or ranges in your browser.', category: 'productivity', kind: ToolKind.UTILITY, schemaKey: 'pdf-splitter.v1' },
  { slug: 'pdf-merger', name: 'PDF Merger', tagline: 'Combine files into one', description: 'Merge multiple PDFs and images into a single document.', category: 'productivity', kind: ToolKind.UTILITY, schemaKey: 'pdf-merger.v1' },
  { slug: 'image-to-pdf', name: 'Image to PDF', tagline: 'Photos into shareable docs', description: 'Convert JPGs and PNGs into a clean, page-sized PDF.', category: 'productivity', kind: ToolKind.UTILITY, schemaKey: 'image-to-pdf.v1' },
  { slug: 'link-shortener', name: 'Link Shortener', tagline: 'Short links that look sharp', description: 'Shorten long URLs into tidy, shareable links with click insights.', category: 'productivity', kind: ToolKind.UTILITY, schemaKey: 'link-shortener.v1', status: ToolStatus.NEW },
  { slug: 'timesheet', name: 'Timesheet Builder', tagline: 'Track hours, bill accurately', description: 'Log billable hours by client and project, then push to an invoice.', category: 'productivity', kind: ToolKind.UTILITY, schemaKey: 'timesheet.v1', status: ToolStatus.PRO, minPlan: PlanTier.PRO },
  { slug: 'email-signature', name: 'Email Signature Maker', tagline: 'Professional sign-offs', description: 'Design a clean, on-brand email signature with logo and links.', category: 'productivity', kind: ToolKind.GENERATOR, schemaKey: 'email-signature.v1' },
  { slug: 'csv-cleaner', name: 'CSV Cleaner', tagline: 'Tidy data, no spreadsheets', description: 'Clean, dedupe, and reformat CSV files in your browser.', category: 'productivity', kind: ToolKind.UTILITY, schemaKey: 'csv-cleaner.v1', status: ToolStatus.NEW },
]

// --- Invoice templates (frozen INVOICE_TEMPLATES) ---------------------------
const templates: { key: string; name: string; description: string; colors: Prisma.InputJsonValue }[] = [
  { key: 'classic', name: 'Classic', description: 'Traditional and professional', colors: { primary: '#0f172a', accent: '#1e40af', text: '#1e293b', background: '#ffffff' } },
  { key: 'modern', name: 'Modern', description: 'Clean and contemporary', colors: { primary: '#1f2937', accent: '#3b82f6', text: '#111827', background: '#f9fafb' } },
  { key: 'minimal', name: 'Minimal', description: 'Simplicity and focus', colors: { primary: '#6b7280', accent: '#9ca3af', text: '#4b5563', background: '#fafafa' } },
  { key: 'corporate', name: 'Corporate', description: 'Enterprise and formal', colors: { primary: '#1e3a8a', accent: '#2563eb', text: '#0c1117', background: '#ffffff' } },
  { key: 'luxury', name: 'Luxury', description: 'Premium and elegant', colors: { primary: '#d4af37', accent: '#2d2d2d', text: '#2d2d2d', background: '#f5f5f5' } },
  { key: 'dark', name: 'Dark', description: 'Modern dark mode', colors: { primary: '#1f2937', accent: '#60a5fa', text: '#e5e7eb', background: '#111827' } },
  { key: 'creative', name: 'Creative', description: 'Bold and artistic', colors: { primary: '#dc2626', accent: '#f97316', text: '#7c2d12', background: '#fef3c7' } },
  { key: 'elegant', name: 'Elegant', description: 'Refined and sophisticated', colors: { primary: '#5b21b6', accent: '#a78bfa', text: '#3f0f5c', background: '#faf5ff' } },
]

// --- Plans (frozen pricing `featureGroups`) ---------------------------------
const plans: { tier: PlanTier; name: string; priceMonthly: number; priceAnnual: number; entitlements: Prisma.InputJsonValue }[] = [
  {
    tier: PlanTier.FREE, name: 'Free', priceMonthly: 0, priceAnnual: 0,
    entitlements: { docsPerMonth: 3, seats: 1, allTools: false, customBranding: false, recurringBilling: false, sharedTemplates: false, approvalWorkflows: false, rbacCustomRoles: false, auditLog: false, sso: false, support: 'email' },
  },
  {
    tier: PlanTier.PRO, name: 'Pro', priceMonthly: 12, priceAnnual: 120,
    entitlements: { docsPerMonth: null, seats: 3, allTools: true, customBranding: true, recurringBilling: true, sharedTemplates: true, approvalWorkflows: false, rbacCustomRoles: false, auditLog: false, sso: false, support: 'priority' },
  },
  {
    tier: PlanTier.BUSINESS, name: 'Business', priceMonthly: 39, priceAnnual: 390,
    entitlements: { docsPerMonth: null, seats: 10, allTools: true, customBranding: true, recurringBilling: true, sharedTemplates: true, approvalWorkflows: true, rbacCustomRoles: true, auditLog: true, sso: true, support: 'dedicated' },
  },
]

async function seedReferenceData(): Promise<void> {
  const categoryIdBySlug = new Map<string, string>()
  for (const c of categories) {
    const row = await prisma.toolCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, icon: c.icon, sortWeight: c.sortWeight },
      create: c,
    })
    categoryIdBySlug.set(c.slug, row.id)
  }
  log.info('Seeded tool categories', { count: categories.length })

  let toolCount = 0
  for (const [i, t] of tools.entries()) {
    const categoryId = categoryIdBySlug.get(t.category)
    if (!categoryId) throw new Error(`Unknown category "${t.category}" for tool "${t.slug}"`)
    const data = {
      slug: t.slug,
      name: t.name,
      tagline: t.tagline,
      description: t.description,
      categoryId,
      kind: t.kind,
      outputType: t.outputType ?? null,
      status: t.status ?? null,
      minPlan: t.minPlan ?? PlanTier.FREE,
      schemaKey: t.schemaKey,
      featured: t.featured ?? false,
      isActive: true,
      sortWeight: t.sortWeight ?? i,
    }
    await prisma.tool.upsert({ where: { slug: t.slug }, update: data, create: data })
    toolCount++
  }
  log.info('Seeded tools', { count: toolCount })

  for (const tpl of templates) {
    const existing = await prisma.templateAsset.findFirst({ where: { workspaceId: null, key: tpl.key } })
    if (existing) {
      await prisma.templateAsset.update({ where: { id: existing.id }, data: { name: tpl.name, description: tpl.description, colors: tpl.colors } })
    } else {
      await prisma.templateAsset.create({ data: { workspaceId: null, key: tpl.key, name: tpl.name, description: tpl.description, colors: tpl.colors, isSystem: true } })
    }
  }
  log.info('Seeded system templates', { count: templates.length })

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { tier: p.tier },
      update: { name: p.name, priceMonthly: p.priceMonthly, priceAnnual: p.priceAnnual, entitlements: p.entitlements },
      create: { tier: p.tier, name: p.name, priceMonthly: p.priceMonthly, priceAnnual: p.priceAnnual, entitlements: p.entitlements },
    })
  }
  log.info('Seeded plans', { count: plans.length })
}

async function seedDemoWorkspace(): Promise<void> {
  const freePlan = await prisma.plan.findUniqueOrThrow({ where: { tier: PlanTier.FREE } })
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'acme-corporation' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corporation',
      settings: { create: { legalName: 'Acme Corporation', defaultCurrency: 'USD', brandColor: '#3b82f6', onboardedAt: new Date() } },
      subscription: { create: { planId: freePlan.id, planTier: PlanTier.FREE } },
    },
  })
  log.info('Seeded demo workspace', { workspaceId: workspace.id })
}

async function main(): Promise<void> {
  log.info('Seeding reference data…')
  await seedReferenceData()
  if (process.env.SEED_DEMO === 'true') {
    log.info('SEED_DEMO=true — seeding demo workspace…')
    await seedDemoWorkspace()
  }
  log.info('Seed complete.')
}

main()
  .catch((err) => {
    log.error('Seed failed', { error: err instanceof Error ? err.message : String(err) })
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectPrisma()
  })

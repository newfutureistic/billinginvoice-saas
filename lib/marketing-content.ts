import {
  FileText,
  Receipt,
  Calculator,
  FileSignature,
  QrCode,
  Scissors,
  Wallet,
  BarChart3,
  Building2,
  Briefcase,
  Users,
  Landmark,
  type LucideIcon,
} from 'lucide-react'

export type Tool = {
  name: string
  description: string
  icon: LucideIcon
  href: string
  badge?: string
  featured?: boolean
}

export const featuredTools: Tool[] = [
  {
    name: 'Invoice Generator',
    description:
      'Create pixel-perfect, tax-ready invoices in under a minute. Send, track, and get paid faster.',
    icon: Receipt,
    href: '/tools/invoice-generator',
    badge: 'Most popular',
    featured: true,
  },
  {
    name: 'Quote & Estimate Builder',
    description:
      'Turn proposals into approved deals with branded, itemized estimates that convert to invoices.',
    icon: FileText,
    href: '/tools/quotes',
  },
  {
    name: 'Expense Tracker',
    description:
      'Capture receipts, categorize spend, and reconcile in a single, audit-friendly ledger.',
    icon: Wallet,
    href: '/tools/expenses',
  },
  {
    name: 'Tax Calculator',
    description:
      'Multi-region VAT, GST, and sales tax computed automatically on every line item.',
    icon: Calculator,
    href: '/tools/tax',
  },
]

export const toolCategories: {
  name: string
  description: string
  icon: LucideIcon
  count: number
}[] = [
  {
    name: 'Billing & Invoicing',
    description: 'Invoices, quotes, receipts, recurring billing and reminders.',
    icon: Receipt,
    count: 12,
  },
  {
    name: 'Documents & Contracts',
    description: 'Proposals, agreements, e-signatures and templated paperwork.',
    icon: FileSignature,
    count: 9,
  },
  {
    name: 'Finance & Tax',
    description: 'Expense tracking, tax computation, and profit reporting.',
    icon: BarChart3,
    count: 8,
  },
  {
    name: 'Productivity',
    description: 'QR codes, file conversion, splitting and quick utilities.',
    icon: QrCode,
    count: 15,
  },
]

export const stats: { value: string; label: string }[] = [
  { value: '2.4M+', label: 'Documents generated' },
  { value: '180+', label: 'Countries served' },
  { value: '$4.1B', label: 'Invoiced through ToolForge' },
  { value: '99.99%', label: 'Uptime, last 12 months' },
]

export const trustLogos: string[] = [
  'Northwind',
  'Lattice',
  'Evergreen',
  'Monzo',
  'Cadence',
  'Baseline',
  'Vantage',
]

export const whyChoose: {
  title: string
  description: string
  icon: LucideIcon
}[] = [
  {
    title: 'Built for professionals',
    description:
      'Every tool is engineered to enterprise standards — the same primitives, the same polish, from invoice to contract.',
    icon: Briefcase,
  },
  {
    title: 'Compliant by default',
    description:
      'Region-aware tax rules, sequential numbering, and audit trails keep your paperwork ready for any accountant.',
    icon: Landmark,
  },
  {
    title: 'One workspace, every tool',
    description:
      'Clients, branding, and history stay in sync across all 40+ tools. No re-entering the same data twice.',
    icon: Building2,
  },
  {
    title: 'Loved by teams',
    description:
      'From solo freelancers to finance teams of fifty, roles and shared templates keep everyone aligned.',
    icon: Users,
  },
]

export const templates: {
  name: string
  style: string
  accent: string
}[] = [
  { name: 'Classic', style: 'Timeless and clean', accent: 'oklch(0.545 0.152 258)' },
  { name: 'Minimal', style: 'Whitespace-forward', accent: 'oklch(0.26 0.017 268)' },
  { name: 'Modern', style: 'Bold and confident', accent: 'oklch(0.58 0.12 158)' },
  { name: 'Corporate', style: 'Formal and structured', accent: 'oklch(0.72 0.135 74)' },
]

export const plans: {
  name: string
  price: string
  cadence: string
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
}[] = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    description: 'Everything you need to send your first professional invoice.',
    features: ['3 documents / month', 'Core templates', 'PDF export', 'Email support'],
    cta: 'Start free',
  },
  {
    name: 'Pro',
    price: '$12',
    cadence: 'per month',
    description: 'For freelancers and growing businesses that bill regularly.',
    features: [
      'Unlimited documents',
      'All 40+ tools & templates',
      'Custom branding & logo',
      'Recurring invoices',
      'Priority support',
    ],
    cta: 'Start 14-day trial',
    highlighted: true,
  },
  {
    name: 'Business',
    price: '$39',
    cadence: 'per month',
    description: 'Shared workspaces, roles, and controls for teams.',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Approval workflows',
      'Audit log & SSO',
      'Dedicated manager',
    ],
    cta: 'Contact sales',
  },
]

export const testimonials: {
  quote: string
  name: string
  role: string
  initials: string
}[] = [
  {
    quote:
      'We replaced three separate tools with ToolForge. Invoicing that used to take an afternoon now takes minutes, and everything matches our brand.',
    name: 'Maya Okafor',
    role: 'Founder, Studio Meridian',
    initials: 'MO',
  },
  {
    quote:
      'The tax handling alone is worth it. Cross-border invoices are calculated correctly every time — our accountant stopped emailing us.',
    name: 'Daniel Reyes',
    role: 'Finance Lead, Cadence Labs',
    initials: 'DR',
  },
  {
    quote:
      'It feels like software built by people who actually send invoices. Fast, precise, and genuinely pleasant to use.',
    name: 'Sofia Lindqvist',
    role: 'Independent Consultant',
    initials: 'SL',
  },
]

export const faqs: { question: string; answer: string }[] = [
  {
    question: 'Do I need an account to generate an invoice?',
    answer:
      'No. You can create and download a professional invoice as a guest. Creating a free account lets you save clients, reuse templates, and track what you have sent.',
  },
  {
    question: 'Is ToolForge really free to start?',
    answer:
      'Yes. The Free plan lets you generate documents every month at no cost, forever. Upgrade to Pro only when you need unlimited documents, custom branding, and the full tool library.',
  },
  {
    question: 'Can ToolForge handle taxes for my country?',
    answer:
      'ToolForge supports VAT, GST, and sales tax across 180+ regions. Set your location once and every line item is calculated to local rules automatically.',
  },
  {
    question: 'Will my invoices look on-brand?',
    answer:
      'Absolutely. Add your logo, colors, and details once. Your branding is applied consistently across invoices, quotes, receipts, and every other tool.',
  },
  {
    question: 'How secure is my data?',
    answer:
      'Your documents are encrypted in transit and at rest. Business plans add SSO, granular roles, and a complete audit log for compliance.',
  },
]

export const navLinks: { label: string; href: string }[] = [
  { label: 'Tools', href: '#featured-tools' },
  { label: 'Templates', href: '#templates' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Customers', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
]

export const scissorsIcon = Scissors

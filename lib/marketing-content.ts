import {
  FileText,
  Receipt,
  QrCode,
  Scissors,
  BarChart3,
  Building2,
  Briefcase,
  Users,
  Landmark,
  CreditCard,
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

/** Real invoice capabilities — each links straight into the generator. No other products. */
export const featuredTools: Tool[] = [
  {
    name: 'Invoice Generator',
    description:
      'Create pixel-perfect, tax-ready invoices in under a minute. Send, track, and get paid faster.',
    icon: Receipt,
    href: '/invoice/new',
    badge: 'Most popular',
    featured: true,
  },
  {
    name: 'GST & VAT Invoices',
    description:
      'Add GST, VAT, or sales tax with automatic CGST / SGST / IGST splits on every line item.',
    icon: BarChart3,
    href: '/invoice/new',
  },
  {
    name: 'Multi-Currency & PDF',
    description:
      'Bill clients in USD, INR, EUR, GBP and more, then download a clean, print-ready PDF.',
    icon: FileText,
    href: '/invoice/new',
  },
  {
    name: 'Payments & Tracking',
    description:
      'Accept Razorpay and UPI payments, add a scannable QR, and record part-payments as they arrive.',
    icon: CreditCard,
    href: '/invoice/new',
  },
]

/** What you can do inside the invoice builder (honest capabilities, not separate products). */
export const toolCategories: {
  name: string
  description: string
  icon: LucideIcon
  count: number
}[] = [
  {
    name: 'Create & Customize',
    description: 'Line items, taxes, discounts, shipping, notes, your logo and brand color — one guided builder.',
    icon: Receipt,
    count: 0,
  },
  {
    name: 'Tax & Compliance',
    description: 'GST, VAT, and sales tax with automatic CGST / SGST / IGST splits and sequential numbering.',
    icon: BarChart3,
    count: 0,
  },
  {
    name: 'Get Paid',
    description: 'Accept Razorpay & UPI payments, add a scannable pay QR, and record part-payments.',
    icon: QrCode,
    count: 0,
  },
  {
    name: 'Track & Manage',
    description: 'Save clients, reuse templates, download PDFs, and see exactly what has been paid.',
    icon: Building2,
    count: 0,
  },
]

export const stats: { value: string; label: string }[] = [
  { value: '10+', label: 'Currencies supported' },
  { value: 'GST · VAT', label: 'Tax modes built in' },
  { value: 'PDF', label: 'Print-ready export' },
  { value: 'Free', label: 'To start, no card' },
]

/** No fabricated customer logos. */
export const trustLogos: string[] = []

export const whyChoose: {
  title: string
  description: string
  icon: LucideIcon
}[] = [
  {
    title: 'Built for professionals',
    description:
      'Every invoice is engineered to enterprise standards — clean typography, correct tax math, and a print-ready PDF every time.',
    icon: Briefcase,
  },
  {
    title: 'Compliant by default',
    description:
      'Region-aware tax rules, GST / VAT splits, sequential numbering, and audit trails keep your invoices ready for any accountant.',
    icon: Landmark,
  },
  {
    title: 'One workspace for billing',
    description:
      'Clients, branding, and history stay in sync across every invoice you send. No re-entering the same data twice.',
    icon: Building2,
  },
  {
    title: 'Loved by teams',
    description:
      'From solo freelancers to finance teams, roles and shared templates keep everyone billing consistently.',
    icon: Users,
  },
]

export const templates: {
  name: string
  style: string
  accent: string
  /** Real builder template id (`lib/invoice-templates.ts`) this card opens the builder on. */
  templateId: string
}[] = [
  { name: 'Classic', style: 'Timeless and clean', accent: 'oklch(0.545 0.152 258)', templateId: 'classic' },
  { name: 'Minimal', style: 'Whitespace-forward', accent: 'oklch(0.26 0.017 268)', templateId: 'minimal' },
  { name: 'Modern', style: 'Bold and confident', accent: 'oklch(0.58 0.12 158)', templateId: 'modern' },
  { name: 'Corporate', style: 'Formal and structured', accent: 'oklch(0.72 0.135 74)', templateId: 'corporate' },
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
    features: ['3 invoices / month', 'Core templates', 'PDF export', 'Email support'],
    cta: 'Create an invoice',
  },
  {
    name: 'Pro',
    price: '$12',
    cadence: 'per month',
    description: 'For freelancers and growing businesses that bill regularly.',
    features: [
      'Unlimited invoices',
      'All invoice templates & branding',
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
      'We switched to Bill Maker for invoicing. What used to take an afternoon now takes minutes, and every invoice matches our brand.',
    name: 'Maya Okafor',
    role: 'Founder, Example Business',
    initials: 'MO',
  },
  {
    quote:
      'The tax handling alone is worth it. Cross-border invoices are calculated correctly every time — our accountant stopped emailing us.',
    name: 'Daniel Reyes',
    role: 'Finance Lead, Sample Company',
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
    question: 'Is Bill Maker really free?',
    answer:
      'Yes. Create 2 invoices without an account, then 100 invoices every calendar month after a free signup — at no cost. There is no payment and no subscription. Paid plans are planned for the future, but the free plan stays free.',
  },
  {
    question: 'Can Bill Maker handle taxes for my country?',
    answer:
      'Bill Maker supports GST, VAT, and sales tax with automatic CGST / SGST / IGST splits. Set your rate once and every line item is calculated for you.',
  },
  {
    question: 'Will my invoices look on-brand?',
    answer:
      'Absolutely. Add your logo, brand color, and details once, and your branding is applied consistently across every invoice you create.',
  },
  {
    question: 'How secure is my data?',
    answer:
      'Your invoices are private to your account, encrypted in transit and at rest. Business plans add SSO, granular roles, and a complete audit log for compliance.',
  },
]

export const navLinks: { label: string; href: string }[] = [
  { label: 'Invoice Generator', href: '/invoice/new' },
  { label: 'Templates', href: '#templates' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export const scissorsIcon = Scissors

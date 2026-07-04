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
  FileCheck2,
  FileSpreadsheet,
  Repeat,
  BellRing,
  CreditCard,
  PiggyBank,
  Percent,
  TrendingUp,
  FileCog,
  Stamp,
  ScrollText,
  ClipboardList,
  Image as ImageIcon,
  FileArchive,
  QrCode as QrIcon,
  Link2,
  Ruler,
  Clock3,
  Mail,
  Table2,
  ShieldCheck,
  Globe2,
  Zap,
  type LucideIcon,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/* Tool catalog                                                        */
/* ------------------------------------------------------------------ */

export type ToolStatus = 'popular' | 'new' | 'pro'

export type CatalogTool = {
  slug: string
  name: string
  tagline: string
  description: string
  icon: LucideIcon
  category: string // category slug
  status?: ToolStatus
  featured?: boolean
  addedAt: string // ISO date, drives "recently added"
  rating: number
  uses: string // formatted usage count
  features: string[]
  steps: { title: string; description: string }[]
}

export type Category = {
  slug: string
  name: string
  description: string
  icon: LucideIcon
}

export const categories: Category[] = [
  {
    slug: 'billing-invoicing',
    name: 'Billing & Invoicing',
    description:
      'Create invoices, quotes, receipts and recurring bills that get you paid faster.',
    icon: Receipt,
  },
  {
    slug: 'documents-contracts',
    name: 'Documents & Contracts',
    description:
      'Proposals, agreements, and templated paperwork ready to sign and send.',
    icon: FileSignature,
  },
  {
    slug: 'finance-tax',
    name: 'Finance & Tax',
    description:
      'Track expenses, compute tax, and understand profit with audit-ready reports.',
    icon: BarChart3,
  },
  {
    slug: 'productivity',
    name: 'Productivity',
    description:
      'Fast, focused utilities — QR codes, file conversion, and everyday helpers.',
    icon: QrCode,
  },
]

export const tools: CatalogTool[] = [
  // Billing & Invoicing
  {
    slug: 'invoice-generator',
    name: 'Invoice Generator',
    tagline: 'Tax-ready invoices in under a minute',
    description:
      'Create pixel-perfect, tax-ready invoices in under a minute. Send, track, and get paid faster with automatic numbering and reminders.',
    icon: Receipt,
    category: 'billing-invoicing',
    status: 'popular',
    featured: true,
    addedAt: '2024-01-12',
    rating: 4.9,
    uses: '2.4M',
    features: [
      'Automatic sequential numbering',
      'Region-aware tax calculation',
      'Custom branding and logo',
      'One-click PDF export',
      'Payment tracking and reminders',
    ],
    steps: [
      { title: 'Add your details', description: 'Enter your business info and client once — we remember it.' },
      { title: 'Itemize the work', description: 'Add line items; taxes and totals calculate automatically.' },
      { title: 'Send and get paid', description: 'Download a PDF or email it, then track when it is viewed.' },
    ],
  },
  {
    slug: 'quotes',
    name: 'Quote & Estimate Builder',
    tagline: 'Proposals that convert to deals',
    description:
      'Turn proposals into approved deals with branded, itemized estimates that convert straight to invoices when accepted.',
    icon: FileText,
    category: 'billing-invoicing',
    status: 'popular',
    featured: true,
    addedAt: '2024-02-03',
    rating: 4.8,
    uses: '860K',
    features: [
      'Branded, itemized estimates',
      'Accept-online workflow',
      'One-click convert to invoice',
      'Optional and tiered line items',
      'Expiry dates and follow-ups',
    ],
    steps: [
      { title: 'Build the estimate', description: 'Add itemized pricing with optional and tiered choices.' },
      { title: 'Share for approval', description: 'Send a link your client can approve online.' },
      { title: 'Convert to invoice', description: 'Accepted quotes become invoices in one click.' },
    ],
  },
  {
    slug: 'receipt-maker',
    name: 'Receipt Maker',
    tagline: 'Clean receipts, instantly',
    description:
      'Generate professional receipts for any payment. Perfect for cash sales, deposits, and reimbursements.',
    icon: FileCheck2,
    category: 'billing-invoicing',
    addedAt: '2024-03-19',
    rating: 4.7,
    uses: '410K',
    features: ['Itemized or simple receipts', 'Tax and tip lines', 'Business branding', 'PDF and print ready'],
    steps: [
      { title: 'Enter payment details', description: 'Amount, method, and what it was for.' },
      { title: 'Brand it', description: 'Add your logo and business information.' },
      { title: 'Download', description: 'Export a clean PDF receipt to share.' },
    ],
  },
  {
    slug: 'recurring-billing',
    name: 'Recurring Billing',
    tagline: 'Set it once, bill on schedule',
    description:
      'Automate repeat invoices for retainers and subscriptions. ToolForge sends them on schedule so you never miss a cycle.',
    icon: Repeat,
    category: 'billing-invoicing',
    status: 'pro',
    addedAt: '2024-05-08',
    rating: 4.8,
    uses: '220K',
    features: ['Flexible schedules', 'Auto-send on due date', 'Pause and resume', 'Failed-payment reminders'],
    steps: [
      { title: 'Create a template', description: 'Set the line items and client for the cycle.' },
      { title: 'Pick a cadence', description: 'Weekly, monthly, quarterly — your call.' },
      { title: 'Let it run', description: 'Invoices go out automatically, every period.' },
    ],
  },
  {
    slug: 'payment-reminders',
    name: 'Payment Reminders',
    tagline: 'Polite nudges that get you paid',
    description:
      'Automatic, on-brand reminders for overdue invoices — friendly at first, firmer over time, always professional.',
    icon: BellRing,
    category: 'billing-invoicing',
    addedAt: '2024-06-21',
    rating: 4.6,
    uses: '180K',
    features: ['Tiered reminder tone', 'Custom schedules', 'Auto-stop on payment', 'Branded emails'],
    steps: [
      { title: 'Set the schedule', description: 'Choose when reminders send after the due date.' },
      { title: 'Pick the tone', description: 'From gentle to firm, tuned to each stage.' },
      { title: 'Relax', description: 'Reminders stop the moment the invoice is paid.' },
    ],
  },
  {
    slug: 'credit-note',
    name: 'Credit Note Generator',
    tagline: 'Refunds and adjustments, done right',
    description:
      'Issue compliant credit notes against existing invoices with correct numbering and tax handling.',
    icon: CreditCard,
    category: 'billing-invoicing',
    addedAt: '2024-08-02',
    rating: 4.7,
    uses: '96K',
    features: ['Linked to source invoice', 'Partial or full credits', 'Correct tax reversal', 'Audit trail'],
    steps: [
      { title: 'Select the invoice', description: 'Choose which invoice to credit against.' },
      { title: 'Set the amount', description: 'Credit part or all of the original.' },
      { title: 'Issue', description: 'A compliant credit note is generated instantly.' },
    ],
  },

  // Documents & Contracts
  {
    slug: 'contract-builder',
    name: 'Contract Builder',
    tagline: 'Agreements ready to sign',
    description:
      'Draft clear service agreements from vetted templates, fill in the blanks, and send for e-signature.',
    icon: FileSignature,
    category: 'documents-contracts',
    status: 'popular',
    featured: true,
    addedAt: '2024-02-27',
    rating: 4.8,
    uses: '540K',
    features: ['Vetted clause library', 'Fill-in-the-blank fields', 'E-signature ready', 'Version history'],
    steps: [
      { title: 'Pick a template', description: 'Start from a lawyer-reviewed agreement.' },
      { title: 'Fill the details', description: 'Add parties, scope, and terms.' },
      { title: 'Send to sign', description: 'Collect signatures with a shareable link.' },
    ],
  },
  {
    slug: 'proposal-maker',
    name: 'Proposal Maker',
    tagline: 'Win work with polished proposals',
    description:
      'Assemble persuasive, branded proposals with scope, timeline, and pricing that clients can approve online.',
    icon: ClipboardList,
    category: 'documents-contracts',
    status: 'new',
    addedAt: '2024-09-14',
    rating: 4.7,
    uses: '74K',
    features: ['Scope and timeline blocks', 'Interactive pricing', 'Online approval', 'Reusable sections'],
    steps: [
      { title: 'Outline the work', description: 'Add scope, deliverables, and a timeline.' },
      { title: 'Price it', description: 'Include fixed or tiered pricing options.' },
      { title: 'Send for sign-off', description: 'Clients approve directly from the proposal.' },
    ],
  },
  {
    slug: 'nda-generator',
    name: 'NDA Generator',
    tagline: 'Protect confidential conversations',
    description:
      'Create mutual or one-way non-disclosure agreements in minutes, tailored to your jurisdiction.',
    icon: ShieldCheck,
    category: 'documents-contracts',
    addedAt: '2024-04-11',
    rating: 4.6,
    uses: '132K',
    features: ['Mutual or one-way', 'Jurisdiction options', 'Custom term length', 'E-signature ready'],
    steps: [
      { title: 'Choose the type', description: 'Mutual or one-directional confidentiality.' },
      { title: 'Set the terms', description: 'Duration, jurisdiction, and parties.' },
      { title: 'Sign and store', description: 'Send for signature and keep a copy.' },
    ],
  },
  {
    slug: 'letterhead',
    name: 'Letterhead Designer',
    tagline: 'On-brand business letters',
    description:
      'Design a reusable letterhead and compose formal business letters that match your brand every time.',
    icon: Stamp,
    category: 'documents-contracts',
    addedAt: '2024-07-05',
    rating: 4.5,
    uses: '58K',
    features: ['Reusable header and footer', 'Logo and brand colors', 'Multiple letter templates', 'PDF export'],
    steps: [
      { title: 'Design the header', description: 'Add your logo, address, and colors.' },
      { title: 'Write the letter', description: 'Use a template or start blank.' },
      { title: 'Export', description: 'Download a print-ready PDF.' },
    ],
  },
  {
    slug: 'terms-generator',
    name: 'Terms & Conditions',
    tagline: 'Clear policies, fast',
    description:
      'Generate readable terms of service and policy documents tailored to your business type.',
    icon: ScrollText,
    category: 'documents-contracts',
    addedAt: '2024-10-01',
    status: 'new',
    rating: 4.5,
    uses: '41K',
    features: ['Business-type presets', 'Plain-language clauses', 'Custom sections', 'Always editable'],
    steps: [
      { title: 'Describe your business', description: 'Answer a few quick questions.' },
      { title: 'Review clauses', description: 'Tweak the generated sections.' },
      { title: 'Publish', description: 'Export or link to your policy.' },
    ],
  },

  // Finance & Tax
  {
    slug: 'expenses',
    name: 'Expense Tracker',
    tagline: 'Every receipt, in one ledger',
    description:
      'Capture receipts, categorize spend, and reconcile in a single, audit-friendly ledger you can export any time.',
    icon: Wallet,
    category: 'finance-tax',
    status: 'popular',
    featured: true,
    addedAt: '2024-01-30',
    rating: 4.8,
    uses: '690K',
    features: ['Receipt capture', 'Smart categories', 'Multi-currency', 'Export to CSV and PDF'],
    steps: [
      { title: 'Add an expense', description: 'Snap a receipt or enter it manually.' },
      { title: 'Categorize', description: 'We suggest a category automatically.' },
      { title: 'Reconcile', description: 'Export a clean report for your accountant.' },
    ],
  },
  {
    slug: 'tax',
    name: 'Tax Calculator',
    tagline: 'Correct tax, every region',
    description:
      'Multi-region VAT, GST, and sales tax computed automatically on every line item, with reverse-charge support.',
    icon: Calculator,
    category: 'finance-tax',
    status: 'popular',
    addedAt: '2024-02-16',
    rating: 4.7,
    uses: '520K',
    features: ['VAT, GST and sales tax', '180+ regions', 'Reverse-charge support', 'Inclusive or exclusive'],
    steps: [
      { title: 'Set your region', description: 'Choose where you are billing from and to.' },
      { title: 'Enter amounts', description: 'Add net or gross line items.' },
      { title: 'Get the breakdown', description: 'See tax computed to local rules.' },
    ],
  },
  {
    slug: 'profit-margin',
    name: 'Profit Margin Calculator',
    tagline: 'Price with confidence',
    description:
      'Work out margins, markups, and break-even pricing so every quote protects your bottom line.',
    icon: TrendingUp,
    category: 'finance-tax',
    addedAt: '2024-05-22',
    rating: 4.6,
    uses: '210K',
    features: ['Margin and markup', 'Break-even analysis', 'Multi-item support', 'Instant results'],
    steps: [
      { title: 'Enter your costs', description: 'Add cost and desired margin.' },
      { title: 'See the price', description: 'We compute the selling price instantly.' },
      { title: 'Apply it', description: 'Use the number in your next quote.' },
    ],
  },
  {
    slug: 'vat-checker',
    name: 'VAT Number Checker',
    tagline: 'Validate before you bill',
    description:
      'Verify EU and UK VAT numbers instantly to keep cross-border invoices compliant.',
    icon: Percent,
    category: 'finance-tax',
    addedAt: '2024-06-30',
    rating: 4.5,
    uses: '88K',
    features: ['EU and UK coverage', 'Instant validation', 'Company-name match', 'Bulk lookup (Pro)'],
    steps: [
      { title: 'Paste the number', description: 'Enter the VAT ID to check.' },
      { title: 'Validate', description: 'We confirm it in real time.' },
      { title: 'Bill safely', description: 'Proceed knowing the ID is valid.' },
    ],
  },
  {
    slug: 'savings-goal',
    name: 'Tax Savings Planner',
    tagline: 'Set aside the right amount',
    description:
      'Estimate what to reserve for tax each month so filing season is never a surprise.',
    icon: PiggyBank,
    category: 'finance-tax',
    status: 'new',
    addedAt: '2024-09-28',
    rating: 4.6,
    uses: '52K',
    features: ['Income-based estimates', 'Monthly set-aside', 'Region presets', 'Reminders'],
    steps: [
      { title: 'Enter income', description: 'Add expected earnings and region.' },
      { title: 'Get a target', description: 'See how much to reserve monthly.' },
      { title: 'Stay ready', description: 'Track progress toward your target.' },
    ],
  },
  {
    slug: 'financial-report',
    name: 'Financial Report Builder',
    tagline: 'Profit and loss at a glance',
    description:
      'Turn your invoices and expenses into clean profit-and-loss summaries ready to share.',
    icon: FileSpreadsheet,
    category: 'finance-tax',
    status: 'pro',
    addedAt: '2024-08-19',
    rating: 4.7,
    uses: '64K',
    features: ['P&L summaries', 'Custom date ranges', 'Category breakdowns', 'Export to PDF'],
    steps: [
      { title: 'Pick a range', description: 'Choose the period to report on.' },
      { title: 'Review', description: 'See income, spend, and profit.' },
      { title: 'Share', description: 'Export a polished report.' },
    ],
  },

  // Productivity
  {
    slug: 'qr-generator',
    name: 'QR Code Generator',
    tagline: 'Scannable codes in seconds',
    description:
      'Create crisp, customizable QR codes for links, payments, and contact details — download in any size.',
    icon: QrIcon,
    category: 'productivity',
    status: 'popular',
    addedAt: '2024-03-02',
    rating: 4.8,
    uses: '1.1M',
    features: ['Links, text, and payments', 'Custom colors', 'High-resolution export', 'Logo embedding'],
    steps: [
      { title: 'Enter content', description: 'Add a link, text, or payment detail.' },
      { title: 'Style it', description: 'Adjust colors and add your logo.' },
      { title: 'Download', description: 'Export a crisp PNG or SVG.' },
    ],
  },
  {
    slug: 'pdf-splitter',
    name: 'PDF Splitter',
    tagline: 'Split and extract pages',
    description:
      'Break large PDFs into pages or ranges, and extract exactly the pages you need — all in your browser.',
    icon: Scissors,
    category: 'productivity',
    addedAt: '2024-04-18',
    rating: 4.6,
    uses: '380K',
    features: ['Split by range', 'Extract single pages', 'Reorder pages', 'Private, in-browser'],
    steps: [
      { title: 'Upload a PDF', description: 'Drop in the file to split.' },
      { title: 'Choose ranges', description: 'Select the pages you want.' },
      { title: 'Download', description: 'Get your split files instantly.' },
    ],
  },
  {
    slug: 'pdf-merger',
    name: 'PDF Merger',
    tagline: 'Combine files into one',
    description:
      'Merge multiple PDFs and images into a single, well-ordered document — no upload to a server required.',
    icon: FileArchive,
    category: 'productivity',
    addedAt: '2024-05-30',
    rating: 4.7,
    uses: '420K',
    features: ['Drag to reorder', 'Mix PDFs and images', 'Compress output', 'Private, in-browser'],
    steps: [
      { title: 'Add files', description: 'Upload the PDFs to combine.' },
      { title: 'Reorder', description: 'Drag pages into the right sequence.' },
      { title: 'Merge', description: 'Download one tidy PDF.' },
    ],
  },
  {
    slug: 'image-to-pdf',
    name: 'Image to PDF',
    tagline: 'Photos into shareable docs',
    description:
      'Convert JPGs and PNGs into a clean, page-sized PDF — great for receipts and scanned paperwork.',
    icon: ImageIcon,
    category: 'productivity',
    addedAt: '2024-06-12',
    rating: 4.6,
    uses: '260K',
    features: ['Batch conversion', 'Page sizing', 'Auto-orientation', 'Private, in-browser'],
    steps: [
      { title: 'Upload images', description: 'Add one or many photos.' },
      { title: 'Arrange', description: 'Set order and page size.' },
      { title: 'Convert', description: 'Download a single PDF.' },
    ],
  },
  {
    slug: 'link-shortener',
    name: 'Link Shortener',
    tagline: 'Short links that look sharp',
    description:
      'Shorten long URLs into tidy, shareable links with basic click insights.',
    icon: Link2,
    category: 'productivity',
    status: 'new',
    addedAt: '2024-10-08',
    rating: 4.5,
    uses: '190K',
    features: ['Custom slugs', 'Click counts', 'QR for every link', 'Expiry dates'],
    steps: [
      { title: 'Paste a URL', description: 'Drop in the long link.' },
      { title: 'Customize', description: 'Pick a memorable slug.' },
      { title: 'Share', description: 'Copy your short link.' },
    ],
  },
  {
    slug: 'unit-converter',
    name: 'Unit Converter',
    tagline: 'Convert anything, precisely',
    description:
      'Fast, accurate conversions across length, weight, currency, and more — built for everyday work.',
    icon: Ruler,
    category: 'productivity',
    addedAt: '2024-07-24',
    rating: 4.5,
    uses: '150K',
    features: ['Length, weight, volume', 'Live currency rates', 'Copy results', 'Keyboard friendly'],
    steps: [
      { title: 'Choose units', description: 'Pick from and to units.' },
      { title: 'Enter a value', description: 'Type the amount to convert.' },
      { title: 'Copy', description: 'Grab the precise result.' },
    ],
  },
  {
    slug: 'timesheet',
    name: 'Timesheet Builder',
    tagline: 'Track hours, bill accurately',
    description:
      'Log billable hours by client and project, then export a timesheet or push straight to an invoice.',
    icon: Clock3,
    category: 'productivity',
    status: 'pro',
    addedAt: '2024-08-28',
    rating: 4.7,
    uses: '110K',
    features: ['Per-client projects', 'Billable rates', 'Weekly summaries', 'Convert to invoice'],
    steps: [
      { title: 'Log time', description: 'Add hours by project and task.' },
      { title: 'Review', description: 'Check weekly and monthly totals.' },
      { title: 'Bill it', description: 'Turn hours into an invoice.' },
    ],
  },
  {
    slug: 'email-signature',
    name: 'Email Signature Maker',
    tagline: 'Professional sign-offs',
    description:
      'Design a clean, on-brand email signature with your logo, links, and contact details.',
    icon: Mail,
    category: 'productivity',
    addedAt: '2024-09-05',
    rating: 4.6,
    uses: '130K',
    features: ['Logo and headshot', 'Social links', 'Copy-ready HTML', 'Multiple layouts'],
    steps: [
      { title: 'Add details', description: 'Name, role, and contact info.' },
      { title: 'Style it', description: 'Pick a layout and colors.' },
      { title: 'Install', description: 'Copy into your email client.' },
    ],
  },
  {
    slug: 'csv-cleaner',
    name: 'CSV Cleaner',
    tagline: 'Tidy data, no spreadsheets',
    description:
      'Clean, dedupe, and reformat CSV files in your browser — perfect before importing client lists.',
    icon: Table2,
    category: 'productivity',
    status: 'new',
    addedAt: '2024-10-15',
    rating: 4.5,
    uses: '47K',
    features: ['Remove duplicates', 'Trim and reformat', 'Column mapping', 'Private, in-browser'],
    steps: [
      { title: 'Upload a CSV', description: 'Drop in your data file.' },
      { title: 'Clean it', description: 'Dedupe, trim, and remap columns.' },
      { title: 'Export', description: 'Download the tidy file.' },
    ],
  },
]

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug)
}
export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug)
}
export function toolsByCategory(slug: string) {
  return tools.filter((t) => t.category === slug)
}
export function categoryName(slug: string) {
  return categories.find((c) => c.slug === slug)?.name ?? slug
}
export function popularTools() {
  return tools.filter((t) => t.status === 'popular')
}
export function newTools() {
  return [...tools].sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1)).slice(0, 6)
}
export function relatedTools(tool: CatalogTool, count = 3) {
  return tools
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, count)
}

/* ------------------------------------------------------------------ */
/* Blog                                                                */
/* ------------------------------------------------------------------ */

export type Author = {
  name: string
  role: string
  initials: string
}

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  author: Author
  date: string
  readingTime: number
  featured?: boolean
  content: { heading?: string; paragraphs: string[] }[]
}

export const blogCategories = ['All', 'Invoicing', 'Taxes', 'Freelancing', 'Product', 'Growth']

const authors: Record<string, Author> = {
  maya: { name: 'Maya Okafor', role: 'Head of Content', initials: 'MO' },
  daniel: { name: 'Daniel Reyes', role: 'Finance Writer', initials: 'DR' },
  sofia: { name: 'Sofia Lindqvist', role: 'Product Marketing', initials: 'SL' },
  amir: { name: 'Amir Haddad', role: 'Founder', initials: 'AH' },
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'get-paid-faster-invoicing',
    title: 'Seven small invoicing habits that get you paid twice as fast',
    excerpt:
      'The difference between a 45-day wait and a 7-day payment is rarely the client. It is the invoice. Here is what actually moves the needle.',
    category: 'Invoicing',
    author: authors.maya,
    date: '2024-10-12',
    readingTime: 6,
    featured: true,
    content: [
      {
        paragraphs: [
          'Every business owner has felt it: the quiet anxiety of an invoice sent into the void. You did the work, you sent the bill, and now you wait. The good news is that getting paid faster is far more within your control than it feels.',
          'After analyzing millions of invoices sent through ToolForge, a few patterns stand out. None of them require awkward conversations — they are structural changes to how you bill.',
        ],
      },
      {
        heading: 'Send the invoice the day the work ships',
        paragraphs: [
          'Momentum matters. An invoice that arrives while the value you delivered is still fresh gets paid noticeably faster than one that shows up weeks later. Build invoicing into your delivery checklist, not your end-of-month admin.',
        ],
      },
      {
        heading: 'Make the due date unmissable',
        paragraphs: [
          'Vague terms like "payable upon receipt" invite delay. A specific date — and a clear, polite reminder schedule — sets expectations and removes ambiguity. ToolForge can send those reminders automatically so you never have to chase.',
        ],
      },
      {
        heading: 'Reduce the friction of paying',
        paragraphs: [
          'Every extra step between your client and the "paid" button costs you days. Include clear payment details, offer the methods your clients actually use, and keep the invoice itself clean and easy to scan.',
        ],
      },
    ],
  },
  {
    slug: 'cross-border-tax-basics',
    title: 'Cross-border invoicing without the tax headaches',
    excerpt:
      'Billing a client in another country? Here is a plain-language guide to VAT, GST, and reverse charge that will not put you to sleep.',
    category: 'Taxes',
    author: authors.daniel,
    date: '2024-09-30',
    readingTime: 8,
    content: [
      {
        paragraphs: [
          'International clients are one of the best things that can happen to a small business — and one of the most confusing when it comes to tax. The rules feel arcane, but the day-to-day reality is simpler than the jargon suggests.',
        ],
      },
      {
        heading: 'Know where the supply happens',
        paragraphs: [
          'Most cross-border tax questions come down to a single idea: where, legally, does the sale take place? That determines whose rules apply. For digital services to businesses, the answer is often the customer’s country — which is where reverse charge comes in.',
        ],
      },
      {
        heading: 'Let the tools do the math',
        paragraphs: [
          'You do not need to memorize rate tables. Set your region once, validate your client’s tax ID, and let ToolForge apply the right treatment to each line item automatically.',
        ],
      },
    ],
  },
  {
    slug: 'freelance-pricing-guide',
    title: 'How to price your work without underselling yourself',
    excerpt:
      'Pricing is the highest-leverage decision a freelancer makes. A practical framework for setting rates you can defend.',
    category: 'Freelancing',
    author: authors.sofia,
    date: '2024-09-18',
    readingTime: 7,
    content: [
      {
        paragraphs: [
          'If you have ever named a price and immediately wished you had said a bigger number, this one is for you. Pricing well is a skill, and like any skill it can be learned.',
        ],
      },
      {
        heading: 'Start from your number, not the market',
        paragraphs: [
          'Work out what you need to earn to run a healthy business, then reverse-engineer your rates from there. The market is a sanity check, not a starting point.',
        ],
      },
      {
        heading: 'Price the outcome, not the hours',
        paragraphs: [
          'Clients buy results, not time. When you frame pricing around the value delivered, the conversation shifts from "that seems expensive" to "that seems worth it."',
        ],
      },
    ],
  },
  {
    slug: 'introducing-recurring-billing',
    title: 'Introducing Recurring Billing: retainers on autopilot',
    excerpt:
      'Set up a billing schedule once and let ToolForge handle every cycle. Here is what is new and how to get started.',
    category: 'Product',
    author: authors.amir,
    date: '2024-09-02',
    readingTime: 4,
    content: [
      {
        paragraphs: [
          'Recurring revenue is the backbone of a stable business, but chasing it manually is a chore. Today we are launching Recurring Billing to take that chore off your plate entirely.',
        ],
      },
      {
        heading: 'How it works',
        paragraphs: [
          'Create an invoice template, choose a cadence, and ToolForge sends it automatically on schedule. Pause, resume, or edit any time. Failed payments trigger polite reminders without any effort from you.',
        ],
      },
    ],
  },
  {
    slug: 'brand-your-invoices',
    title: 'Why on-brand invoices win more repeat business',
    excerpt:
      'Your invoice is a touchpoint, not just a transaction. Small branding choices compound into trust — and trust drives repeat work.',
    category: 'Growth',
    author: authors.maya,
    date: '2024-08-20',
    readingTime: 5,
    content: [
      {
        paragraphs: [
          'It is easy to think of an invoice as the least glamorous document your business produces. But it is often the last thing a client sees after a great experience — and the first thing they see when deciding to hire you again.',
        ],
      },
      {
        heading: 'Consistency signals reliability',
        paragraphs: [
          'When your invoice looks like the rest of your brand, it quietly tells clients you sweat the details. That impression carries over to how they perceive your actual work.',
        ],
      },
    ],
  },
  {
    slug: 'expense-tracking-for-teams',
    title: 'A calmer way to track expenses across a small team',
    excerpt:
      'Shared spend does not have to mean shared chaos. A simple system for keeping every receipt accounted for.',
    category: 'Product',
    author: authors.daniel,
    date: '2024-08-06',
    readingTime: 6,
    content: [
      {
        paragraphs: [
          'The moment a business grows past one person, expenses get messy. Receipts scatter across inboxes and pockets, and reconciliation becomes a monthly scramble.',
        ],
      },
      {
        heading: 'One ledger, everyone contributing',
        paragraphs: [
          'The fix is not more spreadsheets — it is a single shared ledger where every team member logs spend as it happens. ToolForge keeps it audit-ready and exportable.',
        ],
      },
    ],
  },
]

export function getPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug)
}
export function relatedPosts(post: BlogPost, count = 3) {
  return blogPosts.filter((p) => p.slug !== post.slug).slice(0, count)
}

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */

export type CaseStudy = {
  slug: string
  company: string
  industry: string
  logo: string
  quote: string
  person: string
  role: string
  initials: string
  metrics: { value: string; label: string }[]
  summary: string
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'studio-meridian',
    company: 'Studio Meridian',
    industry: 'Design agency',
    logo: 'Meridian',
    quote:
      'We replaced three separate tools with ToolForge. Invoicing that used to take an afternoon now takes minutes, and everything matches our brand.',
    person: 'Maya Okafor',
    role: 'Founder',
    initials: 'MO',
    metrics: [
      { value: '4×', label: 'Faster invoicing' },
      { value: '18 days', label: 'Shorter payment cycle' },
      { value: '$120K', label: 'Cash flow freed up' },
    ],
    summary:
      'A boutique design studio consolidated invoicing, quotes, and contracts into a single branded workspace.',
  },
  {
    slug: 'cadence-labs',
    company: 'Cadence Labs',
    industry: 'Software consultancy',
    logo: 'Cadence',
    quote:
      'The tax handling alone is worth it. Cross-border invoices are calculated correctly every time — our accountant stopped emailing us.',
    person: 'Daniel Reyes',
    role: 'Finance Lead',
    initials: 'DR',
    metrics: [
      { value: '0', label: 'Tax corrections last year' },
      { value: '30+', label: 'Countries billed' },
      { value: '99%', label: 'On-time payments' },
    ],
    summary:
      'A global consultancy standardized cross-border billing across 30+ countries with automated tax.',
  },
  {
    slug: 'evergreen-co',
    company: 'Evergreen Co.',
    industry: 'Sustainability retail',
    logo: 'Evergreen',
    quote:
      'Our whole finance team lives in ToolForge now. Roles and shared templates keep everyone aligned without endless back-and-forth.',
    person: 'Priya Nair',
    role: 'Operations Director',
    initials: 'PN',
    metrics: [
      { value: '12 hrs', label: 'Saved per week' },
      { value: '5', label: 'Team members aligned' },
      { value: '2×', label: 'Faster month-end close' },
    ],
    summary:
      'A growing retailer brought a five-person finance team onto shared templates and approval workflows.',
  },
]

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug)
}

/* ------------------------------------------------------------------ */
/* Help center                                                         */
/* ------------------------------------------------------------------ */

export type HelpCategory = {
  slug: string
  name: string
  description: string
  icon: LucideIcon
  articleCount: number
}

export const helpCategories: HelpCategory[] = [
  {
    slug: 'getting-started',
    name: 'Getting started',
    description: 'Set up your account, brand your documents, and send your first invoice.',
    icon: Zap,
    articleCount: 12,
  },
  {
    slug: 'billing-payments',
    name: 'Billing & payments',
    description: 'Plans, upgrades, invoices from us, and managing your subscription.',
    icon: CreditCard,
    articleCount: 9,
  },
  {
    slug: 'invoices-quotes',
    name: 'Invoices & quotes',
    description: 'Everything about creating, sending, and tracking your documents.',
    icon: Receipt,
    articleCount: 18,
  },
  {
    slug: 'tax-compliance',
    name: 'Tax & compliance',
    description: 'Configure regions, tax rules, and keep your paperwork audit-ready.',
    icon: Landmark,
    articleCount: 14,
  },
  {
    slug: 'teams-roles',
    name: 'Teams & roles',
    description: 'Invite teammates, set permissions, and manage shared templates.',
    icon: Users,
    articleCount: 7,
  },
  {
    slug: 'security-privacy',
    name: 'Security & privacy',
    description: 'How we protect your data, plus SSO and compliance details.',
    icon: ShieldCheck,
    articleCount: 8,
  },
]

export const popularArticles: { title: string; category: string }[] = [
  { title: 'How to create and send your first invoice', category: 'Getting started' },
  { title: 'Adding your logo and brand colors', category: 'Getting started' },
  { title: 'Setting up automatic payment reminders', category: 'Invoices & quotes' },
  { title: 'Configuring tax for your region', category: 'Tax & compliance' },
  { title: 'Upgrading, downgrading, or canceling your plan', category: 'Billing & payments' },
  { title: 'Inviting team members and setting roles', category: 'Teams & roles' },
]

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

export const companyValues: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: 'Craft over clutter',
    description:
      'We sweat the details so our customers do not have to. Every tool should feel considered, calm, and fast.',
    icon: Briefcase,
  },
  {
    title: 'Trust by default',
    description:
      'Financial software is a promise. We protect data rigorously and build compliance in from day one.',
    icon: ShieldCheck,
  },
  {
    title: 'For the underdog',
    description:
      'We build for freelancers and small teams — the people who wear every hat and deserve enterprise-grade tools.',
    icon: Users,
  },
  {
    title: 'Global from the start',
    description:
      'Business is borderless. Our tools work across regions, currencies, and tax systems out of the box.',
    icon: Globe2,
  },
]

export const timeline: { year: string; title: string; description: string }[] = [
  {
    year: '2019',
    title: 'A free invoice generator',
    description: 'ToolForge started as a single tool built to make one founder’s billing less painful.',
  },
  {
    year: '2021',
    title: 'From one tool to a toolkit',
    description: 'Quotes, receipts, and expense tracking joined, unified under one shared workspace.',
  },
  {
    year: '2022',
    title: 'Going global',
    description: 'Region-aware tax support launched, opening ToolForge to businesses in 180+ countries.',
  },
  {
    year: '2024',
    title: '40+ tools, millions of documents',
    description: 'ToolForge now powers over 2.4M documents a year for businesses of every size.',
  },
]

export const leadership: { name: string; role: string; initials: string }[] = [
  { name: 'Amir Haddad', role: 'Co-founder & CEO', initials: 'AH' },
  { name: 'Lena Fischer', role: 'Co-founder & CTO', initials: 'LF' },
  { name: 'Marcus Cole', role: 'VP of Product', initials: 'MC' },
  { name: 'Ada Owusu', role: 'VP of Engineering', initials: 'AO' },
  { name: 'Yuki Tanaka', role: 'Head of Design', initials: 'YT' },
  { name: 'Sofia Lindqvist', role: 'Head of Marketing', initials: 'SL' },
]

/* ------------------------------------------------------------------ */
/* Pricing comparison                                                  */
/* ------------------------------------------------------------------ */

export type FeatureRow = {
  feature: string
  free: string | boolean
  pro: string | boolean
  business: string | boolean
}

export const featureGroups: { group: string; rows: FeatureRow[] }[] = [
  {
    group: 'Documents',
    rows: [
      { feature: 'Documents per month', free: '3', pro: 'Unlimited', business: 'Unlimited' },
      { feature: 'Invoice & quote tools', free: true, pro: true, business: true },
      { feature: 'All 40+ tools', free: false, pro: true, business: true },
      { feature: 'Custom branding', free: false, pro: true, business: true },
      { feature: 'Recurring billing', free: false, pro: true, business: true },
    ],
  },
  {
    group: 'Collaboration',
    rows: [
      { feature: 'Team members', free: '1', pro: '3', business: '10' },
      { feature: 'Shared templates', free: false, pro: true, business: true },
      { feature: 'Approval workflows', free: false, pro: false, business: true },
      { feature: 'Roles & permissions', free: false, pro: false, business: true },
    ],
  },
  {
    group: 'Compliance & support',
    rows: [
      { feature: 'Region-aware tax', free: true, pro: true, business: true },
      { feature: 'Audit log', free: false, pro: false, business: true },
      { feature: 'SSO', free: false, pro: false, business: true },
      { feature: 'Support', free: 'Email', pro: 'Priority', business: 'Dedicated manager' },
    ],
  },
]

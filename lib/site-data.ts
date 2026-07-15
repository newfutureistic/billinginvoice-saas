import {
  Receipt,
  QrCode,
  Briefcase,
  Users,
  Landmark,
  CreditCard,
  ShieldCheck,
  Globe2,
  Zap,
  type LucideIcon,
} from 'lucide-react'

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
          'After analyzing millions of invoices sent through Bill Maker, a few patterns stand out. None of them require awkward conversations — they are structural changes to how you bill.',
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
          'Vague terms like "payable upon receipt" invite delay. A specific date — and a clear, polite reminder schedule — sets expectations and removes ambiguity. Bill Maker can send those reminders automatically so you never have to chase.',
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
          'You do not need to memorize rate tables. Set your region once, validate your client’s tax ID, and let Bill Maker apply the right treatment to each line item automatically.',
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
      'Set up a billing schedule once and let Bill Maker handle every cycle. Here is what is new and how to get started.',
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
          'Create an invoice template, choose a cadence, and Bill Maker sends it automatically on schedule. Pause, resume, or edit any time. Failed payments trigger polite reminders without any effort from you.',
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
          'The fix is not more spreadsheets — it is a single shared ledger where every team member logs spend as it happens. Bill Maker keeps it audit-ready and exportable.',
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
    company: 'Example Studio',
    industry: 'Design agency',
    logo: 'Meridian',
    quote:
      'We replaced three separate tools with Bill Maker. Invoicing that used to take an afternoon now takes minutes, and everything matches our brand.',
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
    company: 'Sample Labs',
    industry: 'Software consultancy',
    logo: 'Sample',
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
    company: 'Demo Co.',
    industry: 'Sustainability retail',
    logo: 'Demo',
    quote:
      'Our whole finance team lives in Bill Maker now. Roles and shared templates keep everyone aligned without endless back-and-forth.',
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
    description: 'Bill Maker started as a single tool built to make one founder’s billing less painful.',
  },
  {
    year: '2021',
    title: 'From one tool to a toolkit',
    description: 'Invoices, receipts, and payment tracking unified in one workspace.',
  },
  {
    year: '2022',
    title: 'Going global',
    description: 'Region-aware tax support — GST, VAT, and sales tax — and multi-currency invoicing.',
  },
  {
    year: '2024',
    title: 'Invoicing that scales with you',
    description: 'Online payments, QR pay links, payment tracking, and a free plan for every business.',
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
      { feature: 'All invoice templates', free: false, pro: true, business: true },
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

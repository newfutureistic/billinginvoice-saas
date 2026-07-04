# ToolForge — Route Map & Navigation

## Route Structure (57 Routes)

### Root Routes (2)
```
/                 → HomePage (marketing homepage)
/design-system    → DesignSystemPage (interactive component library)
```

### Public Site Routes (20)
```
(site)/ → PublicLayout
  /tools                          → ToolsPage (search + filter)
    [slug]/                       → ToolDetailPage
    category/[category]/          → CategoryPage
  /pricing                        → PricingPage (with billing toggle)
  /templates                      → TemplatesPage (8 designs)
  /blog                           → BlogPage (with category filter)
    [slug]/                       → BlogArticlePage
  /customers                      → CustomersPage (case studies)
    [slug]/                       → CustomerDetailPage
  /about                          → AboutPage
  /contact                        → ContactPage
  /help                           → HelpPage (help center + search)
  /privacy                        → PrivacyPage
  /terms                          → TermsPage
```

### Authentication Routes (6)
```
auth/ → AuthLayout
  /sign-in          → SignInPage
  /sign-up          → SignUpPage
  /forgot-password  → ForgotPasswordPage
  /reset-password   → ResetPasswordPage
  /verify-email     → VerifyEmailPage
  /two-factor       → TwoFactorPage
```

### Onboarding Routes (7)
```
onboarding/ → OnboardingLayout (with progress bar)
  /welcome          → WelcomePage
  /company          → CompanyPage
  /branding         → BrandingPage
  /currency         → CurrencyPage
  /tax              → TaxPage
  /templates        → TemplatesPage
  /finish           → FinishPage
```

### Invoice Generator Routes (4)
```
invoice/ → InvoiceLayout
  /                 → InvoiceHubPage
  /new              → InvoiceBuilderPage (10 steps)
  /templates        → InvoiceTemplatesPage
  /preview          → InvoicePreviewPage
```

### Dashboard Routes (12)
```
dashboard/ → DashboardLayout (AppShell with sidebar + topbar)
  /                 → DashboardPage (overview + KPIs)
  /invoices         → InvoicesListPage
    [id]/           → InvoiceDetailPage
  /clients          → ClientsListPage
    [id]/           → ClientDetailPage
  /products         → ProductsListPage
  /templates        → TemplatesPage
  /analytics        → AnalyticsPage
  /team             → TeamPage
  /settings         → SettingsPage
  /profile          → ProfilePage
  /notifications    → NotificationsPage
```

---

## Navigation Flow

### User Journeys

#### Public User (No Account)
```
/ (homepage)
  ↓
/tools (explore tools)
  ↓ [click tool]
/tools/[slug] (read tool details)
  ↓
/pricing (see plans)
  ↓
/templates (preview designs)
  ↓ [create account]
/auth/sign-up (signup form)
  ↓
/auth/verify-email (verify code)
  ↓ [optional]
/auth/two-factor (setup 2FA)
  ↓
/onboarding/welcome (guided setup)
  ↓
/onboarding/company (business details)
  ↓
/onboarding/branding (logo + color)
  ↓
/onboarding/currency (currency selection)
  ↓
/onboarding/tax (tax setup)
  ↓
/onboarding/templates (template selection)
  ↓
/onboarding/finish (completion)
  ↓
/dashboard (authenticated app)
```

#### Returning User
```
/auth/sign-in (email + password)
  ↓
/dashboard (straight to dashboard)
  ↓ [create invoice]
/invoice/new (10-step builder)
  ↓
/invoice/templates (choose design)
  ↓ [select template]
/invoice/new (back to builder with template)
  ↓ [preview]
/invoice/preview (fullscreen preview)
  ↓ [save]
/dashboard/invoices (saved to list)
  ↓ [view]
/dashboard/invoices/[id] (detail view)
```

#### Team Member
```
/dashboard (overview)
  ↓
/dashboard/invoices (view invoices)
  ↓
/dashboard/clients (view clients)
  ↓
/dashboard/products (view products)
  ↓
/dashboard/team (view team members)
  ↓
/dashboard/settings (workspace settings)
```

#### Admin
```
/dashboard (overview)
  ↓
/dashboard/analytics (revenue analytics)
  ↓
/dashboard/team (manage team + roles)
  ↓
/dashboard/settings (configure workspace)
```

---

## Layout Hierarchy

### Root
```
RootLayout
├── Metadata
├── Fonts (Geist)
├── Analytics (Vercel)
├── Design tokens (CSS variables)
└── {children}
```

### Public Site
```
PublicLayout (app/(site)/layout.tsx)
├── PublicHeader (nav with dropdown)
├── {children}
│   ├── HomePage
│   ├── ToolsPage / ToolDetailPage
│   ├── PricingPage
│   ├── BlogPage / BlogArticlePage
│   ├── CustomersPage / CustomerDetailPage
│   ├── TemplatesPage
│   ├── AboutPage
│   ├── ContactPage
│   ├── HelpPage
│   ├── PrivacyPage
│   └── TermsPage
└── PublicFooter (links + newsletter)
```

### Authentication
```
AuthLayout (app/auth/layout.tsx)
├── Centered container
└── {children}
    ├── SignInPage
    ├── SignUpPage
    ├── ForgotPasswordPage
    ├── ResetPasswordPage
    ├── VerifyEmailPage
    └── TwoFactorPage
```

### Onboarding
```
OnboardingLayout (app/onboarding/layout.tsx)
├── Progress bar
├── Step title
├── {children}
│   ├── WelcomePage
│   ├── CompanyPage
│   ├── BrandingPage
│   ├── CurrencyPage
│   ├── TaxPage
│   ├── TemplatesPage
│   └── FinishPage
└── Navigation buttons (prev/next)
```

### Invoice Generator
```
InvoiceLayout (app/invoice/layout.tsx)
└── {children}
    ├── InvoiceHubPage
    ├── InvoiceBuilderPage
    │   ├── Step indicator
    │   ├── Form (left)
    │   ├── Preview (right)
    │   └── Navigation
    ├── InvoiceTemplatesPage
    └── InvoicePreviewPage (fullscreen)
```

### Dashboard
```
DashboardLayout (app/dashboard/layout.tsx)
├── AppShell
│   ├── Sidebar
│   │   ├── Logo
│   │   ├── WorkspaceSwitcher
│   │   ├── Nav items
│   │   └── Account menu
│   ├── Topbar
│   │   ├── Breadcrumbs
│   │   ├── Search
│   │   └── Icons (notifications, help, user)
│   └── Main
│       └── {children}
│           ├── DashboardPage
│           ├── InvoicesListPage / InvoiceDetailPage
│           ├── ClientsListPage / ClientDetailPage
│           ├── ProductsListPage
│           ├── TemplatesPage
│           ├── AnalyticsPage
│           ├── TeamPage
│           ├── SettingsPage
│           ├── ProfilePage
│           └── NotificationsPage
```

---

## URL Parameters

### Dynamic Routes

#### Tool Pages
```
/tools/[slug]
  slug: string (tool identifier)
  example: /tools/invoice-generator
           /tools/receipt-maker
           /tools/quote-builder
```

#### Tool Categories
```
/tools/category/[category]
  category: string (category slug)
  example: /tools/category/billing-invoicing
           /tools/category/documents-contracts
           /tools/category/finance-tax
           /tools/category/productivity
```

#### Blog Articles
```
/blog/[slug]
  slug: string (article identifier)
  example: /blog/how-to-create-invoice
           /blog/tax-deadline-2024
           /blog/getting-paid-faster
```

#### Case Studies
```
/customers/[slug]
  slug: string (customer identifier)
  example: /customers/acme-corp
           /customers/startup-success
```

#### Invoices
```
/dashboard/invoices/[id]
  id: string (invoice UUID)
  example: /dashboard/invoices/inv-001
           /dashboard/invoices/inv-2024-001
```

#### Clients
```
/dashboard/clients/[id]
  id: string (client UUID)
  example: /dashboard/clients/client-001
```

---

## Query Parameters

### Search & Filtering

#### Tools Page
```
/tools?search=invoice&category=billing-invoicing&sort=popular
  search: string (search term)
  category: string (filter by category)
  sort: 'popular' | 'new' | 'rating'
  page: number (pagination)
```

#### Blog Page
```
/blog?category=getting-started&author=john-doe&sort=newest
  category: string (filter by category)
  author: string (filter by author)
  sort: 'newest' | 'oldest' | 'popular'
  page: number (pagination)
```

#### Dashboard Invoices
```
/dashboard/invoices?status=draft&sort=date&order=desc
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  sort: 'date' | 'amount' | 'client'
  order: 'asc' | 'desc'
  page: number (pagination)
```

#### Help Center
```
/help?search=invoice&category=getting-started
  search: string (search term)
  category: string (filter by category)
```

---

## Deep Linking

### Valid Deep Links
```
/dashboard                    → Goes to dashboard
/dashboard/invoices          → Invoices list
/dashboard/invoices/inv-001  → Specific invoice
/invoice/new                 → Start new invoice (step 1)
/auth/sign-in                → Login page
/tools                       → Tools hub
/tools/invoice-generator     → Specific tool
/pricing                     → Pricing page
/blog/article-slug           → Blog article
```

### Invalid/Redirecting Routes
```
/unknown-page                → 404 error
/dashboard/unknown           → 404 error
/auth/logout                 → Not implemented (mock)
/api/*                       → No API endpoints (mock data only)
```

---

## Breadcrumb Navigation

### Public Site
```
/ → /tools → /tools/[slug]
    Breadcrumb: Home > Tools > Tool Name

/ → /blog → /blog/[slug]
    Breadcrumb: Home > Blog > Article Title

/ → /customers → /customers/[slug]
    Breadcrumb: Home > Customers > Company Name
```

### Dashboard
```
/dashboard
    Breadcrumb: Dashboard

/dashboard/invoices
    Breadcrumb: Dashboard > Invoices

/dashboard/invoices/[id]
    Breadcrumb: Dashboard > Invoices > INV-2024-001

/dashboard/clients/[id]
    Breadcrumb: Dashboard > Clients > Client Name
```

---

## Route Metadata

### Metadata by Route

#### Public Site
- HomePage: title="ToolForge", description="Professional SaaS platform"
- ToolsPage: title="Tools", description="40+ business tools"
- ToolDetailPage: title="[Tool Name]", description="[Tool description]"
- PricingPage: title="Pricing", description="3 flexible plans"
- BlogPage: title="Blog", description="Articles and insights"
- BlogArticlePage: title="[Article Title]", description="[Article excerpt]"
- CustomersPage: title="Customers", description="Case studies"
- AboutPage: title="About", description="Company info"
- ContactPage: title="Contact", description="Get in touch"
- HelpPage: title="Help Center", description="FAQs and articles"

#### Authentication
- All pages: title="[Page Name] — ToolForge", robots: noindex

#### Onboarding
- All pages: title="Setup ToolForge", robots: noindex

#### Dashboard
- All pages: title="[Page Name] — ToolForge", robots: noindex

#### Invoice Generator
- All pages: title="[Page Name] — ToolForge", robots: noindex

---

## Route Permissions (Future Implementation)

### Public Routes (No Auth Required)
```
/ (homepage)
/tools*
/pricing
/templates
/blog*
/customers*
/about
/contact
/help
/privacy
/terms
/auth/*
/design-system
```

### Protected Routes (Auth Required)
```
/dashboard* (all dashboard pages)
/invoice/* (all invoice pages)
/onboarding/* (all onboarding pages)
```

### Admin Routes (Admin Role Only)
```
/dashboard/team (view all team members)
/dashboard/settings (configure workspace)
/dashboard/analytics (view workspace analytics)
```

---

## 404 & Error Handling

### Current Behavior
- 404 pages exist for:
  - `/tools/[slug]/not-found.tsx`
  - `/tools/[slug]/loading.tsx`
- All other invalid routes fall through to Next.js default 404

### Future Improvements Needed
- Global error.tsx for error boundaries
- Global not-found.tsx fallback
- Proper error page design
- Stack trace hiding in production

---

## Sitemap & SEO

### Sitemap Structure
```
ToolForge Sitemap
├── https://toolforge.app/ (priority 1.0, weekly)
├── https://toolforge.app/tools (priority 0.9, weekly)
├── https://toolforge.app/tools/[slug] (priority 0.8, monthly)
├── https://toolforge.app/pricing (priority 0.9, weekly)
├── https://toolforge.app/blog (priority 0.8, weekly)
├── https://toolforge.app/blog/[slug] (priority 0.7, monthly)
├── https://toolforge.app/customers (priority 0.8, monthly)
├── https://toolforge.app/about (priority 0.5, yearly)
├── https://toolforge.app/contact (priority 0.5, monthly)
├── https://toolforge.app/help (priority 0.8, monthly)
├── https://toolforge.app/privacy (priority 0.3, yearly)
└── https://toolforge.app/terms (priority 0.3, yearly)

Excluded (robots: noindex):
├── /auth/* (login/signup pages)
├── /dashboard/* (protected area)
├── /onboarding/* (setup flow)
├── /invoice/* (protected area)
└── /design-system (internal reference)
```

---

## Route State Management

### State Persistence
- No localStorage used for route state
- All state is component-level or query parameters
- Navigating away = state lost (by design)

### Query Parameter Persistence
- Search/filter state: Preserved in URL
- Sort order: Preserved in URL
- Page number: Preserved in URL
- Form data: Lost on navigation

---

## Summary

- **57 total routes**
- **6 major sections** (public, auth, onboarding, invoice, dashboard, design-system)
- **Clear hierarchy** with layouts
- **Type-safe routing** with TypeScript
- **SEO-optimized** public pages
- **Protected dashboard** routes
- **Deep linking support**
- **Breadcrumb navigation**


# ToolForge — Complete Project Map

## Overview
ToolForge is a comprehensive SaaS business operating platform with:
- **Public marketing website** (14 pages)
- **Professional invoice generator** (10-step wizard with 8 templates)
- **Authenticated dashboard** (12 pages)
- **Authentication system** (6 pages)
- **Onboarding flow** (7 steps)
- **Design system** (interactive reference at `/design-system`)
- **57 total routes**, all prerendered

**Tech Stack:**
- Next.js 16 (App Router, fully static)
- React 19
- Tailwind CSS v4 (design-first)
- TypeScript 5.7 (strict mode)
- Lucide icons
- Zero backend (frontend mock data only)

---

## Folder Structure

```
/vercel/share/v0-project/
├── app/                           # Next.js App Router
│   ├── page.tsx                  # Marketing homepage
│   ├── layout.tsx                # Root layout with Geist fonts & metadata
│   ├── globals.css               # Design system tokens (5-color palette)
│   ├── (site)/                   # Public site route group
│   │   ├── layout.tsx            # Site layout with PublicHeader/PublicFooter
│   │   ├── page.tsx              # Redirects to /tools
│   │   ├── tools/                # Tools hub + detail pages
│   │   │   ├── page.tsx          # Tools explorer (search + filter)
│   │   │   ├── [slug]/           # Tool detail page
│   │   │   ├── category/[category]/ # Category pages
│   │   │   └── loading.tsx       # Skeleton loaders
│   │   ├── pricing/              # Pricing page with toggle
│   │   ├── blog/                 # Blog hub + articles
│   │   │   ├── page.tsx          # Blog with category filter
│   │   │   └── [slug]/           # Article pages
│   │   ├── customers/            # Case studies
│   │   │   ├── page.tsx          # Customer listing
│   │   │   └── [slug]/           # Case study detail
│   │   ├── about/                # Company info
│   │   ├── contact/              # Contact form page
│   │   ├── help/                 # Help center
│   │   ├── privacy/              # Privacy policy
│   │   └── terms/                # Terms of service
│   ├── auth/                     # Authentication pages
│   │   ├── layout.tsx            # Auth layout
│   │   ├── sign-in/              # Email/password sign in
│   │   ├── sign-up/              # Account creation
│   │   ├── forgot-password/      # Password recovery start
│   │   ├── reset-password/       # Password reset form
│   │   ├── verify-email/         # Email verification (6-digit code)
│   │   └── two-factor/           # 2FA (authenticator or backup code)
│   ├── onboarding/               # Guided setup after signup
│   │   ├── layout.tsx            # Onboarding layout with progress
│   │   ├── welcome/              # Welcome & intro
│   │   ├── company/              # Business details
│   │   ├── branding/             # Logo & color picker
│   │   ├── currency/             # Currency selection
│   │   ├── tax/                  # Tax configuration
│   │   ├── templates/            # Template selection (6 designs)
│   │   └── finish/               # Completion
│   ├── dashboard/                # Authenticated app
│   │   ├── layout.tsx            # Sidebar + topbar (AppShell)
│   │   ├── page.tsx              # Overview (KPIs + charts)
│   │   ├── invoices/             # Invoice management
│   │   │   ├── page.tsx          # Invoice list (table)
│   │   │   └── [id]/             # Invoice detail view
│   │   ├── clients/              # Client management
│   │   │   ├── page.tsx          # Client list (table)
│   │   │   └── [id]/             # Client detail
│   │   ├── products/             # Product catalog
│   │   ├── templates/            # Template gallery
│   │   ├── analytics/            # Revenue & metrics
│   │   ├── team/                 # Team management
│   │   ├── settings/             # Account settings
│   │   ├── profile/              # User profile
│   │   └── notifications/        # Notification center
│   ├── invoice/                  # Invoice generator
│   │   ├── layout.tsx            # Invoice layout
│   │   ├── page.tsx              # Invoice hub
│   │   ├── new/                  # Invoice builder
│   │   ├── templates/            # Template gallery
│   │   └── preview/              # Full-screen preview
│   └── design-system/            # Design reference
│       └── page.tsx              # Interactive component library
├── components/                   # Reusable React components
│   ├── auth/                     # Auth form component
│   ├── dashboard/                # Dashboard UI (AppShell, KPI cards, tables)
│   ├── ds/                       # Design system reference
│   │   ├── primitives.tsx        # SectionHeader, TokenBlock
│   │   ├── controls.tsx          # Button, form, badge examples
│   │   ├── surfaces.tsx          # Card, dialog, table examples
│   │   └── foundations.tsx       # Color, type, spacing scales
│   ├── invoice/                  # Invoice generator
│   │   ├── invoice-builder.tsx   # Main 2-panel layout
│   │   ├── invoice-preview.tsx   # Live preview with zoom
│   │   ├── form-inputs.tsx       # FormField, Input, Checkbox, etc.
│   │   └── step-1-business.tsx   # ... step-10-final.tsx
│   ├── marketing/                # Homepage components
│   │   ├── hero.tsx              # Hero section with invoice preview
│   │   ├── site-header.tsx       # Marketing nav
│   │   ├── social-proof.tsx      # Logos & stats
│   │   ├── featured-tools.tsx    # Asymmetric tool showcase
│   │   ├── templates-showcase.tsx # Template previews
│   │   └── pricing-preview.tsx   # 3-tier pricing
│   ├── onboarding/               # Onboarding UI
│   │   └── onboarding-step.tsx   # Reusable step wrapper
│   ├── site/                     # Public site components
│   │   ├── public-header.tsx     # Site nav with dropdown
│   │   ├── public-footer.tsx     # Footer with links
│   │   ├── breadcrumbs.tsx       # Breadcrumb navigation
│   │   ├── tool-card.tsx         # Reusable tool card
│   │   ├── tools-explorer.tsx    # Search + filter UI
│   │   ├── pricing-plans.tsx     # Pricing table
│   │   └── contact-form.tsx      # Contact form with validation
│   ├── workspace/                # Workspace switcher
│   ├── ui/                       # Primitive UI
│   │   ├── button.tsx            # Button component
│   │   └── states.tsx            # Empty/error/loading/success states
│   └── utils.ts
├── lib/                          # Business logic & data
│   ├── design-tokens.ts          # 5-color palette, typography, spacing
│   ├── invoice-types.ts          # InvoiceData, InvoiceItem types
│   ├── invoice-state.ts          # MOCK_INVOICE, calculateInvoiceTotals
│   ├── invoice-templates.ts      # 8 template designs
│   ├── dashboard-data.ts         # KPIs, invoices, clients, products
│   ├── site-data.ts              # Tools (40+), blog, customers, help
│   ├── auth-data.ts              # Auth copy & flows
│   ├── marketing-content.ts      # Homepage copy
│   ├── hooks/
│   │   └── use-invoice.ts        # State management with undo/redo
│   └── utils.ts                  # cn() for Tailwind merging
├── docs/
│   └── product-architecture.md   # Product/IA spec
├── public/                       # Static assets (none yet)
├── PRODUCTION_READINESS_REPORT.md # Audit results
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config (strict)
├── next.config.mjs               # Next.js config
├── tailwind.config.js            # Tailwind v4 (empty, tokens in CSS)
├── postcss.config.mjs            # PostCSS config
└── components.json               # shadcn init (but no components used)
```

---

## Data Layer Architecture

### Invoice Module
- **Types** (`invoice-types.ts`): `InvoiceData`, `InvoiceItem`, `TaxConfig`, `Currency`
- **State** (`invoice-state.ts`): `MOCK_INVOICE`, `calculateInvoiceTotals()`
- **Hook** (`use-invoice.ts`):
  - State with undo/redo history
  - Field updaters (business, client, items, tax, discount, shipping, branding)
  - Item management (add, duplicate, remove, reorder)
  - Autosave (mock, 1s debounce)
  - isSaving flag, canUndo/canRedo flags
- **Templates** (`invoice-templates.ts`): 8 design variants
- **Calculations**: Subtotal → discount → shipping → tax → total (exclusive/inclusive)

### Dashboard Module
- **Types** (`dashboard-data.ts`): `Invoice`, `Client`, `Product`, `Template`, `Team`, `Notification`, `ActivityLog`, `DashboardKPI`
- **Mock Data**: KPIs (4), invoices (12), clients (8), products (6), templates (6), team (4), notifications (8), activities (6)
- **UI**: AppShell (sidebar + topbar), KPI cards, data tables with sorting/filtering

### Public Site Module
- **Tools** (`site-data.ts`): 40+ CatalogTool objects with 4 categories, ratings, features, steps
- **Blog**: Articles with categories, authors, content
- **Case Studies**: Customer stories with metrics
- **Help Center**: FAQ by category, popular articles
- **Pricing**: 3 tiers (Free, Pro, Enterprise) with annual discount
- **Content**: Marketing copy for all sections

### Authentication Module
- **Types** (`auth-data.ts`): AuthPage type for pages
- **Copy**: Sign in/up/forgot/reset/verify/2FA text and labels
- **UI**: Auth form component, 6 page templates
- **Flow**: Email+password → verify email → optional 2FA → dashboard

---

## Component Hierarchy

### Global Components
- `RootLayout` (app/layout.tsx) → imports PublicHeader/PublicFooter OR AppShell OR AuthLayout OR OnboardingLayout
- `PublicHeader` → public-site navigation with Tools dropdown
- `PublicFooter` → footer with links
- `AppShell` (dashboard/layout.tsx) → sidebar + topbar + children
- `AuthLayout` → centered form layout
- `OnboardingLayout` → progress stepper + form

### Invoice Module Components
- `InvoiceBuilder` → split panel (left form, right preview)
  - `Step1Business`, `Step2Client`, ..., `Step10Final` (form fields)
  - `FormField`, `Input`, `Checkbox` (primitives)
- `InvoicePreview` → canvas-like renderer with zoom + device modes
- `InvoicePricing` → KPI cards with trends

### Dashboard Module Components
- `KPICard` → stat display with trend
- `DataTable` → generic table with columns, sorting
- `DetailPanel` → invoice/client detail view

### Marketing Components
- `Hero` → hero section with invoice preview
- `FeaturedTools` → asymmetric tool layout
- `TemplatesShowcase` → 4 distinct DOM-rendered templates
- `PricingPlans` → interactive toggle + table
- `Testimonials` → customer quotes
- `FAQ` → `<details>` accordion
- `CTA` → call-to-action panel

### Site Components
- `ToolsExplorer` → search + filter + load more
- `ToolCard` → tool listing card
- `Breadcrumbs` → navigation breadcrumbs
- `BlogListing` → category-filtered blog
- `PricingPlans` → billing toggle + comparison table
- `ContactForm` → form with validation
- `HelpSearch` → help center search

### Design System Components
- `SectionHeader` → section title + subtitle
- `TokenBlock` → color/spacing/shadow token display with copy button
- `ComponentShowcase` → component examples in grid
- `Foundations` → color/type/spacing scales
- `Controls` → button/form/badge variants
- `Surfaces` → card/dialog/table examples

---

## State Management

- **Invoice State**: `use-invoice` hook with undo/redo, autosave, field updates
- **Dashboard Data**: Mock data imported from `dashboard-data.ts` (no state, all read-only for now)
- **Form State**: Component-level state in form pages (sign in, contact, etc.)
- **UI State**: Open/close modals, selected filters, active tab (all local component state)

---

## Design System

### Colors (5 total)
- **Brand**: `--brand` (oklch 0.545 0.152 258) = blue accent
- **Neutrals**: background, card, border, foreground text (4 shades)
- **Intents**: success (green), warning (yellow), destructive (red), primary (ink)

### Typography
- **Fonts**: Geist Sans (body), Geist Mono (code)
- **Scale**: 10 levels (Display → Caption)
- **Line height**: 1.4-1.6 for body, tight for headings

### Spacing
- **Scale**: 13 steps (4px to 128px) with rem equivalents
- **Gap classes**: gap-4, gap-x-2, gap-y-6 (no space-* classes)

### Radius
- **Scale**: 6 levels (rounded-sm 6px → rounded-full)

### Shadows
- **Scale**: 5 levels (xs → xl) for elevation

### Motion
- Focus rings (2px brand), hover/press transitions, fade animations

---

## Routes (57 Total)

### Marketing Homepage (1)
- `/` → Homepage with hero, tools, pricing, FAQ, testimonials

### Public Site (20)
- `/tools` → Tool hub with search/filter
- `/tools/[slug]` → Tool detail
- `/tools/category/[category]` → Category page
- `/pricing` → Pricing with toggle
- `/templates` → Template gallery
- `/blog` → Blog listing with filter
- `/blog/[slug]` → Article
- `/customers` → Case studies
- `/customers/[slug]` → Case study detail
- `/about` → Company info
- `/contact` → Contact form
- `/help` → Help center with search
- `/privacy` → Privacy policy
- `/terms` → Terms of service

### Invoice Generator (4)
- `/invoice` → Invoice hub
- `/invoice/new` → Invoice builder (10 steps)
- `/invoice/templates` → Template gallery
- `/invoice/preview` → Full-screen preview

### Authentication (6)
- `/auth/sign-in` → Email/password login
- `/auth/sign-up` → Account creation
- `/auth/forgot-password` → Password recovery start
- `/auth/reset-password` → Password reset
- `/auth/verify-email` → Email verification
- `/auth/two-factor` → 2FA

### Onboarding (7)
- `/onboarding/welcome` → Intro
- `/onboarding/company` → Business setup
- `/onboarding/branding` → Logo & color
- `/onboarding/currency` → Currency selection
- `/onboarding/tax` → Tax setup
- `/onboarding/templates` → Template selection
- `/onboarding/finish` → Completion

### Dashboard (12)
- `/dashboard` → Overview (KPIs + charts)
- `/dashboard/invoices` → Invoice list
- `/dashboard/invoices/[id]` → Invoice detail
- `/dashboard/clients` → Client list
- `/dashboard/clients/[id]` → Client detail
- `/dashboard/products` → Product catalog
- `/dashboard/templates` → Template gallery
- `/dashboard/analytics` → Revenue analytics
- `/dashboard/team` → Team management
- `/dashboard/settings` → Account settings
- `/dashboard/profile` → User profile
- `/dashboard/notifications` → Notification center

### Design System (1)
- `/design-system` → Interactive component reference

---

## Key Features Built

### Invoice Generator
- 10-step wizard with progress tracking
- Split-panel layout (form + live preview)
- 8 premium templates with instant switching
- Real-time calculations (subtotal → discount → tax → total)
- Undo/redo with visual indicators
- Autosave with 1s debounce
- Device mode preview (desktop/tablet/mobile)
- Zoom controls (25%-200%)
- Drag-to-reorder items
- Tax inclusive/exclusive toggle
- Currency selection (6 currencies)
- Discount (percentage or fixed)
- Shipping cost option
- Custom branding (logo + color)
- Payment instructions & bank details
- Terms & conditions section

### Dashboard
- 12 pages with consistent AppShell
- KPI cards with trend indicators
- Data tables with sorting + filtering
- Invoice & client detail pages
- Analytics charts
- Team member management
- Settings & profile pages
- Notifications center
- Activity log

### Public Site
- 20 pages with professional styling
- 40+ tool catalog with search & filtering
- 4 tool categories
- Dynamic tool detail pages
- Blog with category filtering
- Case studies
- Interactive pricing with annual toggle
- Template gallery
- Help center with search
- Contact form with validation
- Help articles by category
- Newsletter signup

### Authentication
- 6 auth pages (sign in, sign up, forgot, reset, verify, 2FA)
- Professional form layouts
- Social login options (UI only)
- Email verification with 6-digit code
- Backup code option for 2FA
- "Remember me" checkbox
- Password strength validation (UI)

### Onboarding
- 7-step guided setup
- Progress bar
- Company details form
- Brand color picker (5 presets)
- Currency selection with formatting
- Tax region & type
- Template selection with previews
- Completion checklist

### Design System
- Interactive color swatches (click to copy)
- Typography scale showcase
- Spacing reference
- Radius scale
- Elevation/shadow reference
- Grid system
- Icon library
- Component examples
- Scrollspy navigation
- Desktop + mobile responsive

---

## Mock Data

### Invoice Data
- 1 mock invoice (INV-2024-001) with:
  - Business: ToolForge Inc. (SF, CA)
  - Client: Acme Corporation (NY)
  - 3 items (web dev, API, QA)
  - Subtotal: $9,500
  - 10% discount applied → $8,550
  - 10% GST exclusive

### Dashboard Data
- 4 KPIs (revenue, invoices, clients, overdue)
- 12 mock invoices with various statuses
- 8 mock clients
- 6 mock products
- 6 mock templates
- 4 mock team members
- 8 mock notifications
- 6 activity log entries

### Site Data
- 40+ tools across 4 categories
- 12 blog articles with 3 categories
- 4 case studies
- 6 help articles by category
- 3 pricing tiers

---

## Responsive Design

- **Mobile** (320px): Hamburger menu, stacked forms, full-width
- **Tablet** (768px): Sidebar collapse, optimized spacing
- **Desktop** (1440px): Full layout with sidebar
- **Wide** (1920px): Max-width constraints

---

## Next Steps for Backend Integration

1. **Authentication API** → Replace mock auth with real login/signup/verify
2. **Invoice API** → Save/load invoices from database
3. **Dashboard API** → Fetch real KPIs, invoices, clients
4. **Public API** → Fetch tools, blog articles, customers
5. **File Export** → PDF generation endpoint for invoices
6. **Email** → Send invoices, password resets, notifications
7. **Database Schema** → Users, workspaces, invoices, clients, products, templates, team, audit log


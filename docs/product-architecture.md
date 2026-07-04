# ToolForge — Product & Information Architecture

> **Status:** Pre-development architecture spec
> **Owner:** Product Architecture
> **Audience:** Product, Design, Engineering, Growth
> **Rule:** This document defines *structure and behaviour only*. No screens are designed here. The existing design system is frozen and reused as-is.

---

## 0. Product Thesis

**ToolForge is a Business Operating Platform, not an invoice app.**

The Invoice Generator is the *first live tool* — the wedge. The platform is architected from day one to host **100+ business tools** across documents, finance, utilities, and AI, unified by one account, one billing relationship, one data layer, and one navigation model.

Three architectural commitments drive every decision below:

1. **Tools are plugins, not pages.** Every tool conforms to a shared contract (route, metadata, category, access tier, data model, output engine). Adding tool #101 must require *zero* changes to navigation, search, billing, or dashboard.
2. **No dead ends.** Every screen offers a forward action. Guests are never trapped; free users always see the next value step; paid users never hit a wall mid-task.
3. **Progressive disclosure of complexity.** A guest can generate an invoice in under 60 seconds without an account. Depth (saving, history, branding, automation) is revealed only as the user commits.

---

## 1. Information Architecture (Top Level)

The product splits into **five surfaces**, each with its own navigation model and access rules:

| Surface | Purpose | Primary user | Auth |
|---|---|---|---|
| **Marketing / Public** | Discover, evaluate, convert | Guest | None |
| **Tool Runtime** | Actually use a tool | Guest + User | Optional → Required to save |
| **Dashboard (App)** | Manage saved work, data, account | Free + Premium | Required |
| **Admin (Back-office)** | Operate the platform | Internal / Owner | Required + Role |
| **System** | Auth, legal, errors, status | All | Contextual |

```
ToolForge
├── Public (marketing)      → discovery + conversion
├── Tool Runtime            → the actual work
├── Dashboard (app)         → saved data + management
├── Admin                   → platform operations
└── System                  → auth, legal, errors
```

---

## 2. Complete Page Map

Legend: `[G]` guest-accessible · `[F]` free account · `[P]` premium · `[A]` admin/role-gated

### 2.1 Public / Marketing
```
/                                [G]  Home
/tools                           [G]  Tools index (all tools, filterable)
/tools/category/:category        [G]  Category listing (e.g. /tools/category/finance)
/tools/:toolSlug                 [G]  Tool detail / landing (SEO, how-to, CTA to run)
/pricing                         [G]  Pricing & plan comparison
/blog                            [G]  Blog index
/blog/category/:category         [G]  Blog category
/blog/:postSlug                  [G]  Blog post
/about                           [G]  About / company
/contact                         [G]  Contact + support entry
/changelog                       [G]  Product changelog
/roadmap                         [G]  Public roadmap (tool voting)
```

### 2.2 Tool Runtime
```
/tools/:toolSlug/new             [G]  Run the tool (guest mode, ephemeral)
/tools/:toolSlug/:documentId     [F]  Run/edit a saved instance (requires ownership)
```
> Guests run tools fully. The **save / download-history / branding** actions are the conversion boundary.

### 2.3 Authentication (System)
```
/login                           [G]  Login (email + password)
/signup                          [G]  Signup
/forgot-password                 [G]  Request reset
/reset-password/:token           [G]  Set new password
/verify-email/:token             [G]  Email verification
/logout                          [F]  Terminates session → /
```

### 2.4 Dashboard (App)
```
/dashboard                       [F]  Overview: recent docs, quick actions, usage
/dashboard/invoices              [F]  Invoices list (first live tool's saved output)
/dashboard/invoices/:id          [F]  Invoice detail / edit
/dashboard/customers             [F]  Customer directory (shared entity)
/dashboard/customers/:id         [F]  Customer profile + doc history
/dashboard/products              [F]  Products / line-item catalog (shared entity)
/dashboard/templates             [F]  Saved & branded templates
/dashboard/history               [F]  Cross-tool activity & document history
/dashboard/profile               [F]  Personal profile
/dashboard/settings              [F]  App + workspace settings (see §9)
/dashboard/billing               [F]  Plan, invoices, payment method, usage
```

### 2.5 Admin (Back-office)
```
/admin                           [A]  Ops overview
/admin/users                     [A]  User management (roles, status, impersonate)
/admin/plans                     [A]  Plans & entitlements editor
/admin/invoices                  [A]  Platform billing / transactions
/admin/cms                       [A]  CMS root
/admin/cms/blogs                 [A]  Blog authoring
/admin/cms/tools                 [A]  Tool registry (enable/disable, category, tier)
/admin/analytics                 [A]  Product & revenue analytics
/admin/seo                       [A]  SEO metadata, sitemaps, redirects
/admin/website                   [A]  Global site settings (nav, banners, flags)
```

### 2.6 System / Legal
```
/privacy                         [G]  Privacy Policy
/terms                           [G]  Terms of Service
/refund-policy                   [G]  Refund / cancellation
/cookie-policy                   [G]  Cookies
/gdpr                            [G]  Data / GDPR
/security                        [G]  Security overview
/status                          [G]  System status
/404                             [G]  Not found (with search + suggestions)
/500                             [G]  Error (with recovery actions)
```

---

## 3. Tool Hierarchy (Future-Ready Taxonomy)

Every tool declares exactly **one primary category** and optional tags. Categories are stable; tools are additive.

```
Business Documents
├── Invoice Generator            ● LIVE
├── Quotation / Estimate
├── Receipt
├── Purchase Order
├── Delivery Challan
├── Salary Slip / Payslip
├── Credit / Debit Note
└── Contract / Agreement

Finance
├── GST Calculator
├── EMI Calculator
├── Tax Calculator
├── Currency Converter
├── Profit Margin Calculator
├── Loan Comparison
└── Expense Splitter

Utilities
├── Barcode Generator
├── QR Code Generator
├── Number to Words
├── Unit Converter
├── Image Compressor
├── PDF Merge / Split
└── Signature Maker

AI
├── AI Assistant (chat)
├── OCR / Document Extraction
├── AI Invoice Autofill
├── AI Email / Reply Writer
├── AI Summarizer
└── AI Data Cleanup
```

### 3.1 The Tool Contract (why 100+ scales)
Every tool is registered as a record, not hand-built into nav:

```ts
type Tool = {
  slug: string            // /tools/:slug
  name: string
  category: 'documents' | 'finance' | 'utilities' | 'ai'
  tags: string[]
  tier: 'free' | 'premium'
  status: 'live' | 'beta' | 'coming-soon'
  outputs: ('pdf' | 'png' | 'csv' | 'link' | 'text')[]
  entities: ('customer' | 'product' | 'document')[]  // shared data it reads/writes
  seo: { title; description; faq[] }
}
```
Navigation, search, category pages, dashboard filters, and entitlement checks all read from this registry. **Adding a tool = adding a record.**

### 3.2 Future categories (reserved, not yet shown)
`HR & People` · `Marketing` · `Legal` · `Analytics & Reports` · `Automation / Workflows` · `Integrations` · `Team Collaboration`. These slot into the same taxonomy without restructuring.

---

## 4. Navigation Structure

### 4.1 Primary Navigation (public, desktop)
```
Logo   Tools ▾   Pricing   Blog   About        [ Search ]   Login   [ Sign up ]
```
- **Tools ▾** opens a **mega-menu** grouped by the 4 categories, each showing top tools + "View all →". Coming-soon tools appear greyed with a "Notify me" affordance (no dead ends).
- Right cluster is auth-aware: logged-in users see **Dashboard** + avatar instead of Login/Sign up.

### 4.2 Secondary Navigation
- **Contextual sub-nav** appears under primary on section pages (e.g. on `/tools`: `All · Documents · Finance · Utilities · AI · New · Popular`).
- **In-tool sub-nav**: `Editor · Preview · History · Settings` for the active tool.

### 4.3 Footer Navigation (public, global)
```
Product        Tools              Company        Resources        Legal
Home           Business Docs      About          Blog             Privacy
Pricing        Finance            Contact        Changelog        Terms
Changelog      Utilities          Careers        Roadmap          Refund
Roadmap        AI                 Status         Help Center      GDPR
                                                  API Docs         Security
```
Plus: locale/currency selector, social links, newsletter capture.

### 4.4 Dashboard Navigation (left sidebar, app)
```
▸ Overview
▸ Documents
    Invoices
    Quotations   (as tools go live)
    Receipts
▸ Data
    Customers
    Products
    Templates
▸ Activity
    History
─────────────
▸ Account
    Profile
    Billing
    Settings
─────────────
[ + New Document ]   ← global create, opens tool picker
[ Upgrade ]          ← visible only to free users
```
- **Collapsible groups**, persistent across sessions.
- **"+ New"** is always reachable — the primary create action, never buried.

### 4.5 Admin Navigation (left sidebar, back-office)
```
Overview
Users
Plans & Entitlements
Billing / Transactions
CMS
   Blogs
   Tool Registry
Analytics
SEO
Website Settings
```
Visually distinct from the app (badge/label "Admin") to avoid mode confusion. Role-gated per item.

### 4.6 Responsive behaviour
| Breakpoint | Public | Dashboard |
|---|---|---|
| **Desktop ≥1024** | Full primary nav + mega-menu | Persistent left sidebar |
| **Tablet 768–1023** | Condensed nav, Tools → dropdown | Collapsible/icon rail sidebar |
| **Mobile <768** | Hamburger → full-screen drawer; sticky bottom CTA | Bottom tab bar (Home · Docs · +New · Data · Account) + drawer for full tree |

---

## 5. Search Behaviour

### 5.1 Global Search (⌘K / "/")
A single command palette available on every surface:
- **Tools** — jump to or run any tool.
- **Documents** — find saved invoices/customers/products (auth users, scoped to their data).
- **Actions** — "Create invoice", "Add customer", "Go to billing".
- **Content** — blog posts, help articles.
- **Navigation** — any page.

Behaviour: fuzzy match, grouped results, keyboard-first, recent + suggested when empty. Guests get Tools + Content + Nav; authed users additionally get their Documents + Actions.

### 5.2 Scoped search
- `/tools` — filters the tool grid (category, tier, status, output type).
- `/dashboard/*` — list-level search + filters per entity (status, date, customer, amount).
- `/admin/*` — record search per module.

---

## 6. User Journeys

### 6.1 Guest Journey (zero friction)
```
Land (Home or SEO tool page)
  → Click a tool  →  /tools/invoice/new  (runs immediately, no signup)
  → Fill invoice  →  Live preview
  → Download PDF  →  ✅ value delivered
  → Prompt: "Save this & reuse? Create a free account"  → soft conversion
```
Guest data is held ephemerally; on signup it is **migrated into the account** (no lost work).

### 6.2 Free User Journey
```
Signup → Email verify → Dashboard (empty state with guided first action)
  → Create/save documents, customers, products
  → Hit a premium boundary (branding, bulk, automation, higher limits)
  → Contextual upgrade prompt (never a hard block on already-created work)
```

### 6.3 Premium Journey
```
Full tool access + branded templates + higher/unlimited limits + AI tools + priority support
  → Manages plan in /dashboard/billing
  → New premium tools unlock automatically via entitlements (no re-purchase)
```

### 6.4 Upgrade Journey (friction-minimised)
```
Trigger (feature gate, limit reached, or Upgrade button)
  → Inline value explanation (what unlocks, tied to current context)
  → /pricing or in-context checkout modal
  → Stripe checkout
  → Return → entitlement applied instantly → resume exact prior task
```
Principle: **the upgrade returns the user to where they were**, mid-task, with the gate now open.

### 6.5 Master flow diagram
```
Visitor
  ↓
Homepage ───────────────► SEO Tool Page
  ↓                              ↓
Explore Tools ◄──────────────────┘
  ↓
Run Free Invoice  (no account)
  ↓
Download (value delivered)
  ↓
Signup  (guest work migrated)
  ↓
Dashboard
  ↓
Hit premium boundary
  ↓
Upgrade  →  resume task as Premium
```

---

## 7. Authentication Flow

- **Method:** Email + password only (per platform default). No OAuth/magic-link unless later requested.
- **States:** guest → registered (unverified) → verified → active. Optional `premium` entitlement is orthogonal to auth state.
- **Access rules:**
  - Running a tool: **no auth required**.
  - Saving / history / data entities: **auth required** (soft wall, preserves work).
  - Premium tools/features: **auth + entitlement**.
  - Admin: **auth + role**.
- **Flows:** Signup → verify email → onboarding checklist. Forgot → email token → reset. Session expiry returns user to intended page after re-auth (no lost destination).

---

## 8. Content Structures

### 8.1 Blog
```
Post = { title, slug, excerpt, cover, category, tags[], author, publishedAt, readingTime, seo, relatedTools[] }
Index  → featured + latest + by category
Post   → article + related tools (converts readers into tool users) + related posts + CTA
```
Blog is a **growth engine**: every post links to relevant tools; every tool page links to relevant posts.

### 8.2 Pricing
```
Plans: Free · Premium (monthly/annual toggle)   [Team — reserved for future]
Structure: value framing → plan cards → full feature comparison matrix → FAQ → CTA
Entitlement-driven: plans map to a feature/limit matrix defined in Admin → Plans.
```

### 8.3 Legal
Standalone, low-chrome, always footer-linked: Privacy, Terms, Refund, Cookies, GDPR, Security. Versioned with "last updated".

---

## 9. Settings Structure

Tabbed within `/dashboard/settings`:
```
Account          name, email, password, delete account
Workspace        business name, logo, address, tax IDs, defaults (currency, tax %)
Branding         [P] template colors, logo, footer notes
Notifications     see §10
Preferences       language, locale, date/number format, theme(if any)
Security          sessions, 2FA (future), login history
Integrations      [future] connected apps / API keys
Danger Zone       export data, delete workspace
```

## 10. Notification Structure
```
Channels:  in-app (bell)  ·  email  ·  [future] push
Types:
  Transactional   receipts, password/email changes, exports ready
  Product         new tool launched, feature unlocked
  Account         plan/billing changes, limit warnings
  Marketing       tips, blog digests   (opt-in, per-channel toggles)
Center: /dashboard  bell → dropdown (recent) + "View all"; granular per-type/per-channel controls in Settings → Notifications.
```

## 11. Profile Structure
```
Public-ish identity (name, avatar) + private account data.
Profile ≠ Settings: Profile = who you are; Settings = how the product behaves.
Fields: avatar, display name, email(verified badge), role, member since, plan badge.
```

## 12. Breadcrumb Structure
- **Where used:** Dashboard, Admin, deep content — anywhere depth > 1. Not on top-level marketing pages.
- **Pattern:** `Home / Section / Sub-section / Item` — every crumb is clickable; the last is current (non-link).
- **Examples:**
  - `Dashboard / Invoices / INV-1042`
  - `Tools / Finance / GST Calculator`
  - `Admin / CMS / Blogs / "Post title"`
- Breadcrumbs derive from the route + registry, so new tools/records get correct trails automatically.

---

## 13. Scalability & Anti-Friction Guarantees

| Principle | Mechanism |
|---|---|
| **Scales to 100+ tools** | Tool registry + contract; nav/search/dashboard read from data, not hardcoded. |
| **No dead ends** | Every 404/empty/coming-soon state offers search + suggested tools + primary CTA. |
| **Fewest clicks** | Global ⌘K search; persistent "+ New"; guests run tools with zero setup. |
| **No lost work** | Guest→account data migration; upgrade returns to prior task. |
| **Entitlement-driven** | New premium tools unlock automatically; no re-purchase, no code change. |
| **Consistent mental model** | One tool contract → every tool feels the same to learn and to build. |
| **Future categories reserved** | Taxonomy has room (HR, Marketing, Legal, Automation) without restructure. |

---

## 14. What This Unlocks Next (build order recommendation)
1. **Tool registry + routing shell** (the contract) — everything else depends on it.
2. **Invoice Generator** as the reference implementation of the contract.
3. **Auth + guest→account migration**.
4. **Dashboard shell + shared entities** (Customers, Products, Templates).
5. **Billing + entitlements** (unlocks premium gating).
6. **Admin (tool registry, CMS, plans)** — lets the team ship tools without engineering.
7. **Global search + notifications**.
8. Then: tool #2, #3 … #100, each a registry record.

> The design system is frozen and reused as-is. This document is the structural contract; screen design follows only after sign-off.

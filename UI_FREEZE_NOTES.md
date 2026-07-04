# ToolForge — UI/UX Freeze Notes

**STATUS**: UI/UX is FROZEN and COMPLETE. No design changes permitted.

This document outlines what MUST NEVER be changed and what IS SAFE to modify during backend integration.

---

## FROZEN COMPONENTS (DO NOT TOUCH)

### Color System (5-Color Palette)
**FROZEN** — These colors are locked and must not be modified:

```
--brand: oklch(0.545 0.152 258)           [Primary blue accent]
--brand-foreground: oklch(0.99 0.005 258) [White text on brand]
--brand-muted: oklch(0.955 0.028 258)     [Tint/background]
--background: oklch(0.994 0.001 260)      [Page background]
--card: oklch(1 0 0)                      [Card/surface]
--muted: oklch(0.975 0.002 264)           [Muted surfaces]
--border: oklch(0.923 0.004 264)          [Borders]
--border-strong: oklch(0.87 0.006 264)    [Strong borders]
--foreground: oklch(0.23 0.012 268)       [Primary text]
--secondary-foreground: oklch(0.3 0.014 268) [Secondary text]
--muted-foreground: oklch(0.556 0.012 265)  [Muted text]
--success: oklch(0.58 0.12 158)           [Success green]
--warning: oklch(0.72 0.135 74)           [Warning yellow]
--destructive: oklch(0.577 0.211 25)      [Error red]
--primary: oklch(0.26 0.017 268)          [Ink/dark text]
```

**NEVER**:
- Change hex values
- Add new colors
- Remove colors
- Rename color tokens
- Alter color opacity

**WHY**: The color system is foundational to design consistency.

---

### Typography (2 Fonts)
**FROZEN** — Only these 2 fonts are used, everywhere:

```
--font-sans: Geist, sans-serif           [Body + headings]
--font-mono: Geist Mono, monospace       [Code + technical]
```

**Font Scale** (10 levels, all locked):
- Display (text-6xl, 60px, -3% tracking)
- Hero (text-5xl, 48px, -2.5% tracking)
- Heading 1 (text-3xl, 30px, -2% tracking)
- Heading 2 (text-2xl, 24px, -1.5% tracking)
- Heading 3 (text-xl, 20px, -1% tracking)
- Heading 4 (text-lg, 18px)
- Body Large (text-lg, 18px, leading-relaxed)
- Body (text-base, 16px, leading-relaxed)
- Small (text-sm, 14px, leading-6)
- Caption (text-xs, 12px, +14% tracking)

**NEVER**:
- Change font family (Geist is locked)
- Modify font sizes
- Add Google Fonts or other font libraries
- Change line heights from 1.4-1.6 range
- Use decorative fonts

**WHY**: Typography is core to readability and brand identity.

---

### Spacing Scale (13 Steps)
**FROZEN** — All spacing must use this scale:

```
2xs: 4px    (0.25rem)
xs:  8px    (0.5rem)
sm:  12px   (0.75rem)
md:  16px   (1rem)
lg:  20px   (1.25rem)
xl:  24px   (1.5rem)
2xl: 32px   (2rem)
3xl: 40px   (2.5rem)
4xl: 48px   (3rem)
5xl: 64px   (4rem)
6xl: 80px   (5rem)
7xl: 96px   (6rem)
8xl: 128px  (8rem)
```

**NEVER**:
- Use arbitrary pixel values (e.g., p-[16px])
- Add spacing between scale values
- Remove any scale step
- Use px units in component styles (use Tailwind classes)

**WHY**: Consistent spacing creates visual harmony.

---

### Radius Scale (6 Levels)
**FROZEN**:

```
rounded-sm:  6px
rounded-md:  8px
rounded-lg:  10px
rounded-xl:  14px
rounded-2xl: 18px
rounded-full: 9999px
```

**NEVER**:
- Use arbitrary border-radius values
- Change any radius value
- Add new radius levels
- Use different radii on different component types (all cards same radius, all buttons same radius)

**WHY**: Consistent radius maintains visual cohesion.

---

### Shadow Scale (5 Levels)
**FROZEN**:

```
shadow-token-xs: subtle (inputs, subtle separation)
shadow-token-sm: light  (cards at rest)
shadow-token-md: medium (hovered cards, popovers)
shadow-token-lg: heavy  (dropdowns, menus)
shadow-token-xl: deep   (dialogs, modals)
```

**NEVER**:
- Use arbitrary shadow values
- Change shadow depth
- Rename shadow levels
- Add custom shadows

**WHY**: Consistent shadows create proper elevation hierarchy.

---

## FROZEN COMPONENTS (DO NOT REDESIGN)

### All 49 Custom Components
Every component has been carefully designed and is FROZEN:

**Invoice Module** (11 components):
- InvoiceBuilder (2-panel layout, split form + preview)
- InvoicePreview (canvas-like with zoom + device modes)
- Step1-10 (all form step designs)
- All form inputs (FormField, Input, Checkbox, Select, Textarea, FileInput, ColorPicker)

**Dashboard** (4 components):
- AppShell (sidebar + topbar layout)
- KPICard (stat display with trend)
- DataTable (generic table with columns)
- DetailPanel (invoice/client detail)

**Site** (12 components):
- PublicHeader, PublicFooter
- ToolCard, ToolsExplorer
- PricingPlans, ContactForm
- Breadcrumbs, PageHero, etc.

**Marketing** (12 components):
- Hero, FeaturedTools, TemplatesShowcase
- FAQ, Testimonials, CTA, etc.

**Auth** (2 components):
- AuthForm (handles all 6 auth pages)
- AuthLayout

**Onboarding** (1 component):
- OnboardingStep (reusable step wrapper)

**UI** (2 components):
- Button (all variants: primary, secondary, outline, ghost)
- States (EmptyState, ErrorState, LoadingSkeleton, SuccessState, Toast, Dialog)

**Design System** (6 components):
- Overview, Primitives, Foundations, Controls, Surfaces, Shell

**NEVER**:
- Redesign any component
- Change component props (only add non-breaking props for backend data)
- Refactor internals (OK if it doesn't change output)
- Change component sizes, padding, or layout
- Modify button variants or sizes
- Change form field styling

**WHY**: The UI/UX phase is complete. Components are production-tested.

---

## FROZEN LAYOUTS (DO NOT MODIFY)

### RootLayout
```
app/layout.tsx
- Geist fonts (FROZEN)
- Design tokens in CSS (FROZEN)
- Vercel Analytics import (OK to configure)
```

**Safe Changes**: None — this is the foundation.

### PublicLayout
```
app/(site)/layout.tsx
- PublicHeader + PublicFooter positions (FROZEN)
- Layout structure (FROZEN)
```

**Safe Changes**: None — layout is locked.

### AuthLayout
```
app/auth/layout.tsx
- Centered container styling (FROZEN)
- Width and max-width (FROZEN)
```

**Safe Changes**: None — auth layout is fixed.

### OnboardingLayout
```
app/onboarding/layout.tsx
- Progress bar (FROZEN)
- Step title placement (FROZEN)
- Navigation button placement (FROZEN)
```

**Safe Changes**: None — onboarding flow is finalized.

### InvoiceLayout
```
app/invoice/layout.tsx
- Layout structure (FROZEN)
```

**Safe Changes**: None.

### DashboardLayout
```
app/dashboard/layout.tsx
- AppShell structure (FROZEN)
- Sidebar width and position (FROZEN)
- Topbar height (FROZEN)
```

**Safe Changes**: None.

---

## FROZEN PAGE DESIGNS (DO NOT REDESIGN)

All 51 pages have final designs:

### Public Site Pages (20 pages)
- HomePage, ToolsPage, ToolDetailPage
- PricingPage, TemplatesPage
- BlogPage, BlogArticlePage
- CustomersPage, CustomerDetailPage
- AboutPage, ContactPage, HelpPage
- PrivacyPage, TermsPage

**Safe Changes**: 
- Update copy/text content (headlines, descriptions)
- Update mock data (tool names, articles, customers)
- Add backend API calls (no visual changes)

### Auth Pages (6 pages)
- SignInPage, SignUpPage
- ForgotPasswordPage, ResetPasswordPage
- VerifyEmailPage, TwoFactorPage

**Safe Changes**:
- Add form submission logic
- Add validation error messages (design already supports them)
- Add social login buttons (layout supports them)

### Onboarding Pages (7 pages)
- WelcomePage, CompanyPage, BrandingPage
- CurrencyPage, TaxPage, TemplatesPage, FinishPage

**Safe Changes**:
- Add form submission logic
- Save data to database
- Add validation (design already supports it)

### Dashboard Pages (12 pages)
- DashboardPage, InvoicesPage, ClientsPage
- ProductsPage, TemplatesPage, AnalyticsPage
- TeamPage, SettingsPage, ProfilePage, NotificationsPage

**Safe Changes**:
- Fetch real data from API
- Implement sorting/filtering
- Add pagination
- Add CRUD operations (edit, delete, create)

### Invoice Pages (4 pages)
- InvoiceHubPage, InvoiceBuilderPage
- InvoiceTemplatesPage, InvoicePreviewPage

**Safe Changes**:
- Save invoices to database
- Fetch saved invoices
- Add PDF export
- Add email functionality

### Design System Page (1 page)
- DesignSystemPage (interactive component library)

**Safe Changes**: None — this is reference documentation.

---

## RESPONSIVE DESIGN IS FROZEN

All breakpoints are locked:

```
Mobile (320px):   ✓ Tested, finalized
Tablet (768px):   ✓ Tested, finalized
Desktop (1440px): ✓ Tested, finalized
Wide (1920px):    ✓ Tested, finalized
```

**NEVER**:
- Change breakpoint values
- Modify mobile layouts
- Remove responsive behavior
- Change hamburger menu behavior (if added)

**Safe Changes**:
- Update content within responsive containers
- Add new sections (must be responsive)
- Modify text but keep layout

---

## FROZEN ANIMATIONS & TRANSITIONS

All motion is finalized:

```
Focus rings: 2px brand color, instant
Hover states: Opacity/color change, 150ms ease-out
Form transitions: 100ms ease-in-out
Page transitions: Fade in, 200ms ease-out
Modal animations: Slide up + fade, 200ms ease-out
Dropdown animations: Scale + fade, 150ms ease-out
```

**NEVER**:
- Change transition durations
- Add new animations
- Remove existing transitions
- Change easing functions

**Safe Changes**: None — animations are locked.

---

## ACCESSIBILITY IS FROZEN (WCAG AA)

All a11y features are finalized:

```
✓ Semantic HTML (main, label, section, article)
✓ Form labels associated with inputs
✓ Error messages with role="alert"
✓ Focus rings on all interactive elements
✓ Keyboard navigation fully supported
✓ Color contrast ratios AA-compliant
✓ Alt text on images
✓ ARIA attributes where needed
```

**NEVER**:
- Remove focus rings
- Change semantic HTML structure
- Remove ARIA attributes
- Change color contrast
- Break keyboard navigation

**Safe Changes**: None — accessibility is locked.

---

## DATA LAYER IS SAFE TO MODIFY

### Mock Data (CURRENTLY FROZEN, BUT REPLACEABLE)

Current state:
```
lib/invoice-state.ts      → MOCK_INVOICE (1 invoice)
lib/dashboard-data.ts     → KPIs, invoices, clients, products (mock)
lib/site-data.ts          → Tools (40+), blog (12), customers (4), help (6)
lib/auth-data.ts          → Copy only (no data)
lib/marketing-content.ts  → Copy only (no data)
```

**Safe Changes When Adding Backend**:
1. Keep type definitions (InvoiceData, Invoice, Client, etc.)
2. Replace mock data with API calls
3. Do NOT change type structures
4. Do NOT change data shapes
5. Do NOT change field names

**Example**:
```ts
// BEFORE (mock)
const invoices = mockInvoices;

// AFTER (API)
const { data: invoices } = useFetch('/api/invoices');

// ✓ Type InvoiceData stays the same
// ✓ Field names stay the same
// ✓ No component changes needed
```

---

## SAFE TO MODIFY DURING BACKEND INTEGRATION

### 1. Component Props (Non-Breaking)
**Safe**: Add new optional props for backend data
```tsx
// BEFORE
<KPICard label="Revenue" value="$42,500" change={12.5} />

// AFTER (OK - adding new prop)
<KPICard 
  label="Revenue" 
  value={revenueFromAPI} 
  change={percentageChangeFromAPI}
  trend={trendFromAPI}
/>
```

### 2. Form Submission
**Safe**: Add `onSubmit` handlers
```tsx
// BEFORE
<form onSubmit={handleMockSubmit}>

// AFTER (OK - calling API)
<form onSubmit={async (e) => {
  const response = await fetch('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(invoice)
  });
}}>
```

### 3. API Integration
**Safe**: Add hooks for data fetching
```tsx
// OK to add
const { data: invoices } = useFetch('/api/invoices');
const { data: clients } = useFetch('/api/clients');
const { mutate: deleteInvoice } = useDelete('/api/invoices/:id');
```

### 4. Form Validation
**Safe**: Add validation logic
```tsx
// OK to add error states, already supported
{error && <p role="alert">{error}</p>}

// OK to add disabled states
<button disabled={isLoading}>Save</button>
```

### 5. Route Redirect Logic
**Safe**: Add auth checks and redirects
```tsx
// OK to add
if (!user) redirect('/auth/sign-in');
if (!hasCompleted Onboarding) redirect('/onboarding/welcome');
```

### 6. Loading States
**Safe**: Show loading skeletons (already designed)
```tsx
// OK to use existing LoadingSkeleton component
{isLoading ? <LoadingSkeleton /> : <DataTable data={data} />}
```

### 7. Error Handling
**Safe**: Show error states (already designed)
```tsx
// OK to use existing ErrorState component
{error ? <ErrorState message={error} /> : <Content />}
```

### 8. Modals & Dialogs
**Safe**: Add confirm/alert dialogs for destructive actions
```tsx
// OK to add
{showConfirm && (
  <Dialog title="Delete invoice?" onConfirm={deleteInvoice}>
    This action cannot be undone.
  </Dialog>
)}
```

### 9. Local State Management
**Safe**: Keep component-level state for UI interactions
```tsx
// OK to keep
const [isOpen, setIsOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('invoices');
const [filterText, setFilterText] = useState('');
```

### 10. User Input Handling
**Safe**: Add form submission, API calls
```tsx
// OK to modify
const handleCreateInvoice = async (data: InvoiceData) => {
  const response = await fetch('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  navigate('/dashboard/invoices');
};
```

---

## NOT SAFE TO MODIFY

### 1. Page Layout
❌ Do NOT change page grid/flex structure
❌ Do NOT move components around
❌ Do NOT resize major sections

### 2. Component Styling
❌ Do NOT change padding/margins
❌ Do NOT change colors
❌ Do NOT change border radius
❌ Do NOT change shadows

### 3. Typography
❌ Do NOT change font sizes
❌ Do NOT change fonts
❌ Do NOT change line heights
❌ Do NOT change font weights

### 4. Spacing
❌ Do NOT use arbitrary pixel values
❌ Do NOT change gap between elements
❌ Do NOT adjust padding

### 5. Component Props
❌ Do NOT rename existing props
❌ Do NOT remove props
❌ Do NOT change prop types
✓ DO add new optional props

### 6. Routes & Navigation
❌ Do NOT add/remove/rename routes
❌ Do NOT change page paths
❌ Do NOT change navigation structure

### 7. Responsive Breakpoints
❌ Do NOT change breakpoint values
❌ Do NOT modify mobile/tablet/desktop layouts
❌ Do NOT remove responsive behavior

---

## Modification Checklist for Backend Integration

When adding backend, use this checklist:

- [ ] Type definitions unchanged (InvoiceData, Invoice, Client, etc.)
- [ ] Component props non-breaking (only add, no remove/rename)
- [ ] Colors unchanged (all 5 colors locked)
- [ ] Typography unchanged (fonts, sizes, line-heights locked)
- [ ] Spacing unchanged (using Tailwind scale only)
- [ ] Layouts unchanged (structure, grid/flex locked)
- [ ] Routes unchanged (paths, navigation locked)
- [ ] Responsive behavior preserved (no breakpoint changes)
- [ ] Accessibility maintained (WCAG AA features locked)
- [ ] Form validation added (using existing error UI)
- [ ] Loading states implemented (using LoadingSkeleton)
- [ ] Error states implemented (using ErrorState)
- [ ] API calls added (non-breaking)
- [ ] Auth checks added (using middleware/guards)
- [ ] Modals/dialogs added (using existing Dialog component)

---

## Summary

**FROZEN**: Colors, typography, spacing, radius, shadows, all 49 components, all layouts, all pages, animations, accessibility, responsive design

**SAFE**: Mock data replacement, form submission, API integration, validation, loading/error states, auth logic, local state, user input handling

**DO NOT**: Redesign, recolor, resize, retype, reposition, rename routes, remove features, change props, alter breakpoints

**READY**: The UI/UX is production-complete and waiting for backend integration.


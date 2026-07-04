# ToolForge — Backend Implementation Guide

**This guide covers adding a backend API to ToolForge while preserving the frozen UI/UX.**

---

## Phase 0: Setup & Planning

### Prerequisites
- Backend framework (Node.js/Express, Python/FastAPI, etc.)
- Database (PostgreSQL recommended)
- Authentication library (JWT, sessions, or auth service)
- File storage (S3 for invoices/uploads, or local)
- Email service (Sendgrid, Resend, Mailgun)

### Architecture Decision Points
Before coding, decide:

1. **Backend Location**
   - Same Next.js project (API routes in `app/api/`)
   - Separate backend (Node/Python/Go)
   - Serverless functions (Vercel Functions, AWS Lambda)
   - **Recommended**: Start with Next.js API routes for simplicity

2. **Authentication Method**
   - JWT with refresh tokens
   - Session-based (HTTP-only cookies)
   - Third-party auth (Auth0, Firebase, Clerk)
   - **Recommended**: Better Auth (new standard for Next.js)

3. **Database**
   - PostgreSQL (most flexible, recommended)
   - MySQL (similar features)
   - MongoDB (if document-based data preferred)
   - **Recommended**: PostgreSQL + Drizzle ORM

4. **ORM/Query Builder**
   - Prisma (popular, but can be heavyweight)
   - Drizzle ORM (lightweight, recommended)
   - Raw queries (if feeling adventurous)
   - **Recommended**: Drizzle ORM

5. **File Storage**
   - AWS S3 (scalable, industry standard)
   - Vercel Blob (integrated with Vercel)
   - Google Cloud Storage
   - Local filesystem (for MVP only)
   - **Recommended**: Vercel Blob for ease, S3 for scalability

---

## Phase 1: Setup API Routes

### Create API Route Structure

```
app/api/
├── auth/
│   ├── sign-in/route.ts
│   ├── sign-up/route.ts
│   ├── sign-out/route.ts
│   ├── verify-email/route.ts
│   ├── refresh-token/route.ts
│   └── forgot-password/route.ts
├── invoices/
│   ├── route.ts (GET list, POST create)
│   ├── [id]/
│   │   ├── route.ts (GET detail, PUT update, DELETE)
│   │   ├── pdf/route.ts (GET PDF export)
│   │   └── email/route.ts (POST send via email)
├── clients/
│   ├── route.ts (GET list, POST create)
│   └── [id]/
│       └── route.ts (GET detail, PUT update, DELETE)
├── products/
│   ├── route.ts (GET list, POST create)
│   └── [id]/route.ts (GET detail, PUT update, DELETE)
├── team/
│   ├── route.ts (GET list)
│   ├── [id]/role/route.ts (PUT update role)
│   └── invite/route.ts (POST send invite)
├── upload/
│   └── route.ts (POST file upload)
├── templates/
│   ├── route.ts (GET list)
│   └── [id]/route.ts (GET detail, PUT update)
└── dashboard/
    ├── kpis/route.ts (GET dashboard KPIs)
    └── analytics/route.ts (GET analytics data)
```

### Example API Route Implementation

```typescript
// app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  // 1. Authenticate
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Query database
    const invoices = await db.invoice.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    })

    // 3. Return data
    return NextResponse.json(invoices)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // 1. Authenticate
  const session = await getSession(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Parse request body
    const body = await request.json()

    // 3. Validate input (example)
    if (!body.invoiceNumber || !body.clientName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 4. Save to database
    const invoice = await db.invoice.create({
      data: {
        ...body,
        userId: session.userId,
        createdAt: new Date(),
      },
    })

    // 5. Return created invoice
    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
```

---

## Phase 2: Setup Database

### Database Schema (PostgreSQL with Drizzle ORM)

```typescript
// lib/db/schema.ts
import { pgTable, text, timestamp, uuid, integer, boolean, json, decimal } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  avatar: text('avatar'),
  emailVerified: boolean('email_verified').default(false),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Workspaces table
export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  timezone: text('timezone').default('UTC'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Invoices table
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id).notNull(),
  invoiceNumber: text('invoice_number').notNull(),
  status: text('status', { enum: ['draft', 'sent', 'paid', 'overdue'] }).default('draft'),
  
  // Business & client info (JSON for flexibility)
  business: json('business').notNull(), // BusinessDetails
  client: json('client').notNull(), // ClientDetails
  items: json('items').notNull(), // InvoiceItem[]
  
  // Financial
  currency: text('currency').default('USD'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }),
  discount: json('discount'), // { type, value, applied }
  shipping: json('shipping'), // { cost, applied }
  tax: json('tax'), // { type, rate, basis }
  total: decimal('total', { precision: 10, scale: 2 }),
  
  // Branding
  template: text('template').default('modern'),
  brandColor: text('brand_color'),
  
  // Additional
  issueDate: timestamp('issue_date'),
  dueDate: timestamp('due_date'),
  notes: text('notes'),
  terms: text('terms'),
  bankDetails: json('bank_details'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Clients table
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id).notNull(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: json('address'), // { street, city, state, zip, country }
  taxId: text('tax_id'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }),
  sku: text('sku'),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Team members table
export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').references(() => workspaces.id).notNull(),
  userId: uuid('user_id').references(() => users.id),
  email: text('email'),
  role: text('role', { enum: ['admin', 'manager', 'user'] }).default('user'),
  status: text('status', { enum: ['active', 'inactive', 'invited'] }).default('invited'),
  joinedAt: timestamp('joined_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Add relations for type safety
export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
}))

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users),
  invoices: many(invoices),
  clients: many(clients),
  products: many(products),
  teamMembers: many(teamMembers),
}))

export const invoicesRelations = relations(invoices, ({ one }) => ({
  workspace: one(workspaces),
}))
```

### Database Initialization

```bash
# Install Drizzle
npm install drizzle-orm pg
npm install -D drizzle-kit

# Create database (PostgreSQL)
createdb toolforge_dev

# Run migrations
npx drizzle-kit push:pg
```

---

## Phase 3: Setup Authentication

### Recommended: Better Auth

```bash
npm install better-auth@latest
```

```typescript
// lib/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'

export const auth = betterAuth({
  database: drizzleAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendVerificationEmail: async (user, url) => {
      // Send email via Sendgrid, Resend, etc.
      await sendEmail({
        to: user.email,
        subject: 'Verify your email',
        body: `Click here to verify: ${url}`,
      })
    },
  },
  twoFactor: {
    enabled: true,
  },
})

export const getSession = async (request: Request) => {
  return await auth.api.getSession({ headers: request.headers })
}
```

### Middleware for Protected Routes

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const protectedRoutes = ['/dashboard', '/invoice', '/onboarding']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if route is protected
  const isProtected = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (!isProtected) {
    return NextResponse.next()
  }

  // Get session
  const session = await getSession(request)

  // Redirect to login if not authenticated
  if (!session) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  // Check if user completed onboarding
  if (!pathname.startsWith('/onboarding') && !session.user.onboardingCompleted) {
    return NextResponse.redirect(new URL('/onboarding/welcome', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Phase 4: Connect Frontend to API

### Update Invoice Hook

```typescript
// lib/hooks/use-invoice.ts
'use client'

import { useCallback, useState } from 'react'
import { InvoiceData } from '../invoice-types'
import { useSession } from '@/lib/auth/client'

export function useInvoice(invoiceId?: string) {
  const { data: session } = useSession()
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch invoice on mount
  useEffect(() => {
    if (invoiceId) {
      fetch(`/api/invoices/${invoiceId}`)
        .then(r => r.json())
        .then(data => setInvoice(data))
        .catch(err => setError(err.message))
    }
  }, [invoiceId])

  // Save invoice
  const save = useCallback(async (data: InvoiceData) => {
    setIsSaving(true)
    try {
      const response = await fetch(
        invoiceId ? `/api/invoices/${invoiceId}` : '/api/invoices',
        {
          method: invoiceId ? 'PUT' : 'POST',
          body: JSON.stringify(data),
        }
      )
      const saved = await response.json()
      setInvoice(saved)
      return saved
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [invoiceId])

  return { invoice, isSaving, error, save }
}
```

### Update Dashboard to Fetch Real Data

```typescript
// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { DashboardKPI } from '@/lib/dashboard-data'

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPI[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/kpis')
      .then(r => r.json())
      .then(data => setKpis(data))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="grid grid-cols-4 gap-4">
      {kpis.map(kpi => (
        <KPICard key={kpi.id} {...kpi} />
      ))}
    </div>
  )
}
```

---

## Phase 5: File Upload & Export

### Invoice PDF Export

```typescript
// app/api/invoices/[id]/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Fetch invoice from database
    const invoice = await db.invoice.findUnique({
      where: { id: params.id },
    })

    if (!invoice || invoice.workspaceId !== session.workspaceId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Generate PDF (using a library like @react-pdf/renderer or pdfkit)
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    // ... add invoice content to PDF

    // Return PDF
    const pdfBytes = await pdfDoc.save()
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
```

### File Upload (Logo, etc.)

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { upload } from '@vercel/blob'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getSession(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    // Upload to Vercel Blob
    const blob = await upload(
      `${session.userId}/${file.name}`,
      file
    )

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
```

---

## Phase 6: Email Sending

### Invoice Email

```typescript
// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvoiceEmail(
  to: string,
  invoiceNumber: string,
  pdfUrl: string
) {
  return await resend.emails.send({
    from: 'noreply@toolforge.app',
    to,
    subject: `Invoice ${invoiceNumber}`,
    html: `
      <p>Please find your invoice attached.</p>
      <p><a href="${pdfUrl}">Download Invoice</a></p>
    `,
  })
}

export async function sendVerificationEmail(to: string, link: string) {
  return await resend.emails.send({
    from: 'noreply@toolforge.app',
    to,
    subject: 'Verify your email',
    html: `<a href="${link}">Click here to verify your email</a>`,
  })
}
```

---

## Phase 7: Testing

### Unit Tests

```typescript
// lib/invoice-state.test.ts
import { calculateInvoiceTotals } from './invoice-state'

describe('calculateInvoiceTotals', () => {
  it('calculates subtotal correctly', () => {
    const invoice = {
      items: [
        { description: 'Service', quantity: 2, rate: 100 },
      ],
    }
    const result = calculateInvoiceTotals(invoice)
    expect(result.subtotal).toBe(200)
  })

  it('applies discount correctly', () => {
    const invoice = {
      items: [{ description: 'Service', quantity: 1, rate: 100 }],
      discount: { type: 'percentage', value: 10, applied: true },
    }
    const result = calculateInvoiceTotals(invoice)
    expect(result.subtotal).toBe(100)
    expect(result.total).toBe(90) // After 10% discount
  })
})
```

### Integration Tests

```typescript
// e2e/invoice.spec.ts
import { test, expect } from '@playwright/test'

test('Create and save invoice', async ({ page }) => {
  // Login
  await page.goto('/auth/sign-in')
  await page.fill('input[type=email]', 'test@example.com')
  await page.fill('input[type=password]', 'password123')
  await page.click('button:has-text("Sign in")')

  // Navigate to invoice builder
  await page.goto('/invoice/new')

  // Fill business details
  await page.fill('input[name=businessName]', 'My Company')
  await page.click('button:has-text("Next")')

  // Fill client details
  await page.fill('input[name=clientName]', 'Client Corp')
  await page.click('button:has-text("Next")')

  // Save invoice
  await page.click('button:has-text("Save")')

  // Verify saved
  await expect(page).toHaveURL(/\/dashboard\/invoices\/[a-f0-9-]+/)
})
```

---

## Phase 8: Deployment

### Environment Variables

```env
# .env.local
DATABASE_URL=postgresql://user:password@localhost/toolforge_dev
BETTER_AUTH_SECRET=your-secret-key-here
RESEND_API_KEY=your-resend-key
VERCEL_BLOB_KEY=your-blob-key
```

### Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Add backend API"
git push origin main

# Vercel auto-deploys on push
# Configure environment variables in Vercel dashboard
# Database migrations run automatically
```

---

## Integration Checklist

### Phase 1: API Setup ✓
- [ ] Create API route structure
- [ ] Setup error handling
- [ ] Add request logging
- [ ] Add CORS headers (if needed)

### Phase 2: Database ✓
- [ ] Create schema
- [ ] Setup migrations
- [ ] Seed initial data
- [ ] Setup backups

### Phase 3: Authentication ✓
- [ ] Setup auth library (Better Auth)
- [ ] Implement sign-up
- [ ] Implement sign-in
- [ ] Implement logout
- [ ] Implement email verification
- [ ] Implement 2FA
- [ ] Implement password reset
- [ ] Setup middleware for protected routes

### Phase 4: Frontend Integration ✓
- [ ] Update API calls in hooks
- [ ] Update page data fetching
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add success notifications

### Phase 5: File Operations ✓
- [ ] Setup PDF generation
- [ ] Setup file upload
- [ ] Setup file storage (Blob/S3)
- [ ] Setup download/export

### Phase 6: Email ✓
- [ ] Setup email service
- [ ] Send verification emails
- [ ] Send password reset emails
- [ ] Send invoice emails
- [ ] Send notifications

### Phase 7: Testing ✓
- [ ] Unit tests for business logic
- [ ] Integration tests for API
- [ ] E2E tests for critical flows
- [ ] Load testing for performance

### Phase 8: Deployment ✓
- [ ] Setup environment variables
- [ ] Setup CI/CD
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Setup monitoring/logging
- [ ] Setup error tracking

---

## Critical Rules for Backend Integration

### ✅ DO

- Use existing TypeScript types (InvoiceData, Invoice, Client, etc.)
- Keep API data structures aligned with frontend types
- Preserve all existing routes and pages
- Maintain the frozen UI/UX design
- Add loading and error states using existing components
- Use database transactions for data consistency
- Implement proper error handling
- Add comprehensive logging
- Use HTTPS for all API calls
- Implement rate limiting
- Add CORS only if backend is separate
- Test thoroughly before deploying

### ❌ DON'T

- Change frontend component structure
- Modify colors, fonts, or spacing
- Rename existing routes
- Change API response data structures
- Remove existing UI elements
- Break existing functionality
- Skip authentication checks
- Store sensitive data in localStorage
- Use unencrypted passwords
- Deploy without testing
- Change database schema without migrations
- Mix API responses with UI state

---

## Performance Optimization

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_invoices_user_id ON invoices(workspace_id);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX idx_clients_workspace_id ON clients(workspace_id);

-- Monitor slow queries
EXPLAIN ANALYZE SELECT * FROM invoices WHERE workspace_id = $1;
```

### API Performance
```typescript
// Add caching headers
export async function GET(request: NextRequest) {
  const response = NextResponse.json(data)
  response.headers.set('Cache-Control', 'public, max-age=60')
  return response
}

// Paginate large result sets
const limit = 20
const offset = (page - 1) * limit
const invoices = await db.invoice.findMany({
  skip: offset,
  take: limit,
})
```

### Frontend Optimization
```typescript
// Use SWR for data fetching with caching
import useSWR from 'swr'

export function useInvoices() {
  const { data, error, isLoading } = useSWR('/api/invoices', fetcher)
  return { invoices: data, error, isLoading }
}
```

---

## Monitoring & Debugging

### Logging
```typescript
import { logger } from '@/lib/logger'

logger.info('Invoice created', { invoiceId, userId })
logger.error('Invoice save failed', { error, invoiceData })
```

### Error Tracking
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

### Monitoring
- Vercel Analytics for Core Web Vitals
- Database monitoring for slow queries
- API monitoring for response times
- Error tracking with Sentry

---

## Success Criteria

After backend implementation, you should have:

- ✅ Full CRUD operations for invoices, clients, products
- ✅ Real user authentication and authorization
- ✅ Workspace/team management
- ✅ Invoice PDF generation and email sending
- ✅ Dashboard with real data
- ✅ File upload for logos
- ✅ Data persistence across sessions
- ✅ Proper error handling and logging
- ✅ Full test coverage
- ✅ Production deployment ready
- ✅ Frozen UI/UX unchanged

---

## Summary

This guide provides a roadmap for transforming ToolForge from a mock-data frontend into a fully functional SaaS backend. The key principle is **preserving the frozen UI/UX** while adding real data, authentication, and backend logic.

Follow the phases in order, test thoroughly after each phase, and refer to UI_FREEZE_NOTES.md to ensure no UI changes occur during backend work.


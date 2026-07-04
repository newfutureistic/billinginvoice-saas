# ToolForge — Prisma Schema Plan

> **Design artifact, not a migration.** This is the proposed `prisma/schema.prisma`
> for review. It expresses the model in `DATABASE_ARCHITECTURE.md` using
> **Prisma ORM** against **Supabase PostgreSQL**. No migrations are run in this phase.

---

## 1. Datasource & generator (Supabase wiring)

Supabase gives us two connection strings. Prisma needs both:

- **Pooled** (`DATABASE_URL`, PgBouncer, port `6543`, `?pgbouncer=true`) — used by the
  app at runtime (serverless-friendly, transaction pooling).
- **Direct** (`DIRECT_URL`, port `5432`) — used by `prisma migrate` / introspection,
  which need a non-pooled session.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Supabase pooled (PgBouncer)
  directUrl = env("DIRECT_URL")        // Supabase direct — migrations only
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["fullTextSearch"] // for tool/blog search surfaces
}
```

> **Note on Supabase Auth:** we do **not** map Prisma models into Supabase's `auth`
> schema. Identity lives in our `public` schema, owned by Prisma, and is driven by
> **Auth.js v5** (see `AUTH_FLOW.md`). Supabase provides Postgres + Storage +
> (optional) Realtime, not the identity provider.

---

## 2. Conventions

| Concern | Convention |
|---------|-----------|
| **IDs** | `String @id @default(cuid())` — URL-safe, non-sequential (safe for `/invoices/[id]`). |
| **Timestamps** | `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`. |
| **Soft delete** | `deletedAt DateTime?` on tenant models; repositories filter `deletedAt: null`. |
| **Money** | `Decimal @db.Decimal(14, 2)` — never `Float` for currency. |
| **Flexible/type-specific data** | `Json` (JSONB) columns validated by Zod at the edge. |
| **Tenancy** | `workspaceId` present on every tenant model; leading column of composite indexes. |
| **Enums** | Postgres enums for closed sets that match frozen unions. |
| **Naming** | Models `PascalCase` singular; relation FKs `xxxId`. |

---

## 3. Enums (aligned to frozen UI unions)

```prisma
enum DocumentType {
  INVOICE          // lib/invoice-types.ts
  QUOTE            // "quotes" tool
  RECEIPT          // "receipt-maker" tool
  CREDIT_NOTE      // "credit-note" tool
  SALARY_SLIP      // future tool
  PURCHASE_ORDER   // future tool
  PROPOSAL
  DELIVERY_NOTE
  // add values as document tools are added — enum-only change, no model change
}

enum DocumentStatus {
  DRAFT            // frozen union: 'draft'
  SENT             // 'sent'
  PAID             // 'paid'
  OVERDUE          // 'overdue'
  ACCEPTED         // quotes
  DECLINED
  VOID
}

enum ToolKind        { DOCUMENT  GENERATOR  CALCULATOR  UTILITY }
enum ToolStatus      { POPULAR  NEW  PRO }                       // frozen ToolStatus
enum PlanTier        { FREE  PRO  BUSINESS }                     // frozen pricing
enum Role            { OWNER  ADMIN  MANAGER  MEMBER  VIEWER }   // see RBAC.md
enum MemberStatus    { ACTIVE  INVITED  SUSPENDED }             // frozen 'active'|'inactive'
enum InviteStatus    { PENDING  ACCEPTED  REVOKED  EXPIRED }
enum Currency        { USD  EUR  GBP  CAD  AUD  INR  JPY }       // frozen Currency
enum TaxType         { GST  VAT  SALES_TAX  CUSTOM }             // frozen TaxType
enum PaymentMethod   { CARD  BANK_TRANSFER  CASH  ONLINE  OTHER }
enum PaymentProvider { STRIPE  RAZORPAY  MANUAL }
enum PaymentStatus   { PENDING  SUCCEEDED  FAILED  REFUNDED }
enum NotificationCategory { INVOICE  PAYMENT  SYSTEM  TEAM }     // frozen Notification.type
enum EmailKind {
  VERIFY  RESET  INVITE  INVOICE_SENT  REMINDER  RECEIPT  PAYMENT_CONFIRMED  SYSTEM
}
enum EmailStatus     { QUEUED  SENT  DELIVERED  BOUNCED  FAILED }
enum FileKind        { LOGO  AVATAR  INVOICE_PDF  DOCUMENT_PDF  EXPORT  ATTACHMENT  QR  BARCODE }
```

---

## 4. Identity & Access (Auth.js core + 2FA)

```prisma
model User {
  id             String    @id @default(cuid())
  name           String?
  email          String    @unique
  emailVerified  DateTime?
  passwordHash   String?             // null for OAuth-only users (argon2id)
  image          String?
  timezone       String    @default("UTC")   // frozen profile field
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  accounts       Account[]
  sessions       Session[]
  memberships    Membership[]
  twoFactor      TwoFactorSecret?
  notifications  Notification[]
  createdDocs    Document[]  @relation("DocCreatedBy")
  auditLogs      AuditLog[]  @relation("AuditActor")
}

model Account {                       // Auth.js OAuth (Google, GitHub)
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {                       // database session strategy
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {             // email verify + password reset (6-digit / link)
  identifier String                   // email
  token      String   @unique         // hashed
  expires    DateTime
  @@unique([identifier, token])
}

model TwoFactorSecret {
  id          String   @id @default(cuid())
  userId      String   @unique
  secret      String                   // TOTP secret (encrypted at rest)
  enabledAt   DateTime?
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  backupCodes BackupCode[]
}

model BackupCode {
  id        String   @id @default(cuid())
  twoFaId   String
  codeHash  String
  usedAt    DateTime?
  twoFa     TwoFactorSecret @relation(fields: [twoFaId], references: [id], onDelete: Cascade)
}
```

---

## 5. Tenancy & Billing

```prisma
model Workspace {
  id          String   @id @default(cuid())
  name        String                       // "Acme Corporation"
  slug        String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  settings    WorkspaceSettings?
  subscription Subscription?
  memberships Membership[]
  invitations Invitation[]
  documents   Document[]
  clients     Client[]
  products    Product[]
  templates   TemplateAsset[]
  sequences   DocumentSequence[]
  toolRuns    ToolRun[]
  toolPins    WorkspaceToolPin[]
  files       FileObject[]
  payments    Payment[]
  emails      EmailMessage[]
  notifications Notification[]
  auditLogs   AuditLog[]
  activity    ActivityEvent[]
}

model WorkspaceSettings {              // output of the frozen onboarding flow
  id             String   @id @default(cuid())
  workspaceId    String   @unique
  legalName      String?
  businessType   String?               // onboarding "Business type"
  email          String?
  phone          String?
  address        Json?                 // {line1, city, state, zip, country}
  defaultCurrency Currency @default(USD)   // onboarding /currency
  taxRegion      String?               // onboarding /tax country
  defaultTaxType TaxType?              // onboarding tax type
  taxId          String?               // onboarding "Tax ID / ABN"
  brandColor     String?  @default("#3b82f6") // onboarding /branding
  logoFileId     String?
  numberFormat   String   @default("INV-{YYYY}-{SEQ}")
  defaultTemplateId String?
  onboardedAt    DateTime?
  workspace      Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}

model Membership {                     // RBAC seat — see RBAC.md
  id          String   @id @default(cuid())
  userId      String
  workspaceId String
  role        Role     @default(MEMBER)
  status      MemberStatus @default(ACTIVE)
  joinedAt    DateTime @default(now())  // frozen "Joined" column
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  @@unique([userId, workspaceId])
  @@index([workspaceId, role])
}

model Invitation {
  id          String   @id @default(cuid())
  workspaceId String
  email       String
  role        Role     @default(MEMBER)
  token       String   @unique
  status      InviteStatus @default(PENDING)
  invitedById String?
  expiresAt   DateTime
  createdAt   DateTime @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  @@index([workspaceId, status])
}

model Plan {                           // frozen pricing: Free / Pro / Business
  id          String   @id @default(cuid())
  tier        PlanTier @unique
  name        String
  priceMonthly Decimal @db.Decimal(10,2)
  priceAnnual  Decimal @db.Decimal(10,2)
  entitlements Json     // {docsPerMonth, seats, allTools, customBranding, recurring,
                        //  sharedTemplates, approvals, rbac, auditLog, sso, support}
  subscriptions Subscription[]
}

model Subscription {
  id             String   @id @default(cuid())
  workspaceId    String   @unique
  planId         String
  planTier       PlanTier @default(FREE)  // denormalised for fast entitlement checks
  status         String   @default("active") // active | past_due | canceled | trialing
  provider       PaymentProvider?
  providerRef    String?                  // Stripe/Razorpay subscription id
  currentPeriodEnd DateTime?
  docsUsedThisPeriod Int   @default(0)     // enforces frozen "3 docs/month" on Free
  workspace      Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  plan           Plan      @relation(fields: [planId], references: [id])
}
```

---

## 6. Tool Registry

```prisma
model ToolCategory {
  id          String @id @default(cuid())
  slug        String @unique          // billing-invoicing, documents-contracts, finance-tax, productivity
  name        String
  description String
  icon        String                  // lucide icon name (frozen)
  sortWeight  Int    @default(0)
  tools       Tool[]
}

model Tool {
  id          String   @id @default(cuid())
  slug        String   @unique        // matches /tools/[slug]
  name        String
  tagline     String
  description String
  categoryId  String
  kind        ToolKind
  outputType  DocumentType?           // set for DOCUMENT/GENERATOR tools
  status      ToolStatus?             // popular | new | pro
  minPlan     PlanTier @default(FREE) // gates 'pro' tools to Pro/Business
  schemaKey   String                  // "invoice.v1" → names the Zod payload validator
  featured    Boolean  @default(false)
  isActive    Boolean  @default(true)
  addedAt     DateTime @default(now())
  sortWeight  Int      @default(0)
  category    ToolCategory @relation(fields: [categoryId], references: [id])
  documents   Document[]
  toolRuns    ToolRun[]
  pins        WorkspaceToolPin[]
  @@index([categoryId, isActive])
}

model WorkspaceToolPin {
  id          String @id @default(cuid())
  workspaceId String
  toolId      String
  pinnedAt    DateTime @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  tool        Tool      @relation(fields: [toolId], references: [id], onDelete: Cascade)
  @@unique([workspaceId, toolId])
}

model ToolRun {                        // stateless calculators: GST/EMI/Loan/NumberToWords/QR/Barcode
  id          String   @id @default(cuid())
  workspaceId String
  toolId      String
  userId      String?
  input       Json                     // validated by tool's Zod schema
  output      Json
  resultFileId String?                 // e.g. generated QR/barcode image
  createdAt   DateTime @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  tool        Tool      @relation(fields: [toolId], references: [id], onDelete: Cascade)
  @@index([workspaceId, toolId, createdAt])
}
```

---

## 7. Documents (polymorphic core) + business records

```prisma
model Document {
  id            String   @id @default(cuid())
  workspaceId   String
  toolId        String
  type          DocumentType
  number        String                 // "INV-2024-001"
  status        DocumentStatus @default(DRAFT)

  issueDate     DateTime
  dueDate       DateTime?
  currency      Currency @default(USD)

  // frozen snapshots (BusinessDetails / ClientDetails shapes)
  issuer        Json                   // sender business block
  recipient     Json                   // client block (also linkable ↓)
  clientId      String?

  // financial config (frozen TaxConfig / discount / shipping)
  taxConfig     Json
  discount      Json
  shipping      Json

  // computed & snapshotted server-side (single source of truth)
  subtotal      Decimal  @db.Decimal(14,2) @default(0)
  taxTotal      Decimal  @db.Decimal(14,2) @default(0)
  total         Decimal  @db.Decimal(14,2) @default(0)
  amountPaid    Decimal  @db.Decimal(14,2) @default(0)

  // branding (frozen brandingSection)
  branding      Json?
  templateId    String?

  // content (frozen notes/terms/paymentInstructions/bankDetails)
  notes         String?
  terms         String?
  paymentInstructions String?
  bankDetails   Json?

  // type-specific fields (salary earnings/deductions, PO supplier, quote validUntil…)
  payload       Json?

  pdfFileId     String?
  createdById   String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  deletedAt     DateTime?

  workspace     Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  tool          Tool      @relation(fields: [toolId], references: [id], onDelete: Restrict)
  client        Client?   @relation(fields: [clientId], references: [id], onDelete: SetNull)
  template      TemplateAsset? @relation(fields: [templateId], references: [id], onDelete: SetNull)
  pdfFile       FileObject?    @relation("DocPdf", fields: [pdfFileId], references: [id], onDelete: SetNull)
  createdBy     User?     @relation("DocCreatedBy", fields: [createdById], references: [id], onDelete: SetNull)
  items         DocumentItem[]
  payments      PaymentAllocation[]
  shares        DocumentShare[]

  @@unique([workspaceId, number])
  @@index([workspaceId, type, status])
  @@index([workspaceId, clientId])
  @@index([workspaceId, issueDate])
}

model DocumentItem {                   // frozen InvoiceItem + snapshot amount
  id          String  @id @default(cuid())
  documentId  String
  productId   String?
  description String
  quantity    Decimal @db.Decimal(14,3)
  rate        Decimal @db.Decimal(14,2)
  unit        String?                  // "hours", "items"
  taxRate     Decimal @db.Decimal(6,3) @default(0)
  amount      Decimal @db.Decimal(14,2)   // snapshot = qty * rate
  position    Int     @default(0)         // frozen drag-to-reorder
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  product     Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  @@index([documentId])
}

model DocumentSequence {               // gap-free per-tenant numbering
  id          String @id @default(cuid())
  workspaceId String
  documentType DocumentType
  prefix      String  @default("INV")
  period      String                   // "2024"
  nextValue   Int     @default(1)
  padding     Int     @default(3)
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  @@unique([workspaceId, documentType, period])
}

model DocumentShare {                  // public/preview links (frozen /invoice/preview)
  id          String   @id @default(cuid())
  documentId  String
  token       String   @unique
  expiresAt   DateTime?
  viewCount   Int      @default(0)
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
}

model Client {                         // frozen dashboard Client
  id          String  @id @default(cuid())
  workspaceId String
  name        String
  email       String?
  phone       String?
  address     String?
  taxId       String?
  status      String  @default("active")   // frozen 'active'|'inactive'
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  documents   Document[]
  @@unique([workspaceId, email])
  @@index([workspaceId, status])
}

model Product {                        // frozen dashboard Product
  id          String  @id @default(cuid())
  workspaceId String
  name        String
  description String?
  price       Decimal @db.Decimal(14,2)
  sku         String
  category    String?
  quantity    Int     @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  items       DocumentItem[]
  @@unique([workspaceId, sku])
}

model TemplateAsset {                  // 8 frozen invoice templates + custom
  id          String  @id @default(cuid())
  workspaceId String?                  // null = system template (shared)
  key         String                   // classic | modern | minimal | corporate | luxury | dark | creative | elegant
  name        String
  description String?
  colors      Json                     // frozen {primary, accent, text, background}
  isSystem    Boolean @default(false)
  workspace   Workspace? @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  documents   Document[]
  @@unique([workspaceId, key])
}
```

---

## 8. Money movement, files, comms, observability

```prisma
model Payment {
  id             String   @id @default(cuid())
  workspaceId    String
  amount         Decimal  @db.Decimal(14,2)
  currency       Currency
  method         PaymentMethod
  provider       PaymentProvider @default(MANUAL)
  providerRef    String?
  status         PaymentStatus   @default(SUCCEEDED)
  idempotencyKey String   @unique      // dedupes webhook retries
  refundOfId     String?              // negative rows link to original
  receivedAt     DateTime @default(now())
  workspace      Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  allocations    PaymentAllocation[]
  @@index([workspaceId, status])
}

model PaymentAllocation {              // one payment → many documents
  id          String  @id @default(cuid())
  paymentId   String
  documentId  String
  amount      Decimal @db.Decimal(14,2)
  payment     Payment  @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  @@unique([paymentId, documentId])
}

model FileObject {                     // Supabase Storage metadata — see STORAGE_PLAN.md
  id          String   @id @default(cuid())
  workspaceId String
  kind        FileKind
  bucket      String
  path        String                   // workspace-scoped key
  mimeType    String
  sizeBytes   Int
  checksum    String?
  createdById String?
  createdAt   DateTime @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  docPdfs     Document[] @relation("DocPdf")
  @@index([workspaceId, kind])
}

model EmailMessage {
  id          String   @id @default(cuid())
  workspaceId String?
  toEmail     String
  kind        EmailKind
  templateKey String
  relatedType String?
  relatedId   String?
  provider    String?
  providerMessageId String?
  status      EmailStatus @default(QUEUED)
  sentAt      DateTime?
  openedAt    DateTime?
  createdAt   DateTime @default(now())
  workspace   Workspace? @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  @@index([workspaceId, kind])
}

model Notification {                   // frozen Notification
  id             String   @id @default(cuid())
  workspaceId    String
  recipientUserId String
  category       NotificationCategory
  title          String
  body           String
  relatedType    String?
  relatedId      String?
  channelsSent   String[]
  seenAt         DateTime?
  readAt         DateTime?
  createdAt      DateTime @default(now())
  workspace      Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  recipient      User      @relation(fields: [recipientUserId], references: [id], onDelete: Cascade)
  @@index([recipientUserId, readAt])
}

model AuditLog {                       // immutable compliance record
  id          String   @id @default(cuid())
  workspaceId String
  actorId     String?
  action      String                   // "document.update", "member.role.change"
  targetType  String
  targetId    String
  before      Json?
  after       Json?
  ip          String?
  userAgent   String?
  createdAt   DateTime @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  actor       User?     @relation("AuditActor", fields: [actorId], references: [id], onDelete: SetNull)
  @@index([workspaceId, createdAt])
  @@index([targetType, targetId])
}

model ActivityEvent {                  // frozen ActivityLog — user-facing timeline
  id          String   @id @default(cuid())
  workspaceId String
  actorLabel  String                   // "You", "Michael Chen"
  verb        String                   // "Invoice Created"
  summary     String                   // "Created invoice INV-2024-005 for …"
  relatedType String?
  relatedId   String?
  createdAt   DateTime @default(now())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  @@index([workspaceId, createdAt])
  @@index([relatedType, relatedId])
}
```

---

## 9. Migration strategy

1. **Baseline (Phase 0).** `prisma migrate dev --name init` against a Supabase branch
   DB using `DIRECT_URL`. Never run migrations through the pooled URL.
2. **Expand → migrate → contract** for any change touching live data (add nullable
   column → backfill → enforce), so migrations stay backward-compatible with the
   frozen frontend during rollout.
3. **Adding a document tool ≠ migration.** New `DocumentType`/`EmailKind` enum values
   are additive migrations; new *tools* of an existing kind are just seed rows +
   Zod schema + PDF template. This is the "no redesign" guarantee in practice.
4. **Shadow database** for CI drift detection; `prisma migrate diff` gate on PRs.
5. **RLS (optional, later):** add Postgres RLS policies via raw SQL migrations if/when
   defence-in-depth is required (see `DATABASE_ARCHITECTURE.md §13`).

---

## 10. Seed plan (`prisma/seed.ts`)

Seeds turn today's frozen static arrays into rows — **no UI change, just a data
source swap**:

| Seed source (frozen file) | Target table |
|---------------------------|--------------|
| `categories` in `lib/site-data.ts` | `ToolCategory` (4 rows) |
| `tools` in `lib/site-data.ts` | `Tool` (~28 rows) + future tools |
| `INVOICE_TEMPLATES` in `lib/invoice-templates.ts` | `TemplateAsset` (8 system templates) |
| Frozen pricing (`featureGroups`) | `Plan` (FREE/PRO/BUSINESS + entitlements) |
| — | Demo `Workspace` + `Membership` + sample `Document`s mirroring `mockInvoices` for local dev |

---

## 11. Coverage check

- **Prisma Schema** ✔ (this file) · **ER Diagram / Relationships** → `DATABASE_ARCHITECTURE.md`.
- Every frozen type (`InvoiceData`, `Client`, `Product`, `Team`, `Notification`,
  `ActivityLog`, `CatalogTool`, `InvoiceTemplate`, pricing `FeatureRow`) has a home.
- Every future tool (salary slip, PO, GST/EMI/loan calculators, QR/barcode,
  number-to-words) is expressible with **zero new models** — `Document` + `payload`
  or `ToolRun`.

**Next:** `API_ARCHITECTURE.md` — how the application layers over this schema.

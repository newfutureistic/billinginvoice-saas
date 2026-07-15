import { invoiceCreateSchema } from '@/lib/validation/invoice.schema'
import {
  validateGSTIN,
  validatePAN,
  validateZIP,
  validateHSN,
  validateIFSC,
  validateSWIFT,
  validateIBAN,
  validateUPI,
  validateURL,
} from '@/lib/validation/formats'

/**
 * Single source of truth for "is this invoice safe to generate?" — used by BOTH the
 * builder (Review & Export step) and the server render route. It runs the existing
 * canonical `invoiceCreateSchema` (which already encodes the rules: required business/
 * client name, at least one line item, positive quantities, non-negative rate/discount/
 * shipping, tax 0–100) and maps Zod issues to short, human-readable messages for the
 * frozen error UI. No validation rule is redefined here — only presentation.
 */
function friendly(path: readonly PropertyKey[], message: string): string {
  const [a, b] = path
  if (a === 'business' && path.length === 1) return 'Business details are required'
  if (a === 'client' && path.length === 1) return 'Client details are required'
  if (a === 'business' && b === 'businessName') return 'Business name is required'
  if (a === 'business' && b === 'email') return 'Business email is invalid'
  if (a === 'client' && b === 'clientName') return 'Client name is required'
  if (a === 'client' && b === 'email') return 'Client email is invalid'
  if (a === 'items' && path.length === 1) return 'Add at least one line item'
  if (a === 'items' && typeof b === 'number') {
    const n = b + 1
    if (path[2] === 'description') return `Item ${n}: description is required`
    if (path[2] === 'quantity') return `Item ${n}: quantity must be greater than 0`
    if (path[2] === 'rate') return `Item ${n}: rate cannot be negative`
    return `Item ${n}: ${message}`
  }
  if (a === 'discount' && b === 'value') return 'Discount cannot be negative'
  if (a === 'shipping' && b === 'cost') return 'Shipping cost cannot be negative'
  if (a === 'tax' && b === 'rate') return 'Tax rate must be between 0 and 100'
  if (a === 'tax' && b === 'type') return 'Select a valid tax type'
  if (a === 'currency') return 'Select a valid currency'
  if (a === 'issueDate') return 'Issue date is required'
  return message
}

/**
 * Validate raw invoice data. Returns [] when valid, otherwise a de-duplicated list of
 * human-readable errors. Accepts `unknown` so the server route can pass its request body
 * straight through.
 */
export function validateInvoiceData(invoice: unknown): string[] {
  const result = invoiceCreateSchema.safeParse(invoice)
  if (result.success) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const issue of result.error.issues) {
    const msg = friendly(issue.path, issue.message)
    if (!seen.has(msg)) {
      seen.add(msg)
      out.push(msg)
    }
  }
  return out
}

/* -------------------------------------------------------------------------- */
/* Per-step wizard validation                                                  */
/* -------------------------------------------------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const isBlank = (v: unknown) => typeof v !== 'string' || v.trim() === ''
const isValidDate = (v: unknown) => typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Date.parse(v))

/** Minimal shape the step validator reads (kept structural so callers stay decoupled). */
interface StepInvoice {
  business?: {
    businessName?: string
    email?: string
    gstin?: string
    pan?: string
    taxId?: string
    zipCode?: string
    website?: string
  }
  client?: { clientName?: string; email?: string; gstin?: string; taxId?: string; zipCode?: string }
  items?: Array<{ description?: string; quantity?: number; rate?: number; hsn?: string }>
  currency?: string
  tax?: { rate?: number }
  discount?: { type?: string; value?: number; applied?: boolean }
  shipping?: { cost?: number; applied?: boolean }
  invoiceNumber?: string
  issueDate?: string
  dueDate?: string
  bankDetails?: { ifsc?: string; swift?: string; iban?: string }
  upiId?: string
}

/** Run a format validator and push a prefixed message when it fails. */
function check(out: string[], label: string, fn: (v: string) => string | null, value: string | undefined) {
  const err = value ? fn(value) : null
  if (err) out.push(`${label}: ${err}`)
}

/**
 * Errors that block leaving a given wizard step. Returns [] when the step may be left.
 * Only rules that are genuinely required to produce a valid invoice are enforced here —
 * optional fields never block progress.
 */
export function validateStep(step: number, invoice: StepInvoice): string[] {
  const e: string[] = []
  switch (step) {
    case 1: {
      const b = invoice.business
      if (isBlank(b?.businessName)) e.push('Business name is required')
      const email = b?.email
      if (!isBlank(email) && !EMAIL_RE.test(email!.trim())) e.push('Business email is not a valid email address')
      check(e, 'Business GSTIN', validateGSTIN, b?.gstin)
      check(e, 'Business PAN', validatePAN, b?.pan)
      // NOTE: `taxId` is a free-form tax identifier (US EIN "12-3456789", AU ABN, …), NOT an
      // EU VAT number. Running validateVAT over it rejected valid US EINs and blocked the
      // wizard. `validateVAT` stays exported/tested for a future dedicated VAT field.
      check(e, 'Business ZIP', validateZIP, b?.zipCode)
      check(e, 'Business website', validateURL, b?.website)
      break
    }
    case 2: {
      const c = invoice.client
      if (isBlank(c?.clientName)) e.push('Client name is required')
      const email = c?.email
      if (!isBlank(email) && !EMAIL_RE.test(email!.trim())) e.push('Client email is not a valid email address')
      check(e, 'Client GSTIN', validateGSTIN, c?.gstin)
      // `taxId` is free-form (see the note in step 1) — not validated as EU VAT.
      check(e, 'Client ZIP', validateZIP, c?.zipCode)
      break
    }
    case 3: {
      const items = invoice.items ?? []
      if (items.length === 0) e.push('Add at least one line item')
      items.forEach((it, i) => {
        const n = i + 1
        if (isBlank(it.description)) e.push(`Item ${n}: description is required`)
        if (typeof it.quantity !== 'number' || Number.isNaN(it.quantity) || it.quantity <= 0)
          e.push(`Item ${n}: quantity must be greater than 0`)
        if (typeof it.rate !== 'number' || Number.isNaN(it.rate) || it.rate < 0)
          e.push(`Item ${n}: rate cannot be negative`)
        check(e, `Item ${n} HSN/SAC`, validateHSN, it.hsn)
      })
      if (isBlank(invoice.currency)) e.push('Select a currency')
      break
    }
    case 4: {
      const rate = invoice.tax?.rate
      if (typeof rate !== 'number' || Number.isNaN(rate) || rate < 0 || rate > 100)
        e.push('Tax rate must be between 0 and 100')
      break
    }
    case 5: {
      const d = invoice.discount
      if (d?.applied) {
        if (typeof d.value !== 'number' || Number.isNaN(d.value) || d.value < 0) e.push('Discount cannot be negative')
        else if (d.type === 'percentage' && d.value > 100) e.push('Percentage discount cannot exceed 100%')
      }
      break
    }
    case 6: {
      const s = invoice.shipping
      if (s?.applied && (typeof s.cost !== 'number' || Number.isNaN(s.cost) || s.cost < 0))
        e.push('Shipping cost cannot be negative')
      break
    }
    case 8: {
      if (isBlank(invoice.invoiceNumber)) e.push('Invoice number is required')
      if (!isValidDate(invoice.issueDate)) e.push('A valid issue date is required')
      if (!isBlank(invoice.dueDate) && !isValidDate(invoice.dueDate)) e.push('Due date is not a valid date')
      if (isValidDate(invoice.issueDate) && isValidDate(invoice.dueDate) && Date.parse(invoice.dueDate!) < Date.parse(invoice.issueDate!))
        e.push('Due date cannot be before the issue date')
      check(e, 'IFSC', validateIFSC, invoice.bankDetails?.ifsc)
      check(e, 'SWIFT/BIC', validateSWIFT, invoice.bankDetails?.swift)
      check(e, 'IBAN', validateIBAN, invoice.bankDetails?.iban)
      check(e, 'UPI ID', validateUPI, invoice.upiId)
      break
    }
    default:
      break
  }
  return [...new Set(e)]
}

/**
 * Pure invoice formatting helpers shared by the builder UI, the live preview, and the
 * server-side PDF renderer — so what the user sees on screen exactly matches the PDF.
 * No React, no Node-only APIs: safe to import on both client and server.
 */

/* -------------------------------------------------------------------------- */
/* UPI payment QR                                                             */
/* -------------------------------------------------------------------------- */

export interface UpiUriInput {
  /** Payee VPA / UPI ID, e.g. "name@bank". */
  pa: string
  /** Payee name shown in the payer's app. */
  pn?: string
  /** Amount to pre-fill; omit for a "static" QR where the payer types the amount. */
  am?: number
  /** Transaction note. */
  tn?: string
  /** Currency (UPI is INR-only in practice). */
  cu?: string
}

/**
 * Build a spec-compliant UPI deep link (`upi://pay?...`). Scanning it in any UPI app
 * (GPay, PhonePe, Paytm, BHIM…) opens the payment screen — with the amount pre-filled
 * when `am` is provided. Values are percent-encoded (spaces as %20) for max app support.
 */
export function buildUpiUri({ pa, pn, am, tn, cu = 'INR' }: UpiUriInput): string {
  const enc = (s: string) => encodeURIComponent(s.trim())
  const parts = [`pa=${enc(pa)}`]
  if (pn && pn.trim()) parts.push(`pn=${enc(pn)}`)
  if (typeof am === 'number' && isFinite(am) && am > 0) parts.push(`am=${am.toFixed(2)}`)
  parts.push(`cu=${enc(cu)}`)
  if (tn && tn.trim()) parts.push(`tn=${enc(tn)}`)
  return `upi://pay?${parts.join('&')}`
}

export interface QrResolveInput {
  upiId?: string | null
  payeeName?: string | null
  includeAmount?: boolean
  amount?: number
  invoiceNumber?: string | null
  /** Generic fallback link/text used when no UPI ID is set. */
  fallback?: string | null
}

/**
 * Decide what the invoice QR should encode: a real UPI deep link when a UPI ID is set,
 * otherwise the generic "scan to pay / view invoice" link. Returns "" when neither is set.
 */
export function resolveInvoiceQr(input: QrResolveInput): string {
  const pa = input.upiId?.trim()
  if (pa) {
    return buildUpiUri({
      pa,
      pn: input.payeeName?.trim() || undefined,
      am: input.includeAmount ? input.amount : undefined,
      tn: input.invoiceNumber ? `Invoice ${input.invoiceNumber}` : undefined,
    })
  }
  return input.fallback?.trim() || ''
}

/** Caption shown under the QR — distinguishes a UPI QR from a generic link QR. */
export function qrCaption(qrValue: string): string {
  return qrValue.startsWith('upi://') ? 'Scan to pay (UPI)' : 'Scan to pay'
}

/* -------------------------------------------------------------------------- */
/* Tax lines (GST split: CGST + SGST intra-state, IGST inter-state)           */
/* -------------------------------------------------------------------------- */

export interface TaxLineInput {
  type: string
  rate: number
  supplyType?: 'intra' | 'inter'
  customLabel?: string
}

export interface TaxLine {
  label: string
  amount: number
}

/** Trim trailing ".0" so "9%" not "9.0%" while keeping "2.5%". */
function pct(n: number): string {
  return Number(n.toFixed(2)).toString()
}

/**
 * Break a computed tax amount into the lines an invoice should show. For GST this splits
 * into CGST + SGST (intra-state, the default) or a single IGST line (inter-state); every
 * other tax type stays a single line. Returns [] when there's no tax.
 */
export function taxLines(tax: TaxLineInput, taxAmount: number): TaxLine[] {
  if (!(tax.rate > 0) && !(taxAmount > 0)) return []
  if (tax.type === 'GST') {
    if (tax.supplyType === 'inter') {
      return [{ label: `IGST (${pct(tax.rate)}%)`, amount: taxAmount }]
    }
    const half = tax.rate / 2
    return [
      { label: `CGST (${pct(half)}%)`, amount: taxAmount / 2 },
      { label: `SGST (${pct(half)}%)`, amount: taxAmount / 2 },
    ]
  }
  const base = tax.type === 'Custom' ? tax.customLabel?.trim() || 'Tax' : tax.type
  return [{ label: `${base}${tax.rate ? ` (${pct(tax.rate)}%)` : ''}`, amount: taxAmount }]
}

/* -------------------------------------------------------------------------- */
/* Amount in words                                                            */
/* -------------------------------------------------------------------------- */

const CURRENCY_WORDS: Record<string, { main: string; fraction: string; decimals: number; indian?: boolean }> = {
  USD: { main: 'Dollars', fraction: 'Cents', decimals: 2 },
  EUR: { main: 'Euros', fraction: 'Cents', decimals: 2 },
  GBP: { main: 'Pounds', fraction: 'Pence', decimals: 2 },
  CAD: { main: 'Canadian Dollars', fraction: 'Cents', decimals: 2 },
  AUD: { main: 'Australian Dollars', fraction: 'Cents', decimals: 2 },
  INR: { main: 'Rupees', fraction: 'Paise', decimals: 2, indian: true },
  JPY: { main: 'Yen', fraction: '', decimals: 0 },
  AED: { main: 'Dirhams', fraction: 'Fils', decimals: 2 },
  SGD: { main: 'Singapore Dollars', fraction: 'Cents', decimals: 2 },
  CHF: { main: 'Francs', fraction: 'Rappen', decimals: 2 },
}

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
]
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function below100(n: number): string {
  if (n < 20) return ONES[n]
  return TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : '')
}

function below1000(n: number): string {
  const h = Math.floor(n / 100)
  const r = n % 100
  return (h ? `${ONES[h]} Hundred${r ? ' ' : ''}` : '') + (r ? below100(r) : '')
}

/** International grouping: thousand / million / billion. */
function intlWords(n: number): string {
  if (n === 0) return 'Zero'
  const units = ['', ' Thousand', ' Million', ' Billion', ' Trillion']
  let i = 0
  let out = ''
  while (n > 0 && i < units.length) {
    const chunk = n % 1000
    if (chunk) out = `${below1000(chunk)}${units[i]}${out ? ` ${out}` : ''}`
    n = Math.floor(n / 1000)
    i++
  }
  return out.trim()
}

/** Indian grouping: thousand / lakh / crore. */
function indianWords(n: number): string {
  if (n === 0) return 'Zero'
  let out = ''
  const crore = Math.floor(n / 10000000)
  n %= 10000000
  const lakh = Math.floor(n / 100000)
  n %= 100000
  const thousand = Math.floor(n / 1000)
  n %= 1000
  if (crore) out += `${crore > 99 ? indianWords(crore) : below100(crore)} Crore `
  if (lakh) out += `${below100(lakh)} Lakh `
  if (thousand) out += `${below100(thousand)} Thousand `
  if (n) out += below1000(n)
  return out.trim().replace(/\s+/g, ' ')
}

/**
 * Convert a money amount to words for the invoice, e.g.
 * `amountInWords(11137.5, 'INR')` → "Rupees Eleven Thousand One Hundred Thirty Seven and Fifty Paise Only".
 * Uses Indian (lakh/crore) grouping for INR and international grouping otherwise.
 */
export function amountInWords(amount: number, currency: string): string {
  const meta = CURRENCY_WORDS[currency] ?? { main: currency, fraction: '', decimals: 2 }
  const neg = amount < 0
  const abs = Math.abs(amount)
  const factor = Math.pow(10, meta.decimals)
  const rounded = Math.round(abs * factor) / factor
  const whole = Math.floor(rounded)
  const frac = Math.round((rounded - whole) * factor)
  const toWords = meta.indian ? indianWords : intlWords
  let s = `${meta.main} ${toWords(whole)}`.trim()
  if (meta.decimals > 0 && frac > 0 && meta.fraction) {
    s += ` and ${below100(frac)} ${meta.fraction}`
  }
  s += ' Only'
  return (neg ? 'Minus ' : '') + s
}

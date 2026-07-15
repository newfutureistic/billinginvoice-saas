/**
 * Production format validators for invoice identity / banking fields.
 *
 * Every validator is pure, dependency-free and shared by the wizard (client) and the API
 * (server) so a rule can never drift between the two. All accept a raw string and return an
 * error message, or `null` when valid. Blank input is always treated as "not provided" —
 * requiredness is decided by the caller, never here.
 */

const blank = (v: string | null | undefined): boolean => typeof v !== 'string' || v.trim() === ''
const up = (v: string) => v.trim().toUpperCase()

/* -------------------------------------------------------------------------- */
/* India — GSTIN / PAN / HSN / SAC / IFSC / UPI                                */
/* -------------------------------------------------------------------------- */

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/
/** 2-digit state code + PAN + entity digit + 'Z' + checksum char. */
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/
const GSTIN_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/** GSTIN check digit: weighted (alternating 1,2) mod-36 over the first 14 characters. */
function gstinChecksumValid(gstin: string): boolean {
  let sum = 0
  for (let i = 0; i < 14; i++) {
    const code = GSTIN_CHARS.indexOf(gstin[i])
    if (code < 0) return false
    const product = code * (i % 2 === 0 ? 1 : 2)
    sum += Math.floor(product / 36) + (product % 36)
  }
  const check = (36 - (sum % 36)) % 36
  return GSTIN_CHARS[check] === gstin[14]
}

export function validateGSTIN(value: string): string | null {
  if (blank(value)) return null
  const v = up(value)
  if (v.length !== 15) return 'GSTIN must be exactly 15 characters'
  if (!GSTIN_RE.test(v)) return 'GSTIN format is invalid (e.g. 29ABCDE1234F1ZW)'
  if (!gstinChecksumValid(v)) return 'GSTIN checksum is invalid — please re-check the number'
  return null
}

export function validatePAN(value: string): string | null {
  if (blank(value)) return null
  const v = up(value)
  if (!PAN_RE.test(v)) return 'PAN format is invalid (e.g. ABCDE1234F)'
  return null
}

/** HSN: 4/6/8 digits. SAC: 6 digits. */
export function validateHSN(value: string): string | null {
  if (blank(value)) return null
  const v = value.trim()
  if (!/^[0-9]+$/.test(v)) return 'HSN/SAC must contain digits only'
  if (![4, 6, 8].includes(v.length)) return 'HSN must be 4, 6 or 8 digits (SAC is 6)'
  return null
}

export function validateSAC(value: string): string | null {
  if (blank(value)) return null
  const v = value.trim()
  if (!/^[0-9]{6}$/.test(v)) return 'SAC must be exactly 6 digits'
  return null
}

/** IFSC: 4 letters + '0' + 6 alphanumerics. */
export function validateIFSC(value: string): string | null {
  if (blank(value)) return null
  const v = up(value)
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(v)) return 'IFSC format is invalid (e.g. HDFC0001234)'
  return null
}

/** UPI VPA: handle@psp. */
export function validateUPI(value: string): string | null {
  if (blank(value)) return null
  const v = value.trim()
  if (!/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9.\-_]{1,63}$/.test(v))
    return 'UPI ID format is invalid (e.g. name@okhdfcbank)'
  return null
}

/* -------------------------------------------------------------------------- */
/* International — VAT / SWIFT / IBAN / ZIP / URL                              */
/* -------------------------------------------------------------------------- */

/** EU-style VAT: 2-letter country code + 2–13 alphanumerics. */
export function validateVAT(value: string): string | null {
  if (blank(value)) return null
  const v = up(value).replace(/[\s-]/g, '')
  if (!/^[A-Z]{2}[A-Z0-9]{2,13}$/.test(v)) return 'VAT number format is invalid (e.g. GB123456789)'
  return null
}

/** SWIFT/BIC: 8 or 11 characters. */
export function validateSWIFT(value: string): string | null {
  if (blank(value)) return null
  const v = up(value)
  if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v)) return 'SWIFT/BIC must be 8 or 11 characters (e.g. HDFCINBB)'
  return null
}

/** IBAN: structure + ISO 7064 mod-97 checksum. */
export function validateIBAN(value: string): string | null {
  if (blank(value)) return null
  const v = up(value).replace(/[\s-]/g, '')
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(v)) return 'IBAN format is invalid'
  // Move the first 4 chars to the end, expand letters to numbers, then mod-97 must equal 1.
  const rearranged = v.slice(4) + v.slice(0, 4)
  let remainder = 0
  for (const ch of rearranged) {
    const chunk = /[0-9]/.test(ch) ? ch : (ch.charCodeAt(0) - 55).toString()
    for (const d of chunk) remainder = (remainder * 10 + Number(d)) % 97
  }
  if (remainder !== 1) return 'IBAN checksum is invalid — please re-check the number'
  return null
}

/** Postal code: permissive across countries, but rejects junk. */
export function validateZIP(value: string): string | null {
  if (blank(value)) return null
  const v = value.trim()
  if (!/^[A-Za-z0-9][A-Za-z0-9 -]{1,10}$/.test(v)) return 'Postal / ZIP code is invalid'
  return null
}

/** Absolute http(s) URL. */
export function validateURL(value: string): string | null {
  if (blank(value)) return null
  const v = value.trim()
  try {
    const u = new URL(v)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return 'URL must start with http:// or https://'
    if (!u.hostname.includes('.')) return 'URL host is invalid'
    return null
  } catch {
    return 'URL is invalid (e.g. https://example.com)'
  }
}

/* -------------------------------------------------------------------------- */
/* Uploads — type / size                                                       */
/* -------------------------------------------------------------------------- */

export const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const
/** The PDF engine embeds PNG/JPEG only; webp is accepted on screen but not embedded. */
export const PDF_EMBEDDABLE_MIME_TYPES = ['image/png', 'image/jpeg'] as const

export const MAX_LOGO_BYTES = 2 * 1024 * 1024 // 2 MB
export const MAX_SIGNATURE_BYTES = 1 * 1024 * 1024 // 1 MB
export const MAX_QR_BYTES = 1 * 1024 * 1024 // 1 MB

function prettyBytes(n: number): string {
  return n >= 1024 * 1024 ? `${Math.round(n / (1024 * 1024))} MB` : `${Math.round(n / 1024)} KB`
}

export function validateUploadType(mime: string, allowed: readonly string[] = PDF_EMBEDDABLE_MIME_TYPES): string | null {
  if (blank(mime)) return 'File type could not be determined'
  if (!allowed.includes(mime.toLowerCase()))
    return `Unsupported file type — use ${allowed.map((m) => m.replace('image/', '').toUpperCase()).join(' or ')}`
  return null
}

export function validateUploadSize(bytes: number, max: number): string | null {
  if (!Number.isFinite(bytes) || bytes <= 0) return 'File appears to be empty'
  if (bytes > max) return `File is too large (max ${prettyBytes(max)})`
  return null
}

/** Convenience: validate a data URL's declared mime + decoded byte length. */
export function validateImageDataUrl(
  dataUrl: string,
  opts: { max: number; allowed?: readonly string[] },
): string | null {
  if (blank(dataUrl)) return null
  const m = /^data:([^;,]+);base64,(.*)$/i.exec(dataUrl.trim())
  if (!m) return 'Image must be a valid base64 data URL'
  const typeErr = validateUploadType(m[1], opts.allowed ?? PDF_EMBEDDABLE_MIME_TYPES)
  if (typeErr) return typeErr
  // base64 → bytes (4 chars ≈ 3 bytes, minus padding)
  const b64 = m[2].replace(/\s/g, '')
  const padding = (b64.match(/=+$/) ?? [''])[0].length
  const bytes = Math.floor((b64.length * 3) / 4) - padding
  return validateUploadSize(bytes, opts.max)
}

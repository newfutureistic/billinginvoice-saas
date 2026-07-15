import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  validateGSTIN,
  validatePAN,
  validateHSN,
  validateSAC,
  validateIFSC,
  validateUPI,
  validateVAT,
  validateSWIFT,
  validateIBAN,
  validateZIP,
  validateURL,
  validateUploadType,
  validateUploadSize,
  validateImageDataUrl,
  MAX_LOGO_BYTES,
} from '@/lib/validation/formats'

const ok = (r: string | null) => assert.equal(r, null)
const bad = (r: string | null) => assert.ok(typeof r === 'string' && r.length > 0, 'expected an error message')

/* ---------------- blank is always allowed (requiredness is the caller's job) ------------- */
test('formats: blank input is never an error', () => {
  for (const fn of [validateGSTIN, validatePAN, validateHSN, validateIFSC, validateUPI, validateVAT, validateSWIFT, validateIBAN, validateZIP, validateURL]) {
    ok(fn(''))
    ok(fn('   '))
  }
})

/* ---------------- GSTIN ---------------- */
test('GSTIN: accepts a checksum-valid number', () => {
  // 27AAPFU0939F1ZV is a widely-used valid specimen GSTIN.
  ok(validateGSTIN('27AAPFU0939F1ZV'))
  ok(validateGSTIN('27aapfu0939f1zv')) // case-insensitive
})

test('GSTIN: rejects wrong length / shape', () => {
  bad(validateGSTIN('27AAPFU0939F1Z')) // 14 chars
  bad(validateGSTIN('27AAPFU0939F1ZVX')) // 16 chars
  bad(validateGSTIN('AA27APFU0939F1ZV')) // state code not numeric
  bad(validateGSTIN('27AAPFU0939F1YV')) // 'Z' slot wrong
})

test('GSTIN: rejects a bad check digit', () => {
  // Same as the valid specimen but with the final checksum char altered.
  bad(validateGSTIN('27AAPFU0939F1ZA'))
})

/* ---------------- PAN ---------------- */
test('PAN: valid / invalid', () => {
  ok(validatePAN('ABCDE1234F'))
  ok(validatePAN('abcde1234f'))
  bad(validatePAN('ABCD1234F')) // 4 letters
  bad(validatePAN('ABCDE1234')) // missing trailing letter
  bad(validatePAN('ABCDE12345'))
})

/* ---------------- HSN / SAC ---------------- */
test('HSN: 4/6/8 digits only', () => {
  ok(validateHSN('9983'))
  ok(validateHSN('998314'))
  ok(validateHSN('99831400'))
  bad(validateHSN('998')) // 3 digits
  bad(validateHSN('99831')) // 5 digits
  bad(validateHSN('9983AB')) // non-numeric
})

test('SAC: exactly 6 digits', () => {
  ok(validateSAC('998314'))
  bad(validateSAC('9983'))
  bad(validateSAC('99831A'))
})

/* ---------------- IFSC ---------------- */
test('IFSC: 4 letters + 0 + 6 alphanumerics', () => {
  ok(validateIFSC('HDFC0001234'))
  ok(validateIFSC('hdfc0001234'))
  bad(validateIFSC('HDFC1001234')) // 5th char must be 0
  bad(validateIFSC('HDF00001234')) // only 3 letters
  bad(validateIFSC('HDFC000123')) // too short
})

/* ---------------- UPI ---------------- */
test('UPI: handle@psp', () => {
  ok(validateUPI('billmaker@okhdfcbank'))
  ok(validateUPI('john.doe-1_x@ybl'))
  bad(validateUPI('billmaker'))
  bad(validateUPI('@okhdfcbank'))
  bad(validateUPI('bill maker@ybl')) // space
})

/* ---------------- VAT ---------------- */
test('VAT: country code + alphanumerics', () => {
  ok(validateVAT('GB123456789'))
  ok(validateVAT('DE 123 456 789'))
  bad(validateVAT('1234567')) // no country code
  bad(validateVAT('G1234'))
})

/* ---------------- SWIFT ---------------- */
test('SWIFT: 8 or 11 chars', () => {
  ok(validateSWIFT('HDFCINBB'))
  ok(validateSWIFT('HDFCINBBXXX'))
  bad(validateSWIFT('HDFCIN')) // 6
  bad(validateSWIFT('HDFCINBBXX')) // 10
  bad(validateSWIFT('1234INBB')) // must start with 6 letters
})

/* ---------------- IBAN (mod-97) ---------------- */
test('IBAN: accepts checksum-valid numbers', () => {
  ok(validateIBAN('GB82WEST12345698765432'))
  ok(validateIBAN('DE89370400440532013000'))
  ok(validateIBAN('gb82 west 1234 5698 7654 32')) // spaces + case
})

test('IBAN: rejects a bad checksum', () => {
  bad(validateIBAN('GB82WEST12345698765433')) // last digit altered
  bad(validateIBAN('DE89370400440532013001'))
})

test('IBAN: rejects malformed structure', () => {
  bad(validateIBAN('GB82')) // too short
  bad(validateIBAN('1B82WEST12345698765432')) // country code not letters
})

/* ---------------- ZIP ---------------- */
test('ZIP: permissive but rejects junk', () => {
  ok(validateZIP('94105'))
  ok(validateZIP('SW1A 1AA'))
  ok(validateZIP('110001'))
  bad(validateZIP('!!'))
  bad(validateZIP('9')) // too short
})

/* ---------------- URL ---------------- */
test('URL: http(s) absolute only', () => {
  ok(validateURL('https://example.com'))
  ok(validateURL('http://sub.example.co.uk/path?q=1'))
  bad(validateURL('example.com')) // not absolute
  bad(validateURL('ftp://example.com')) // wrong protocol
  bad(validateURL('javascript:alert(1)')) // must not be accepted
  bad(validateURL('https://localhost')) // no dot in host
})

/* ---------------- uploads ---------------- */
test('upload type: PNG/JPEG embeddable, others rejected', () => {
  ok(validateUploadType('image/png'))
  ok(validateUploadType('image/jpeg'))
  bad(validateUploadType('image/svg+xml')) // pdf-lib cannot embed SVG
  bad(validateUploadType('application/pdf'))
  bad(validateUploadType(''))
})

test('upload size: enforces max and rejects empty', () => {
  ok(validateUploadSize(1024, MAX_LOGO_BYTES))
  bad(validateUploadSize(0, MAX_LOGO_BYTES))
  bad(validateUploadSize(MAX_LOGO_BYTES + 1, MAX_LOGO_BYTES))
})

test('image data URL: validates mime + decoded size', () => {
  // 1x1 transparent PNG
  const png =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  ok(validateImageDataUrl(png, { max: MAX_LOGO_BYTES }))
  ok(validateImageDataUrl('', { max: MAX_LOGO_BYTES })) // blank allowed
  bad(validateImageDataUrl('data:image/svg+xml;base64,PHN2Zy8+', { max: MAX_LOGO_BYTES }))
  bad(validateImageDataUrl('not-a-data-url', { max: MAX_LOGO_BYTES }))
  bad(validateImageDataUrl(png, { max: 10 })) // over the size cap
})

/* ---------------- regression: shipped defaults must pass their own validators ------------- */
test('regression: default invoice seed passes every wizard step validator', async () => {
  const { MOCK_INVOICE } = await import('@/lib/invoice-state')
  const { validateStep } = await import('@/lib/invoice-validation')
  // The seed shipped a checksum-invalid placeholder GSTIN, which blocked Steps 1 and 2 out of
  // the box. Demo data must always satisfy the validators the wizard enforces.
  for (const step of [1, 2, 3, 4, 5, 6, 8]) {
    assert.deepEqual(validateStep(step, MOCK_INVOICE), [], `step ${step} must not block the default invoice`)
  }
})

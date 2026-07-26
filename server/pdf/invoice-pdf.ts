import { PDFDocument, StandardFonts, degrees, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib'
import QRCode from 'qrcode'
import type { Currency } from '@prisma/client'
import { CURRENCIES } from '@/server/utils/currency'

/**
 * Invoice / document PDF renderer — a designed, print-ready A4 document built on `pdf-lib`
 * (no headless browser, no native deps). Each template category renders a *structurally
 * distinct* composition — hero header, left sidebar, editorial masthead, dark fintech or Swiss
 * minimal — driven by a per-template design profile. Every persisted field is rendered; the
 * items table flows across pages with a repeated column header, and totals / payment / notes /
 * signature always land together on the final page.
 *
 * Engine constraints handled gracefully: pdf-lib ships only the standard Helvetica/Times fonts
 * (no custom weights), and has no blur — so gradients are stepped and "glass/shadow" effects are
 * faked with layered translucent fills.
 */
export interface InvoicePdfParty {
  name: string
  lines: string[]
}

export interface InvoicePdfItem {
  description: string
  sku?: string
  hsn?: string
  unit?: string
  quantity: number
  rate: number
  amount: number
}

export interface InvoicePdfTaxLine {
  label: string
  amount: number
}

export interface InvoicePdfChargeLine {
  label: string
  amount: number
  negative?: boolean
}

export interface InvoicePdfInput {
  type: string
  number: string
  status: string
  currency: Currency
  issueDate: string
  dueDate: string | null
  poNumber?: string | null
  referenceNumber?: string | null
  paymentMethod?: string | null
  paymentStatus?: string | null
  issuer: InvoicePdfParty
  recipient: InvoicePdfParty
  items: InvoicePdfItem[]
  subtotal: number
  taxTotal: number
  total: number
  amountPaid: number
  taxLabel?: string
  taxLines?: InvoicePdfTaxLine[]
  /** Discount / shipping / additional charges, drawn between Subtotal and Total. */
  chargeLines?: InvoicePdfChargeLine[]
  roundOffAmount?: number | null
  notes?: string | null
  terms?: string | null
  paymentInstructions?: string | null
  brandColorHex?: string | null
  qrCodeData?: string | null
  amountInWords?: string | null
  logoDataUrl?: string | null
  watermark?: string | null
  bankLines?: string[]
  /** Receipt mode: per-payment lines shown under a "PAYMENTS RECEIVED" heading. */
  receiptLines?: string[] | null
  signatureDataUrl?: string | null
  signatureLabel?: string | null
  /** Template visual style (shared with the preview via lib/invoice-template-spec). */
  theme?: {
    serif: boolean
    header: 'band' | 'topbar' | 'plain' | 'split' | 'block' | 'minimal'
    tableHeader: 'filled' | 'underline' | 'soft'
    accent: string
    primary: string
    text: string
    totalsCard?: boolean
    zebra?: boolean
    category?: string
    background?: string
  }
}

/* -------------------------------------------------------------------------- */
/* Primitives                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Strip anything the PDF fonts cannot encode.
 *
 * pdf-lib's StandardFonts use WinAnsi (CP1252) — which DOES cover the currency glyphs
 * £ € ¥ ¢ and the Latin-1 accents, so those must be preserved (an earlier ASCII-only filter
 * silently deleted them). Characters outside CP1252 (₹, Arabic, CJK, emoji) would throw on
 * encode, so they are dropped here; currency codes carry the meaning instead via `pdfSymbol`.
 */
const WIN_ANSI_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ'
const NON_WIN_ANSI = new RegExp(`[^\\x20-\\x7E\\xA0-\\xFF${WIN_ANSI_EXTRA}]`, 'g')

function ascii(value: string): string {
  return value.replace(NON_WIN_ANSI, ' ').replace(/\s+/g, ' ').trim()
}

/** Money for the PDF: engine-safe symbol + grouped amount (e.g. "$1,250.00", "Rs.1,250.00"). */
function money(amount: number, code: Currency): string {
  const meta = CURRENCIES[code]
  const decimals = meta?.decimals ?? 2
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
  return `${meta?.pdfSymbol ?? code} ${formatted}`
}

function hexToRgb(hex: string | null | undefined, fallback: RGB): RGB {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? '')
  if (!m) return fallback
  const n = parseInt(m[1], 16)
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return rgb(a.red + (b.red - a.red) * t, a.green + (b.green - a.green) * t, a.blue + (b.blue - a.blue) * t)
}

function luminance(c: RGB): number {
  return 0.2126 * c.red + 0.7152 * c.green + 0.0722 * c.blue
}

/** Rounded-rectangle SVG path (origin top-left, grows down — matches pdf-lib drawSvgPath). */
function roundedRectPath(w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2))
  return `M ${rr} 0 H ${w - rr} A ${rr} ${rr} 0 0 1 ${w} ${rr} V ${h - rr} A ${rr} ${rr} 0 0 1 ${w - rr} ${h} H ${rr} A ${rr} ${rr} 0 0 1 0 ${h - rr} V ${rr} A ${rr} ${rr} 0 0 1 ${rr} 0 Z`
}

async function embedImageDataUrl(doc: PDFDocument, dataUrl: string) {
  const m = /^data:image\/(png|jpe?g);base64,([A-Za-z0-9+/=\s]+)$/i.exec(dataUrl.trim())
  if (!m) return null
  try {
    const bytes = Buffer.from(m[2].replace(/\s/g, ''), 'base64')
    return m[1].toLowerCase() === 'png' ? await doc.embedPng(bytes) : await doc.embedJpg(bytes)
  } catch {
    return null
  }
}

const A4: [number, number] = [595.28, 841.89]
const W = A4[0]
const H = A4[1]

type LayoutKind = 'hero' | 'sidebar' | 'editorial' | 'swiss' | 'lux' | 'ornate' | 'fintech' | 'mag'

interface Profile {
  layout: LayoutKind
  paper: RGB // page background
  ink: RGB // body text
  strong: RGB // headings
  muted: RGB
  faint: RGB
  primary: RGB // brand / header color
  primaryDark: RGB // gradient bottom / shade
  accent: RGB // secondary accent (gold / electric)
  onPrimary: RGB // text on the primary block
  onPrimarySoft: RGB
  cardFill: RGB
  cardLine: RGB
  hair: RGB
  serif: boolean
  upper: boolean
  dark: boolean
  creative: boolean
}

function buildProfile(input: InvoicePdfInput): Profile {
  const category = input.theme?.category ?? 'modern'
  const brand = input.brandColorHex ? hexToRgb(input.brandColorHex, rgb(0.23, 0.36, 0.96)) : null
  const themeAccent = hexToRgb(input.theme?.accent, rgb(0.23, 0.36, 0.96))
  const white = rgb(1, 1, 1)
  const near = rgb(0.1, 0.11, 0.16)

  const base = (over: Partial<Profile>): Profile => ({
    layout: 'hero',
    paper: white,
    ink: rgb(0.16, 0.18, 0.24),
    strong: rgb(0.09, 0.1, 0.15),
    muted: rgb(0.44, 0.47, 0.53),
    faint: rgb(0.58, 0.6, 0.66),
    primary: brand ?? themeAccent,
    primaryDark: mix(brand ?? themeAccent, rgb(0, 0, 0), 0.32),
    accent: brand ?? themeAccent,
    onPrimary: white,
    onPrimarySoft: mix(white, brand ?? themeAccent, 0.28),
    cardFill: rgb(0.968, 0.973, 0.981),
    cardLine: rgb(0.9, 0.915, 0.945),
    hair: rgb(0.9, 0.91, 0.94),
    serif: false,
    upper: false,
    dark: false,
    creative: false,
    ...over,
  })

  switch (category) {
    case 'dark': {
      const paper = rgb(0.105, 0.12, 0.16)
      const electric = brand ?? rgb(0.29, 0.55, 0.98)
      return base({
        layout: 'fintech',
        paper,
        ink: rgb(0.9, 0.92, 0.96),
        strong: white,
        muted: rgb(0.62, 0.66, 0.74),
        faint: rgb(0.5, 0.54, 0.62),
        primary: rgb(0.14, 0.16, 0.22),
        primaryDark: rgb(0.1, 0.11, 0.16),
        accent: electric,
        onPrimary: white,
        onPrimarySoft: rgb(0.66, 0.7, 0.78),
        cardFill: rgb(0.16, 0.18, 0.24),
        cardLine: rgb(0.26, 0.29, 0.36),
        hair: rgb(0.24, 0.27, 0.34),
        dark: true,
      })
    }
    case 'corporate':
      return base({
        layout: 'sidebar',
        primary: brand ?? rgb(0.13, 0.28, 0.6),
        primaryDark: mix(brand ?? rgb(0.13, 0.28, 0.6), rgb(0, 0, 0), 0.3),
        accent: brand ?? rgb(0.13, 0.28, 0.6),
      })
    case 'creative':
      return base({
        layout: 'mag',
        creative: true,
        primary: brand ?? rgb(0.42, 0.24, 0.82),
        primaryDark: mix(brand ?? rgb(0.42, 0.24, 0.82), rgb(0, 0, 0), 0.28),
        accent: rgb(0.98, 0.55, 0.2),
      })
    case 'classic':
      return base({
        layout: 'editorial',
        serif: true,
        primary: rgb(0.1, 0.16, 0.3),
        primaryDark: rgb(0.07, 0.11, 0.22),
        accent: brand ?? rgb(0.69, 0.55, 0.34),
        ink: rgb(0.15, 0.17, 0.22),
      })
    case 'luxury':
      return base({
        layout: 'lux',
        serif: true,
        upper: true,
        paper: rgb(0.965, 0.95, 0.925),
        primary: rgb(0.1, 0.09, 0.08),
        primaryDark: rgb(0.06, 0.055, 0.05),
        accent: brand ?? rgb(0.72, 0.58, 0.33),
        ink: rgb(0.17, 0.15, 0.12),
        muted: rgb(0.42, 0.39, 0.34),
        cardFill: rgb(0.945, 0.925, 0.895),
        cardLine: rgb(0.82, 0.78, 0.7),
        hair: rgb(0.8, 0.75, 0.66),
      })
    case 'elegant':
      return base({
        layout: 'ornate',
        serif: true,
        paper: rgb(0.973, 0.955, 0.94),
        primary: rgb(0.24, 0.16, 0.16),
        primaryDark: rgb(0.18, 0.12, 0.12),
        accent: brand ?? rgb(0.71, 0.44, 0.46),
        ink: rgb(0.24, 0.19, 0.18),
        muted: rgb(0.5, 0.43, 0.41),
        cardFill: rgb(0.955, 0.93, 0.912),
        cardLine: rgb(0.86, 0.79, 0.75),
        hair: rgb(0.84, 0.77, 0.73),
      })
    case 'minimal':
      return base({
        layout: 'swiss',
        primary: near,
        primaryDark: near,
        accent: brand ?? near,
        ink: rgb(0.12, 0.12, 0.13),
        muted: rgb(0.5, 0.5, 0.52),
        faint: rgb(0.64, 0.64, 0.66),
        hair: rgb(0.85, 0.85, 0.87),
      })
    case 'modern':
    default:
      return base({ layout: 'hero' })
  }
}

export async function renderInvoicePdf(input: InvoicePdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(`${input.type} ${input.number}`)

  const P = buildProfile(input)
  const font = await doc.embedFont(P.serif ? StandardFonts.TimesRoman : StandardFonts.Helvetica)
  const bold = await doc.embedFont(P.serif ? StandardFonts.TimesRomanBold : StandardFonts.HelveticaBold)
  const upper = (s: string) => (P.upper ? s.toUpperCase() : s)

  const logo = input.logoDataUrl ? await embedImageDataUrl(doc, input.logoDataUrl) : null
  const sigImg = input.signatureDataUrl ? await embedImageDataUrl(doc, input.signatureDataUrl) : null

  // Content bounds (sidebar shifts the left edge). BOTTOM = footer safe zone.
  const M = P.layout === 'swiss' ? 54 : 46
  const SIDEBAR_W = 176
  let LX = P.layout === 'sidebar' ? SIDEBAR_W + 26 : M
  let RX = W - M
  const BOTTOM = 52

  let page = doc.addPage(A4)
  let y = H - M

  /* ---------- page-level painters ---------- */
  const paintBackground = (pg: PDFPage) => {
    if (P.paper.red !== 1 || P.paper.green !== 1 || P.paper.blue !== 1) {
      pg.drawRectangle({ x: 0, y: 0, width: W, height: H, color: P.paper })
    }
    // Editorial frame
    if (P.layout === 'editorial') {
      const inset = 22
      pg.drawRectangle({ x: inset, y: inset, width: W - 2 * inset, height: H - 2 * inset, borderColor: P.accent, borderWidth: 0.8, color: undefined })
      pg.drawRectangle({ x: inset + 4, y: inset + 4, width: W - 2 * inset - 8, height: H - 2 * inset - 8, borderColor: mix(P.accent, P.paper, 0.5), borderWidth: 0.5, color: undefined })
    }
    // Sidebar column
    if (P.layout === 'sidebar') {
      pg.drawRectangle({ x: 0, y: 0, width: SIDEBAR_W, height: H, color: P.primary })
      pg.drawRectangle({ x: SIDEBAR_W - 3, y: 0, width: 3, height: H, color: P.accent })
    }
    // Watermark logo (subtle)
    if (logo && (P.layout === 'hero' || P.layout === 'editorial')) {
      const d = logo.scaleToFit(260, 260)
      pg.drawImage(logo, { x: W / 2 - d.width / 2, y: H / 2 - d.height / 2, width: d.width, height: d.height, opacity: P.dark ? 0.05 : 0.035 })
    }
  }

  /* ---------- drawing helpers (bind to current page) ---------- */
  const T = (s: string, x: number, yy: number, size: number, f: PDFFont = font, color: RGB = P.ink) =>
    page.drawText(ascii(s), { x, y: yy, size, font: f, color })
  const wof = (s: string, size: number, f: PDFFont = font) => f.widthOfTextAtSize(ascii(s), size)
  const Rt = (s: string, right: number, yy: number, size: number, f: PDFFont = font, color: RGB = P.ink) =>
    page.drawText(ascii(s), { x: right - wof(s, size, f), y: yy, size, font: f, color })
  const Ct = (s: string, cx: number, yy: number, size: number, f: PDFFont = font, color: RGB = P.ink) =>
    page.drawText(ascii(s), { x: cx - wof(s, size, f) / 2, y: yy, size, font: f, color })
  const wrap = (s: string, maxWidth: number, size: number, f: PDFFont = font): string[] => {
    const out: string[] = []
    let cur = ''
    for (const w of ascii(s).split(' ').filter(Boolean)) {
      const test = cur ? `${cur} ${w}` : w
      if (cur && wof(test, size, f) > maxWidth) {
        out.push(cur)
        cur = w
      } else cur = test
    }
    if (cur) out.push(cur)
    return out.length ? out : ['']
  }
  const rrect = (
    x: number,
    topY: number,
    w: number,
    h: number,
    opts: { fill?: RGB; fillOpacity?: number; border?: RGB; borderOpacity?: number; r?: number } = {},
  ) => {
    page.drawSvgPath(roundedRectPath(w, h, opts.r ?? 12), {
      x,
      y: topY,
      color: opts.fill,
      opacity: opts.fillOpacity,
      borderColor: opts.border,
      borderOpacity: opts.borderOpacity,
      borderWidth: opts.border ? 1 : 0,
    })
  }
  const hline = (x1: number, x2: number, yy: number, color: RGB = P.hair, thickness = 1) =>
    page.drawLine({ start: { x: x1, y: yy }, end: { x: x2, y: yy }, thickness, color })
  /** Letter-spaced text (pdf-lib has no tracking) — draws glyph by glyph. Returns total width. */
  const trackedWidth = (s: string, size: number, f: PDFFont, track: number) =>
    [...ascii(s)].reduce((w, ch) => w + f.widthOfTextAtSize(ch, size) + track, 0) - track
  const tracked = (s: string, x: number, yy: number, size: number, f: PDFFont, color: RGB, track: number) => {
    let cx = x
    for (const ch of ascii(s)) {
      page.drawText(ch, { x: cx, y: yy, size, font: f, color })
      cx += f.widthOfTextAtSize(ch, size) + track
    }
  }
  const gradient = (x: number, botY: number, w: number, h: number, top: RGB, bot: RGB) => {
    const steps = 48
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      page.drawRectangle({ x, y: botY + (h * i) / steps, width: w, height: h / steps + 0.6, color: mix(bot, top, t) })
    }
  }

  const newPage = () => {
    page = doc.addPage(A4)
    paintBackground(page)
    y = H - M
    // On continuation pages the sidebar/frame stay; content resumes below the top margin.
    if (P.layout === 'sidebar') y = H - 40
  }
  const ensure = (space: number, redrawTableHeader = false) => {
    if (y - space < BOTTOM) {
      newPage()
      if (redrawTableHeader) drawTableHeader()
    }
  }

  /* ---------- meta pairs ---------- */
  const metaPairs: Array<[string, string]> = []
  const pushMeta = (k: string, v: string | null | undefined) => {
    if (v) metaPairs.push([k, v])
  }
  pushMeta('Invoice No.', input.number)
  pushMeta('Issue Date', input.issueDate.slice(0, 10))
  pushMeta('Due Date', input.dueDate ? input.dueDate.slice(0, 10) : null)
  pushMeta('Reference', input.referenceNumber)
  pushMeta('PO Number', input.poNumber)
  pushMeta('Status', input.status ? input.status[0].toUpperCase() + input.status.slice(1) : null)
  pushMeta('Payment', input.paymentMethod)
  pushMeta('Payment Status', input.paymentStatus)
  pushMeta('Currency', input.currency)

  const title = ascii(input.type.replace(/_/g, ' ')).toUpperCase()

  paintBackground(page)

  /* ================================================================== */
  /* HEADERS (per layout)                                                */
  /* ================================================================== */

  if (P.layout === 'hero') {
    const heroH = 146
    const heroTop = H
    const heroBot = H - heroH
    if (P.creative) {
      // Asymmetric geometric header: primary block + diagonal accent wedge + corner ribbon.
      page.drawRectangle({ x: 0, y: heroBot, width: W, height: heroH, color: P.primary })
      page.drawSvgPath(`M ${W * 0.52} 0 L ${W} 0 L ${W} ${heroH} L ${W * 0.66} ${heroH} Z`, { x: 0, y: heroTop, color: P.accent, opacity: 0.92 })
      page.drawSvgPath(`M 0 0 L 150 0 L 0 150 Z`, { x: 0, y: heroTop, color: mix(P.primary, rgb(0, 0, 0), 0.18) })
    } else {
      gradient(0, heroBot, W, heroH, P.primary, P.primaryDark)
      if (P.dark) {
        // subtle accent glow bar
        page.drawRectangle({ x: 0, y: heroBot, width: W, height: 3, color: P.accent })
      }
    }
    // Business name + details lead the block; the logo sits BELOW them rather than above,
    // so it never crowds the text that identifies who the invoice is from. Its height is
    // clamped to whatever room is actually left above the meta row — guaranteeing no
    // overlap regardless of how many address lines the business has.
    let ly = heroTop - 36
    T(input.issuer.name || 'Business', M, ly, 17, bold, P.onPrimary)
    ly -= 14
    for (const l of input.issuer.lines.slice(0, 3)) {
      T(l, M, ly, 8.4, font, P.onPrimarySoft)
      ly -= 11
    }
    if (logo) {
      const metaFloor = heroBot + 30 // stay clear of the meta row along the bottom of the hero
      const room = ly - 6 - metaFloor
      if (room >= 14) {
        const d = logo.scaleToFit(120, Math.min(40, room))
        page.drawImage(logo, { x: M, y: ly - 6 - d.height, width: d.width, height: d.height })
      }
    }
    // Title auto-shrinks so long custom titles (e.g. "Commercial Invoice") never collide
    // with the business block on the left.
    const titleMaxW = RX - M - wof(input.issuer.name || 'Business', 17, bold) - 24
    let titleSize = 31
    while (titleSize > 15 && wof(title, titleSize, bold) > titleMaxW) titleSize -= 1
    Rt(title, RX, heroTop - 42, titleSize, bold, P.onPrimary)
    // Meta row along the bottom of the hero. NOTE: ascii() collapses whitespace, so gaps must
    // come from x-offsets — never from padding spaces inside the string.
    let mx = RX
    const chips = metaPairs.filter(([k]) => /Invoice No|Issue|Due|Status/i.test(k)).slice(0, 4)
    const LABEL_GAP = 6
    for (let i = chips.length - 1; i >= 0; i--) {
      const [k, v] = chips[i]
      const label = upper(k)
      const wv = wof(v, 9, bold)
      const wl = wof(label, 7.4, font)
      Rt(v, mx, heroBot + 18, 9, bold, P.onPrimary)
      Rt(label, mx - wv - LABEL_GAP, heroBot + 18, 7.4, font, P.onPrimarySoft)
      mx -= wv + LABEL_GAP + wl + 18
    }
    y = heroBot - 18
  } else if (P.layout === 'sidebar') {
    // Sidebar branding column
    let sy = H - 44
    if (logo) {
      const d = logo.scaleToFit(SIDEBAR_W - 56, 46)
      page.drawImage(logo, { x: 28, y: H - 34 - d.height, width: d.width, height: d.height })
      sy = H - 40 - d.height
    }
    T(input.issuer.name || 'Business', 28, sy, 13.5, bold, P.onPrimary)
    sy -= 15
    for (const l of input.issuer.lines.slice(0, 4)) {
      T(l, 28, sy, 8, font, P.onPrimarySoft)
      sy -= 10.5
    }
    sy -= 16
    // vertical accent tick + INVOICE
    page.drawRectangle({ x: 28, y: sy - 2, width: 26, height: 3, color: P.accent })
    sy -= 22
    T(title, 28, sy, 22, bold, P.onPrimary)
    sy -= 30
    for (const [k, v] of metaPairs.slice(0, 8)) {
      T(upper(k), 28, sy, 7, font, P.onPrimarySoft)
      sy -= 11
      T(v, 28, sy, 9, bold, P.onPrimary)
      sy -= 15
    }
    // Body starts at top-right
    y = H - 44
  } else if (P.layout === 'fintech') {
    /* DARK — fintech dashboard: no hero band. A compact brand bar, then a full-width
       "AMOUNT DUE" stat panel that carries the headline number at the TOP of the page. */
    T(input.issuer.name || 'Business', M, H - M - 8, 13, bold, P.strong)
    T(input.issuer.lines.slice(0, 2).join('   '), M, H - M - 21, 7.6, font, P.muted)
    Rt(title, RX, H - M - 8, 11, bold, P.accent)
    Rt(input.number, RX, H - M - 23, 8.4, font, P.muted)
    let sy = H - M - 44
    // Headline stat panel
    const panelH = 82
    rrect(M, sy, W - 2 * M, panelH, { fill: P.cardFill, fillOpacity: 0.75, border: P.cardLine, r: 16 })
    page.drawRectangle({ x: M, y: sy - 22, width: 3, height: 44, color: P.accent })
    T(upper('Amount Due'), M + 22, sy - 24, 7.6, bold, P.accent)
    T(money(input.total, input.currency), M + 22, sy - 50, 26, bold, P.strong)
    // right side: dates + status chips
    const chipY = sy - 30
    Rt(`Issued  ${input.issueDate.slice(0, 10)}`, RX - 22, chipY, 8, font, P.muted)
    if (input.dueDate) Rt(`Due  ${input.dueDate.slice(0, 10)}`, RX - 22, chipY - 13, 8, font, P.muted)
    const st = input.status ? input.status[0].toUpperCase() + input.status.slice(1) : ''
    if (st) {
      const sw = wof(st, 7.6, bold) + 18
      rrect(RX - 22 - sw, chipY - 26, sw, 16, { fill: P.accent, fillOpacity: 0.16, border: P.accent, r: 8 })
      Ct(st, RX - 22 - sw / 2, chipY - 37, 7.6, bold, P.accent)
    }
    y = sy - panelH - 20
  } else if (P.layout === 'mag') {
    /* CREATIVE — magazine: bold diagonal colour field, oversized title, and the meta row
       moved OUT of the diagonal seam (it was being visually cut by the wedge). */
    // Hero height is load-bearing: it sets the y-cursor for the whole page. At 168 the content
    // started 26pt below Modern's, and that deficit carried down to the signature, which needs
    // y >= BOTTOM+42 (94) — Creative reached only 86, forcing a blank page 2 with an orphan
    // signature. 150 reclaims 18pt (sig lands at ~104) and keeps the band comfortably around
    // the wordmark + meta strip.
    const heroH = 150
    const heroBot = H - heroH
    page.drawRectangle({ x: 0, y: heroBot, width: W, height: heroH, color: P.primary })
    page.drawSvgPath(`M ${W * 0.54} 0 L ${W} 0 L ${W} ${heroH} L ${W * 0.7} ${heroH} Z`, { x: 0, y: H, color: P.accent, opacity: 0.95 })
    page.drawSvgPath('M 0 0 L 132 0 L 0 132 Z', { x: 0, y: H, color: mix(P.primary, rgb(0, 0, 0), 0.22) })
    let ly = H - 52
    if (logo) {
      const d = logo.scaleToFit(120, 34)
      page.drawImage(logo, { x: M, y: H - 28 - d.height, width: d.width, height: d.height })
      ly = H - 38 - d.height
    }
    T(input.issuer.name || 'Business', M, ly, 19, bold, P.onPrimary)
    ly -= 15
    for (const l of input.issuer.lines.slice(0, 2)) {
      T(l, M, ly, 8.2, font, mix(rgb(1, 1, 1), P.primary, 0.3))
      ly -= 11
    }
    Rt(title, RX, H - 54, 28, bold, rgb(1, 1, 1))
    Rt(input.number, RX, H - 72, 10, bold, rgb(1, 1, 1))
    // Meta sits INSIDE the hero, left of the diagonal seam (the seam starts at 0.54W at the
    // top and 0.7W at the foot, so x < 0.5W is always on the solid primary field). This keeps
    // the strip off the wedge — which previously sliced through the text — and costs no height.
    let mx = M
    for (const [k, v] of metaPairs.filter(([k]) => /Issue|Due|Status/i.test(k)).slice(0, 3)) {
      T(upper(k), mx, heroBot + 30, 6.6, font, mix(rgb(1, 1, 1), P.primary, 0.42))
      T(v, mx, heroBot + 17, 8.4, bold, rgb(1, 1, 1))
      mx += Math.max(wof(v, 8.4, bold), wof(upper(k), 6.6, font)) + 20
    }
    y = heroBot - 22
  } else if (P.layout === 'ornate') {
    /* ELEGANT — stationery: a rose-gold flourish, a small tracked label instead of a big
       title, and everything centred on an axis. No frame, no band, no cards. */
    const cx = W / 2
    let ly = H - 54
    if (logo) {
      const d = logo.scaleToFit(120, 38)
      page.drawImage(logo, { x: cx - d.width / 2, y: ly - d.height, width: d.width, height: d.height })
      ly -= d.height + 14
    }
    // flourish: three diamonds flanked by fine rules
    const dia = (dx: number, s: number) => page.drawSvgPath(`M ${s} 0 L ${s * 2} ${s} L ${s} ${s * 2} L 0 ${s} Z`, { x: cx + dx - s, y: ly + s, color: P.accent })
    hline(cx - 96, cx - 26, ly, P.accent, 0.5)
    hline(cx + 26, cx + 96, ly, P.accent, 0.5)
    dia(-14, 2.4); dia(0, 3.4); dia(14, 2.4)
    ly -= 26
    const nm = input.issuer.name || 'Business'
    const nmW = trackedWidth(nm.toUpperCase(), 15, font, 4)
    tracked(nm.toUpperCase(), cx - nmW / 2, ly, 15, font, P.primary, 4)
    ly -= 15
    Ct(input.issuer.lines.slice(0, 3).join('   '), cx, ly, 7.8, font, P.muted)
    ly -= 24
    const lbl = title
    const lw = trackedWidth(lbl, 8.4, font, 5)
    tracked(lbl, cx - lw / 2, ly, 8.4, font, P.accent, 5)
    ly -= 14
    Ct(`${input.number}   ·   ${input.issueDate.slice(0, 10)}`.replace(/·/g, '-'), cx, ly, 8.2, font, P.muted)
    ly -= 12
    hline(cx - 34, cx + 34, ly, P.accent, 0.5)
    y = ly - 26
  } else if (P.layout === 'lux') {
    /* LUXURY — full-bleed black band, letter-spaced gold wordmark, asymmetric editorial.
       No frame, no cards: gold hairlines carry the structure. */
    const bandH = 132
    page.drawRectangle({ x: 0, y: H - bandH, width: W, height: bandH, color: P.primary })
    // thin gold rules top & bottom of the band
    page.drawRectangle({ x: 0, y: H - bandH, width: W, height: 1.6, color: P.accent })
    let ly = H - 52
    if (logo) {
      const d = logo.scaleToFit(120, 34)
      page.drawImage(logo, { x: M, y: H - 26 - d.height, width: d.width, height: d.height })
      ly = H - 34 - d.height
    }
    const nm = (input.issuer.name || 'Business').toUpperCase()
    const nmSize = trackedWidth(nm, 19, bold, 3.4) > W - 2 * M - 150 ? 14 : 19
    tracked(nm, M, ly, nmSize, bold, P.accent, 3.4)
    ly -= 16
    // NOTE: ascii() strips non-ASCII, so separators must be plain ASCII (no em-dash / middot).
    T(input.issuer.lines.slice(0, 2).join('   -   '), M, ly, 8, font, mix(rgb(1, 1, 1), P.primary, 0.35))
    // right: small letter-spaced title stacked over the number
    const tw = trackedWidth(title, 10, font, 4.2)
    tracked(title, RX - tw, H - 52, 10, font, P.accent, 4.2)
    Rt(input.number, RX, H - 76, 15, bold, rgb(1, 1, 1))
    Rt(
      input.dueDate
        ? `Issued ${input.issueDate.slice(0, 10)}   /   Due ${input.dueDate.slice(0, 10)}`
        : `Issued ${input.issueDate.slice(0, 10)}`,
      RX,
      H - 92,
      7.6,
      font,
      mix(rgb(1, 1, 1), P.primary, 0.4),
    )
    y = H - bandH - 34
  } else if (P.layout === 'editorial') {
    let ly = H - 58
    if (logo) {
      const d = logo.scaleToFit(160, 50)
      page.drawImage(logo, { x: W / 2 - d.width / 2, y: ly - d.height, width: d.width, height: d.height })
      ly -= d.height + 12
    }
    Ct(input.issuer.name || 'Business', W / 2, ly - 4, 20, bold, P.primary)
    ly -= 24
    Ct(input.issuer.lines.slice(0, 3).join('    '), W / 2, ly, 8.6, font, P.muted)
    ly -= 20
    // gold divider with center diamond
    hline(W / 2 - 120, W / 2 - 10, ly, P.accent, 0.8)
    hline(W / 2 + 10, W / 2 + 120, ly, P.accent, 0.8)
    page.drawSvgPath('M 4 0 L 8 4 L 4 8 L 0 4 Z', { x: W / 2 - 4, y: ly + 4, color: P.accent })
    ly -= 22
    Ct(title, W / 2, ly, 15, bold, P.strong)
    ly -= 20
    const chips = metaPairs.filter(([k]) => /Invoice No|Issue|Due|Status/i.test(k)).slice(0, 4)
    Ct(chips.map(([k, v]) => `${upper(k)}: ${v}`).join('      '), W / 2, ly, 8.4, font, P.muted)
    y = ly - 24
  } else {
    // SWISS minimal
    const topY = H - M
    T('INVOICE', M, topY, 9, bold, P.muted)
    T(input.number, M, topY - 22, 26, bold, P.strong)
    // right meta grid
    let my = topY
    for (const [k, v] of metaPairs.filter(([k]) => !/Invoice No/i.test(k)).slice(0, 6)) {
      T(k, RX - 170, my, 8, font, P.faint)
      Rt(v, RX, my, 8.6, bold, P.strong)
      my -= 13
    }
    y = Math.min(topY - 40, my) - 18
    hline(M, RX, y, P.hair, 1)
    y -= 26
  }

  const CW = RX - LX

  /* ================================================================== */
  /* BILL FROM / BILL TO                                                 */
  /* ================================================================== */
  {
    const showFrom = P.layout !== 'sidebar' && P.layout !== 'editorial'
    const toLines = input.recipient.lines.slice(0, 6)
    const fromLines = input.issuer.lines.slice(0, 6)
    if (P.layout === 'swiss') {
      // SWISS: no cards. A hairline, a tiny uppercase label, then pure typography on a grid.
      const rows = Math.max(fromLines.length, toLines.length)
      const colB = LX + CW * 0.5
      hline(LX, LX + CW * 0.42, y + 12, P.strong, 0.8)
      hline(colB, RX, y + 12, P.strong, 0.8)
      tracked(upper('From'), LX, y, 6.8, font, P.faint, 1.4)
      tracked(upper('Billed To'), colB, y, 6.8, font, P.faint, 1.4)
      let ay = y - 16
      T(input.issuer.name || '-', LX, ay, 11, bold, P.strong)
      T(input.recipient.name || '-', colB, ay, 11, bold, P.strong)
      ay -= 13
      fromLines.forEach((l, i) => T(l, LX, ay - i * 10.5, 8.2, font, P.muted))
      toLines.forEach((l, i) => T(l, colB, ay - i * 10.5, 8.2, font, P.muted))
      y = ay - rows * 10.5 - 20
    } else if (P.layout === 'ornate') {
      // Single centred recipient block on the page axis — the "invitation" composition.
      const cx = W / 2
      const lw = trackedWidth(upper('Billed To'), 7, font, 3)
      tracked(upper('Billed To'), cx - lw / 2, y, 7, font, P.accent, 3)
      let ay = y - 17
      Ct(input.recipient.name || '-', cx, ay, 13, bold, P.strong)
      ay -= 14
      for (const l of toLines) {
        Ct(l, cx, ay, 8.4, font, P.muted)
        ay -= 11
      }
      ay -= 6
      hline(cx - 22, cx + 22, ay, P.accent, 0.5)
      y = ay - 22
    } else if (P.layout === 'lux') {
      // Asymmetric: narrow "FROM" column on the left, wide "BILLED TO" on the right.
      // Structure comes from gold hairlines above each label — no cards, no centring.
      const rows = Math.max(fromLines.length, toLines.length)
      const leftW = CW * 0.38
      const rightX = LX + CW * 0.5
      hline(LX, LX + leftW, y + 12, P.accent, 0.8)
      hline(rightX, RX, y + 12, P.accent, 0.8)
      tracked(upper('From'), LX, y, 7.2, font, P.accent, 1.6)
      tracked(upper('Billed To'), rightX, y, 7.2, font, P.accent, 1.6)
      let ay = y - 16
      T(input.issuer.name || '-', LX, ay, 11.5, bold, P.strong)
      T(input.recipient.name || '-', rightX, ay, 11.5, bold, P.strong)
      ay -= 13
      fromLines.forEach((l, i) => T(l, LX, ay - i * 11, 8.2, font, P.muted))
      toLines.forEach((l, i) => T(l, rightX, ay - i * 11, 8.2, font, P.muted))
      y = ay - rows * 11 - 16
    } else if (P.layout === 'editorial') {
      // Two elegant columns divided by a thin gold rule.
      const rows = Math.max(fromLines.length, toLines.length)
      const h = 18 + rows * 11.5 + 4
      const colMid = LX + CW / 2
      Ct(upper('From'), LX + CW / 4, y, 7.6, bold, P.accent)
      Ct(upper('Billed To'), LX + (3 * CW) / 4, y, 7.6, bold, P.accent)
      let ay = y - 15
      Ct(input.issuer.name || '-', LX + CW / 4, ay, 11, bold, P.strong)
      Ct(input.recipient.name || '-', LX + (3 * CW) / 4, ay, 11, bold, P.strong)
      ay -= 14
      fromLines.forEach((l, i) => Ct(l, LX + CW / 4, ay - i * 11.5, 8.4, font, P.muted))
      toLines.forEach((l, i) => Ct(l, LX + (3 * CW) / 4, ay - i * 11.5, 8.4, font, P.muted))
      hline(colMid, colMid, 0, P.accent) // noop guard
      page.drawLine({ start: { x: colMid, y: y + 4 }, end: { x: colMid, y: ay - rows * 11.5 - 2 }, thickness: 0.6, color: P.accent })
      y = ay - rows * 11.5 - 16
      void h
    } else {
      const gap = 16
      const colW = showFrom ? (CW - gap) / 2 : CW
      const rowsMax = showFrom ? Math.max(fromLines.length, toLines.length) : toLines.length
      const cardH = 12 + 15 + rowsMax * 10.5 + 12
      const glass = P.dark
      const drawParty = (label: string, name: string, lines: string[], x: number, w: number) => {
        rrect(x, y, w, cardH, {
          fill: P.cardFill,
          fillOpacity: glass ? 0.6 : 1,
          border: P.cardLine,
          r: 12,
        })
        T(upper(label), x + 16, y - 17, 7.8, bold, P.accent)
        T(name || '-', x + 16, y - 32, 11.5, bold, P.strong)
        let ly = y - 46
        for (const l of lines) {
          T(l, x + 16, ly, 8.5, font, P.muted)
          ly -= 10.5
        }
      }
      if (showFrom) {
        drawParty('Billed From', input.issuer.name, fromLines, LX, colW)
        drawParty('Billed To', input.recipient.name, toLines, LX + colW + gap, colW)
      } else {
        drawParty('Billed To', input.recipient.name, toLines, LX, colW)
      }
      y -= cardH + 16
    }
  }

  /* ================================================================== */
  /* ITEMS TABLE                                                         */
  /* ================================================================== */
  const padX = 14
  const colAmtR = RX - padX
  const colRateR = RX - padX - 92
  const colQtyC = RX - padX - 182
  const descX = LX + padX
  const descMaxW = colQtyC - 46 - descX
  const zebra = input.theme?.zebra ?? true
  const tableHeaderStyle = input.theme?.tableHeader ?? 'soft'

  const drawTableHeader = () => {
    const hH = 26
    if (P.layout === 'lux') {
      // Gold double rule above, single hairline below — no fill, no rounding.
      hline(LX, RX, y + 6, P.accent, 1.4)
      hline(LX, RX, y + 3, P.accent, 0.4)
      hline(LX, RX, y - hH + 4, P.accent, 0.5)
    } else if (P.layout === 'swiss' || tableHeaderStyle === 'underline') {
      hline(LX, RX, y - hH + 3, P.accent, 1.2)
    } else if (tableHeaderStyle === 'filled') {
      rrect(LX, y, CW, hH, { fill: P.primary, r: 8 })
    } else {
      rrect(LX, y, CW, hH, { fill: P.dark ? P.cardFill : mix(P.cardFill, P.ink, 0.02), fillOpacity: P.dark ? 0.6 : 1, border: P.cardLine, r: 8 })
    }
    const hc =
      P.layout === 'lux'
        ? P.accent
        : tableHeaderStyle === 'filled' && P.layout !== 'swiss'
          ? luminance(P.primary) < 0.55
            ? rgb(1, 1, 1)
            : rgb(0.1, 0.11, 0.16)
          : P.layout === 'swiss'
            ? P.strong
            : P.dark
              ? P.ink
              : P.muted
    const ty = y - 17
    if (P.layout === 'lux') {
      // Letter-spaced gold column labels.
      tracked(upper('Description'), descX - padX, ty, 7.2, font, hc, 1.8)
      const qty = upper('Qty')
      tracked(qty, colQtyC - trackedWidth(qty, 7.2, font, 1.8) / 2, ty, 7.2, font, hc, 1.8)
      const rate = upper('Rate')
      tracked(rate, colRateR - trackedWidth(rate, 7.2, font, 1.8), ty, 7.2, font, hc, 1.8)
      const amt = upper('Amount')
      tracked(amt, colAmtR - trackedWidth(amt, 7.2, font, 1.8), ty, 7.2, font, hc, 1.8)
    } else {
      T(upper('Description'), descX, ty, 8, bold, hc)
      Ct(upper('Qty'), colQtyC, ty, 8, bold, hc)
      Rt(upper('Rate'), colRateR, ty, 8, bold, hc)
      Rt(upper('Amount'), colAmtR, ty, 8, bold, hc)
    }
    y -= hH + 4
  }
  drawTableHeader()

  input.items.forEach((it, idx) => {
    const descLines = wrap(it.description || '-', descMaxW, 9.5)
    const metaBits = [it.sku ? `SKU: ${it.sku}` : '', it.hsn ? `HSN/SAC: ${it.hsn}` : ''].filter(Boolean).join('   ')
    const rowH = Math.max(descLines.length * 12, 14) + (metaBits ? 10 : 0) + 10
    ensure(rowH, true)
    const rowTop = y
    if (zebra && idx % 2 === 1) {
      rrect(LX, rowTop - rowH + 4, CW, rowH, { fill: P.dark ? rgb(1, 1, 1) : P.ink, fillOpacity: P.dark ? 0.04 : 0.038, r: 6 })
    } else if (!zebra && idx > 0) {
      hline(descX, colAmtR, rowTop + 4, P.hair, 0.6)
    }
    let dy = rowTop - 13
    descLines.forEach((dl) => {
      T(dl, descX, dy, 9.6, font, P.ink)
      dy -= 12
    })
    if (metaBits) T(metaBits, descX, dy + 1, 7.4, font, P.faint)
    const midY = rowTop - 13
    Ct(`${it.quantity}${it.unit ? ` ${it.unit}` : ''}`, colQtyC, midY, 9.2, font, P.muted)
    Rt(money(it.rate, input.currency), colRateR, midY, 9.2, font, P.ink)
    Rt(money(it.amount, input.currency), colAmtR, midY, 9.6, bold, P.strong)
    y = rowTop - rowH + 6
  })
  y -= 14

  /* ================================================================== */
  /* TOTALS — a designed panel (per layout)                             */
  /* ================================================================== */
  const danger = P.dark ? rgb(0.98, 0.5, 0.5) : rgb(0.83, 0.2, 0.2)
  type TotalRow = { label: string; value: string; danger?: boolean }
  const rows: TotalRow[] = [{ label: 'Subtotal', value: money(input.subtotal, input.currency) }]
  for (const c of input.chargeLines ?? []) rows.push({ label: c.label, value: `${c.negative ? '-' : ''}${money(c.amount, input.currency)}`, danger: c.negative })
  if (input.taxLines?.length) for (const t of input.taxLines) rows.push({ label: t.label, value: money(t.amount, input.currency) })
  else if (input.taxTotal > 0 || input.taxLabel) rows.push({ label: input.taxLabel ? `Tax (${input.taxLabel})` : 'Tax', value: money(input.taxTotal, input.currency) })
  if (input.roundOffAmount) rows.push({ label: 'Round Off', value: `${input.roundOffAmount < 0 ? '-' : '+'}${money(Math.abs(input.roundOffAmount), input.currency)}` })
  const paid: TotalRow[] = []
  if (input.amountPaid > 0) {
    paid.push({ label: 'Amount Paid', value: money(input.amountPaid, input.currency) })
  }
  const grandLabel = input.amountPaid > 0 ? 'Balance Due' : 'Total Due'
  const grandValue = money(input.amountPaid > 0 ? input.total - input.amountPaid : input.total, input.currency)

  const totalsW = P.layout === 'lux' ? 300 : 272
  // Magazine anchors its money block on the LEFT (asymmetric composition); everyone else right.
  const totalsX = P.layout === 'mag' ? LX : RX - totalsW
  const tLabelX = P.layout === 'lux' ? totalsX : totalsX + 18
  // Card-relative, NOT page-relative: the magazine layout anchors its panel on the left, and a
  // page-relative right edge printed the amounts outside the panel (the grand total rendered
  // white-on-white and vanished). For right-anchored layouts this is identical to RX - 18.
  const tValR = P.layout === 'lux' ? RX : totalsX + totalsW - 18
  const bodyRows = rows.length + paid.length
  const editorial = P.layout === 'editorial'

  if (P.layout === 'swiss') {
    /* SWISS totals: no panel, no fill. A rule, quiet rows, one large monochrome number. */
    const h = 8 + bodyRows * 13.5 + 14 + 30
    ensure(h + 6)
    let ly = y - 8
    for (const r of [...rows, ...paid]) {
      T(r.label, totalsX, ly, 8.6, font, P.muted)
      Rt(r.value, RX, ly, 8.6, font, r.danger ? danger : P.ink)
      ly -= 13.5
    }
    ly -= 6
    hline(totalsX, RX, ly + 7, P.strong, 0.8)
    ly -= 20
    tracked(upper(grandLabel), totalsX, ly + 5, 7, font, P.faint, 1.6)
    Rt(grandValue, RX, ly - 2, 19, bold, P.strong)
    y = ly - 24
  } else if (P.layout === 'ornate') {
    /* ELEGANT totals: centred on the page axis inside a fine rose-gold outline. */
    const boxW = 300
    const boxX = W / 2 - boxW / 2
    const boxH = 16 + bodyRows * 13.5 + 12 + 34
    ensure(boxH + 8)
    rrect(boxX, y, boxW, boxH, { border: P.accent, r: 4 })
    let ly = y - 20
    for (const r of [...rows, ...paid]) {
      T(r.label, boxX + 18, ly, 8.6, font, P.muted)
      Rt(r.value, boxX + boxW - 18, ly, 8.6, font, r.danger ? danger : P.ink)
      ly -= 13.5
    }
    ly -= 4
    hline(boxX + 18, boxX + boxW - 18, ly + 6, P.accent, 0.5)
    ly -= 16
    const gl = upper(grandLabel)
    const glw = trackedWidth(gl, 7.4, font, 2.4)
    tracked(gl, W / 2 - glw / 2, ly + 2, 7.4, font, P.accent, 2.4)
    ly -= 15
    Ct(grandValue, W / 2, ly, 15, bold, P.strong)
    y = y - boxH - 14
  } else if (P.layout === 'lux') {
    /* LUXURY totals: no panel. A gold hairline, quiet rows, then an oversized amount. */
    const luxH = 10 + bodyRows * 14 + 16 + 40
    ensure(luxH + 6)
    let ly = y - 8
    for (const r of [...rows, ...paid]) {
      tracked(upper(r.label), tLabelX, ly, 7.6, font, P.muted, 1.2)
      Rt(r.value, tValR, ly, 9.2, font, r.danger ? danger : P.ink)
      ly -= 14
    }
    ly -= 6
    hline(tLabelX, tValR, ly + 6, P.accent, 1.4)
    hline(tLabelX, tValR, ly + 3.4, P.accent, 0.4)
    ly -= 26
    tracked(upper(grandLabel), tLabelX, ly + 6, 8, font, P.accent, 2.4)
    Rt(grandValue, tValR, ly - 4, 23, bold, P.strong)
    y = ly - 26
  } else if (P.layout === 'fintech') {
    /* DARK: the headline number already sits in the top stat panel, so the foot only carries a
       quiet glass breakdown — no second big accent bar competing with it. */
    const h = 12 + bodyRows * 14 + 26
    ensure(h + 6)
    rrect(totalsX, y, totalsW, h, { fill: P.cardFill, fillOpacity: 0.7, border: P.cardLine, r: 14 })
    let ly = y - 20
    for (const r of [...rows, ...paid]) {
      T(r.label, totalsX + 18, ly, 9.2, font, P.muted)
      Rt(r.value, RX - 18, ly, 9.2, font, r.danger ? danger : P.ink)
      ly -= 14
    }
    hline(totalsX + 18, RX - 18, ly + 6, P.cardLine, 1)
    ly -= 10
    T(upper(grandLabel), totalsX + 18, ly, 9.4, bold, P.strong)
    Rt(grandValue, RX - 18, ly, 11, bold, P.accent)
    y = y - h - 8
  } else {
  const grandBarH = 44
  const totalsH = 12 + bodyRows * 14 + (editorial ? 6 + 28 : 8 + grandBarH)
  ensure(totalsH + 6)
  rrect(totalsX, y, totalsW, totalsH, { fill: P.cardFill, fillOpacity: P.dark ? 0.6 : 1, border: P.cardLine, r: 14 })
  let ty = y - 20
  for (const r of [...rows, ...paid]) {
    T(r.label, tLabelX, ty, 9.4, font, P.muted)
    Rt(r.value, tValR, ty, 9.4, font, r.danger ? danger : P.ink)
    ty -= 14
  }
  const panelBot = y - totalsH
  if (editorial) {
    // Gold rule, then the grand total flowing right after the rows.
    ty -= 2
    hline(tLabelX, tValR, ty + 6, P.accent, 1)
    ty -= 14
    T(upper(grandLabel), tLabelX, ty, 11, bold, P.strong)
    Rt(grandValue, tValR, ty - 1, 15, bold, P.accent)
  } else {
    // Filled accent bar anchored to the panel foot.
    page.drawSvgPath(roundedRectPath(totalsW, grandBarH, 14), { x: totalsX, y: panelBot + grandBarH, color: P.primary })
    page.drawRectangle({ x: totalsX, y: panelBot + grandBarH - 14, width: totalsW, height: 14, color: P.primary })
    const gc = luminance(P.primary) < 0.55 ? rgb(1, 1, 1) : rgb(0.1, 0.11, 0.16)
    T(upper(grandLabel), tLabelX, panelBot + grandBarH / 2 - 3, 10.5, bold, gc)
    Rt(grandValue, tValR, panelBot + grandBarH / 2 - 5, 16, bold, gc)
  }
  y = panelBot - 8
  }

  /* ----- Amount in words ----- */
  if (input.amountInWords) {
    ensure(22)
    for (const ln of wrap(`Amount in words: ${input.amountInWords}`, CW, 8.6)) {
      T(ln, LX, y, 8.6, font, P.muted)
      y -= 11.5
    }
    y -= 6
  }

  /* ----- Payments received (receipt mode) ----- */
  if (input.receiptLines?.length) {
    const h = 20 + input.receiptLines.length * 12 + 12
    ensure(h + 6)
    rrect(LX, y, CW, h, { fill: P.cardFill, fillOpacity: P.dark ? 0.6 : 1, border: P.cardLine, r: 12 })
    T(upper('Payments Received'), LX + 16, y - 18, 7.8, bold, P.accent)
    let ly = y - 32
    for (const l of input.receiptLines) {
      T(l, LX + 16, ly, 8.6, font, P.muted)
      ly -= 12
    }
    y -= h + 14
  }

  /* ================================================================== */
  /* PAYMENT DETAILS card (bank + QR)                                    */
  /* ================================================================== */
  const bankLines = input.bankLines ?? []
  const instr = input.paymentInstructions ? wrap(input.paymentInstructions, CW - 130, 8.4).slice(0, 2) : []
  const qrData = input.qrCodeData?.trim()
  if (bankLines.length || instr.length || qrData) {
    const qs = qrData ? 62 : 0
    const textRight = qrData ? RX - 22 - qs : RX
    const colGap = 20
    const colW = (textRight - (LX + 16) - colGap) / 2
    const half = Math.ceil(bankLines.length / 2)
    const colA = bankLines.slice(0, half)
    const colB = bankLines.slice(half)
    const bankRows = Math.max(colA.length, colB.length)
    // Card must be tall enough for the text column AND the QR + its caption, so the
    // "Scan to pay" label never spills below the card edge.
    const textH = 22 + (bankRows + instr.length) * 12 + 12
    const qrH = qrData ? 16 + qs + 10 + 8 : 0
    const cardH = Math.max(textH, qrH)
    ensure(cardH + 6)
    if (P.layout === 'swiss') {
      // SWISS: a hairline instead of a filled card.
      hline(LX, RX, y + 10, P.strong, 0.8)
    } else {
      rrect(LX, y, CW, cardH, { fill: P.cardFill, fillOpacity: P.dark ? 0.6 : 1, border: P.cardLine, r: 14 })
      // left accent tab
      page.drawSvgPath(roundedRectPath(4, cardH - 24, 2), { x: LX, y: y - 12, color: P.accent })
    }
    T(upper('Payment Details'), LX + 16, y - 19, 7.8, bold, P.accent)
    const bankTop = y - 36
    colA.forEach((l, i) => T(l, LX + 16, bankTop - i * 12, 8.6, font, P.ink))
    colB.forEach((l, i) => T(l, LX + 16 + colW + colGap, bankTop - i * 12, 8.6, font, P.ink))
    let iy = bankTop - bankRows * 12
    for (const l of instr) {
      T(l, LX + 16, iy, 8.4, font, P.muted)
      iy -= 12
    }
    if (qrData) {
      try {
        const png = await QRCode.toBuffer(qrData, { type: 'png', width: 300, margin: 1, errorCorrectionLevel: 'M' })
        // white plate behind QR (so it scans on dark themes)
        const qx = RX - 18 - qs
        if (P.dark) rrect(qx - 5, y - 13, qs + 10, qs + 16, { fill: rgb(1, 1, 1), r: 6 })
        const img = await doc.embedPng(png)
        page.drawImage(img, { x: qx, y: y - 16 - qs, width: qs, height: qs })
        Ct('Scan to pay', qx + qs / 2, y - 16 - qs - 9, 7, font, P.faint)
      } catch {
        /* skip bad QR */
      }
    }
    y -= cardH + 14
  }

  /* ================================================================== */
  /* NOTES / TERMS + compact SIGNATURE                                  */
  /* ================================================================== */
  {
    const noteCol = (label: string, body: string, x: number, w: number, topY: number): number => {
      if (P.layout === 'swiss') {
        // SWISS: hairline + tracked label + text. No card, no fill.
        const lines = wrap(body, w - 6, 8.2).slice(0, 5)
        const h = 18 + lines.length * 10.5 + 6
        hline(x, x + w, topY + 10, P.hair, 0.8)
        tracked(upper(label), x, topY, 6.8, font, P.faint, 1.4)
        let ly = topY - 15
        for (const ln of lines) {
          T(ln, x, ly, 8.2, font, P.ink)
          ly -= 10.5
        }
        return h
      }
      const lines = wrap(body, w - 30, 8.4).slice(0, 5)
      const h = 19 + lines.length * 11 + 11
      rrect(x, topY, w, h, { fill: P.dark ? P.cardFill : mix(P.cardFill, rgb(1, 1, 1), 0.4), fillOpacity: P.dark ? 0.55 : 1, border: P.cardLine, r: 12 })
      T(upper(label), x + 15, topY - 17, 7.6, bold, P.muted)
      let ly = topY - 31
      for (const ln of lines) {
        T(ln, x + 15, ly, 8.4, font, P.ink)
        ly -= 11
      }
      return h
    }
    if (input.notes || input.terms) {
      const both = Boolean(input.notes && input.terms)
      const gap = 16
      const w = both ? (CW - gap) / 2 : CW
      const measure = (b?: string | null) => (b ? wrap(b, w - 30, 8.4).slice(0, 5).length : 0)
      const bandH = 19 + Math.max(measure(input.notes), measure(input.terms), 1) * 11 + 11
      ensure(bandH + 6)
      const top = y
      if (input.notes) noteCol('Notes', input.notes, LX, w, top)
      if (input.terms) noteCol('Terms & Conditions', input.terms, both ? LX + w + gap : LX, w, top)
      y = top - bandH - 12
    }

    const sigLabel = input.signatureLabel?.trim()
    if (sigImg || sigLabel) {
      ensure(42)
      const sigW = 200
      const sigL = RX - sigW
      const top = y
      if (sigImg) {
        const d = sigImg.scaleToFit(sigW - 24, 28)
        page.drawImage(sigImg, { x: sigL + (sigW - d.width) / 2, y: top - 26, width: d.width, height: d.height })
      }
      hline(sigL, RX, top - 30, P.dark ? P.cardLine : mix(P.ink, rgb(1, 1, 1), 0.5), 0.8)
      Ct(sigLabel || 'Authorized Signatory', sigL + sigW / 2, top - 41, 7.8, font, P.muted)
      y = top - 48
    }
  }

  /* ================================================================== */
  /* Footer + page numbers                                              */
  /* ================================================================== */
  const pages = doc.getPages()
  pages.forEach((pg, i) => {
    const fx1 = P.layout === 'sidebar' ? SIDEBAR_W + 26 : M
    pg.drawLine({ start: { x: fx1, y: 38 }, end: { x: W - M, y: 38 }, thickness: 0.8, color: P.hair })
    pg.drawText(ascii(input.issuer.name || 'Bill Maker'), { x: fx1, y: 26, size: 7.4, font, color: P.faint })
    const mid = 'Bill Maker - bill-maker.com'
    pg.drawText(mid, { x: (fx1 + (W - M)) / 2 - font.widthOfTextAtSize(mid, 7.2) / 2, y: 26, size: 7.2, font, color: P.faint })
    const pn = `Page ${i + 1} of ${pages.length}`
    pg.drawText(pn, { x: W - M - font.widthOfTextAtSize(pn, 7.4), y: 26, size: 7.4, font, color: P.faint })
  })

  void LX
  void RX
  return doc.save()
}

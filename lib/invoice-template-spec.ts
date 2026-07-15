import { getTemplate } from '@/lib/invoice-templates'

/**
 * The single source of truth for how each template *looks* — consumed by BOTH the HTML
 * preview (`invoice-preview.tsx`) and the PDF renderer (`server/pdf/invoice-pdf.ts`) so a
 * "Modern" invoice looks the same on screen, in print, and in the downloaded/emailed PDF.
 * No rendering logic is duplicated: the two renderers read the same style parameters.
 */
export type HeaderStyle = 'band' | 'topbar' | 'plain' | 'split' | 'block' | 'minimal'
export type TableHeaderStyle = 'filled' | 'underline' | 'soft'

export interface TemplateStyle {
  serif: boolean
  header: HeaderStyle
  tableHeader: TableHeaderStyle
  zebra: boolean
  uppercaseLabels: boolean
  totalsCard: boolean
  radius: number
}

const BASE: TemplateStyle = {
  serif: false,
  header: 'plain',
  tableHeader: 'soft',
  zebra: true,
  uppercaseLabels: false,
  totalsCard: true,
  radius: 12,
}

const BY_CATEGORY: Record<string, TemplateStyle> = {
  // Clean white header, soft table — the premium default (no big colour band).
  modern: { ...BASE, header: 'plain', tableHeader: 'soft', radius: 12 },
  // Intentionally bold: a dark/accent filled header.
  dark: { ...BASE, header: 'band', tableHeader: 'filled', radius: 14 },
  creative: { ...BASE, header: 'block', tableHeader: 'filled', radius: 16 },
  // Structured corporate: thin accent topbar + soft table.
  corporate: { ...BASE, header: 'topbar', tableHeader: 'soft', radius: 8 },
  // Traditional serif, filled header row.
  classic: { ...BASE, serif: true, header: 'plain', tableHeader: 'filled', radius: 6 },
  // Editorial serif, centred masthead.
  luxury: { ...BASE, serif: true, header: 'split', tableHeader: 'soft', zebra: false, uppercaseLabels: true, radius: 4 },
  elegant: { ...BASE, serif: true, header: 'split', tableHeader: 'underline', zebra: false, uppercaseLabels: true, radius: 10 },
  // Ultra-minimal: tiny title, underline table, no zebra.
  minimal: { ...BASE, header: 'minimal', tableHeader: 'underline', zebra: false, uppercaseLabels: true, radius: 6 },
}

/** Style parameters for a template *category*. */
export function templateStyle(category: string): TemplateStyle {
  return BY_CATEGORY[category] ?? BASE
}

export interface TemplateColors {
  primary: string
  accent: string
  text: string
  background: string
}

const DEFAULT_COLORS: TemplateColors = { primary: '#0f172a', accent: '#2563eb', text: '#1f2937', background: '#ffffff' }

/** Style + colors for a template *id* (falls back gracefully for unknown ids). */
export function templateSpec(templateId: string): {
  style: TemplateStyle
  colors: TemplateColors
  category: string
} {
  const meta = getTemplate(templateId)
  const category = meta?.category ?? templateId
  return {
    style: templateStyle(category),
    colors: meta?.colors ?? DEFAULT_COLORS,
    category,
  }
}

export type NavItem = { id: string; label: string }
export type NavGroup = { title: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  {
    title: 'Foundations',
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'color', label: 'Color' },
      { id: 'typography', label: 'Typography' },
      { id: 'spacing', label: 'Spacing' },
      { id: 'radius', label: 'Radius' },
      { id: 'elevation', label: 'Elevation' },
      { id: 'grid', label: 'Grid' },
      { id: 'iconography', label: 'Iconography' },
    ],
  },
  {
    title: 'Components',
    items: [
      { id: 'buttons', label: 'Buttons' },
      { id: 'forms', label: 'Forms' },
      { id: 'badges', label: 'Badges' },
      { id: 'cards', label: 'Cards' },
      { id: 'table', label: 'Table' },
      { id: 'motion', label: 'Motion' },
    ],
  },
]

export type Swatch = { name: string; token: string; value: string; note?: string }

export const BRAND_SCALE: Swatch[] = [
  { name: 'Brand', token: '--brand', value: 'oklch(0.545 0.152 258)', note: 'Primary action & focus' },
  { name: 'Brand / Foreground', token: '--brand-foreground', value: 'oklch(0.99 0.005 258)' },
  { name: 'Brand / Muted', token: '--brand-muted', value: 'oklch(0.955 0.028 258)', note: 'Tints & surfaces' },
]

export const NEUTRALS: Swatch[] = [
  { name: 'Background', token: '--background', value: 'oklch(0.994 0.001 260)' },
  { name: 'Surface', token: '--card', value: 'oklch(1 0 0)' },
  { name: 'Muted', token: '--muted', value: 'oklch(0.975 0.002 264)' },
  { name: 'Border', token: '--border', value: 'oklch(0.923 0.004 264)' },
  { name: 'Border / Strong', token: '--border-strong', value: 'oklch(0.87 0.006 264)' },
  { name: 'Text / Primary', token: '--foreground', value: 'oklch(0.23 0.012 268)' },
  { name: 'Text / Secondary', token: '--secondary-foreground', value: 'oklch(0.3 0.014 268)' },
  { name: 'Text / Muted', token: '--muted-foreground', value: 'oklch(0.556 0.012 265)' },
]

export const INTENTS: Swatch[] = [
  { name: 'Success', token: '--success', value: 'oklch(0.58 0.12 158)' },
  { name: 'Warning', token: '--warning', value: 'oklch(0.72 0.135 74)' },
  { name: 'Danger', token: '--destructive', value: 'oklch(0.577 0.211 25)' },
  { name: 'Ink', token: '--primary', value: 'oklch(0.26 0.017 268)' },
]

export type TypeSpec = {
  name: string
  className: string
  sample: string
  meta: string
}

export const TYPE_SCALE: TypeSpec[] = [
  { name: 'Display', className: 'text-6xl font-semibold tracking-[-0.03em] leading-[1.02]', sample: 'Build with clarity', meta: '60 / 61 · -3%' },
  { name: 'Hero', className: 'text-5xl font-semibold tracking-[-0.025em] leading-[1.05]', sample: 'Craft, not clutter', meta: '48 / 50 · -2.5%' },
  { name: 'Heading 1', className: 'text-3xl font-semibold tracking-[-0.02em] leading-tight', sample: 'A system that scales', meta: '30 / 36 · -2%' },
  { name: 'Heading 2', className: 'text-2xl font-semibold tracking-[-0.015em] leading-snug', sample: 'Considered defaults', meta: '24 / 30 · -1.5%' },
  { name: 'Heading 3', className: 'text-xl font-semibold tracking-[-0.01em]', sample: 'Every detail matters', meta: '20 / 28' },
  { name: 'Heading 4', className: 'text-lg font-medium', sample: 'Quiet confidence', meta: '18 / 26' },
  { name: 'Body Large', className: 'text-lg leading-relaxed text-muted-foreground', sample: 'Interfaces should feel effortless — the design does the work so people do not have to.', meta: '18 / 29' },
  { name: 'Body', className: 'text-base leading-relaxed text-muted-foreground', sample: 'Readable, calm, and consistent typography builds trust before a single word is read.', meta: '16 / 26' },
  { name: 'Small', className: 'text-sm leading-6 text-muted-foreground', sample: 'Supporting copy and helper text that stays out of the way.', meta: '14 / 24' },
  { name: 'Caption', className: 'text-xs uppercase tracking-[0.14em] text-muted-foreground', sample: 'Labels · metadata · overlines', meta: '12 · +14%' },
]

export type SpaceToken = { name: string; px: number; rem: string }
export const SPACING: SpaceToken[] = [
  { name: '2xs', px: 4, rem: '0.25rem' },
  { name: 'xs', px: 8, rem: '0.5rem' },
  { name: 'sm', px: 12, rem: '0.75rem' },
  { name: 'md', px: 16, rem: '1rem' },
  { name: 'lg', px: 20, rem: '1.25rem' },
  { name: 'xl', px: 24, rem: '1.5rem' },
  { name: '2xl', px: 32, rem: '2rem' },
  { name: '3xl', px: 40, rem: '2.5rem' },
  { name: '4xl', px: 48, rem: '3rem' },
  { name: '5xl', px: 64, rem: '4rem' },
  { name: '6xl', px: 80, rem: '5rem' },
  { name: '7xl', px: 96, rem: '6rem' },
  { name: '8xl', px: 128, rem: '8rem' },
]

export type RadiusToken = { name: string; className: string; value: string }
export const RADII: RadiusToken[] = [
  { name: 'Small', className: 'rounded-sm', value: '6px' },
  { name: 'Medium', className: 'rounded-md', value: '8px' },
  { name: 'Large', className: 'rounded-lg', value: '10px' },
  { name: 'XL', className: 'rounded-xl', value: '14px' },
  { name: '2XL', className: 'rounded-2xl', value: '18px' },
  { name: 'Full', className: 'rounded-full', value: '9999px' },
]

export type ShadowToken = { name: string; className: string; usage: string }
export const SHADOWS: ShadowToken[] = [
  { name: 'XS', className: 'shadow-token-xs', usage: 'Inputs, subtle separation' },
  { name: 'SM', className: 'shadow-token-sm', usage: 'Cards at rest' },
  { name: 'MD', className: 'shadow-token-md', usage: 'Hovered cards, popovers' },
  { name: 'LG', className: 'shadow-token-lg', usage: 'Dropdowns, menus' },
  { name: 'XL', className: 'shadow-token-xl', usage: 'Dialogs, modals' },
]

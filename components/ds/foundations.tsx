'use client'

import {
  ArrowUpRight,
  Bell,
  Bookmark,
  Calendar,
  Check,
  ChevronRight,
  Cloud,
  Command,
  Copy,
  Database,
  FileText,
  Filter,
  Folder,
  Globe,
  Heart,
  Layers,
  Link2,
  Lock,
  Mail,
  Search,
  Settings,
  Star,
  Trash2,
  Users,
  Zap,
} from 'lucide-react'
import {
  BRAND_SCALE,
  INTENTS,
  NEUTRALS,
  RADII,
  SHADOWS,
  SPACING,
  TYPE_SCALE,
} from '@/lib/design-tokens'
import { cn } from '@/lib/utils'
import { CopyToken, Section, Subsection } from './primitives'

/* ----------------------------------- Color ---------------------------------- */

export function ColorSection() {
  return (
    <Section
      id="color"
      eyebrow="Foundations"
      title="Color"
      description="A restrained palette engineered on semantic tokens. Components never reference raw values — they consume roles, so the whole system can be re-themed from one place."
    >
      <Subsection title="Brand">
        <div className="grid gap-4 sm:grid-cols-3">
          {BRAND_SCALE.map((s) => (
            <div
              key={s.token}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-token-xs"
            >
              <div
                className="h-24 w-full"
                style={{ background: `var(${s.token})` }}
                aria-hidden
              />
              <div className="space-y-2 p-4">
                <p className="text-sm font-medium text-foreground">{s.name}</p>
                {s.note && <p className="text-xs text-muted-foreground">{s.note}</p>}
                <CopyToken token={s.token} className="-ml-1.5" />
              </div>
            </div>
          ))}
        </div>
      </Subsection>

      <Subsection title="Neutrals">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-token-xs">
          {NEUTRALS.map((s, i) => (
            <div
              key={s.token}
              className={cn(
                'flex items-center gap-4 px-4 py-3',
                i !== 0 && 'border-t border-border',
              )}
            >
              <span
                className="size-8 shrink-0 rounded-md border border-border-strong/40"
                style={{ background: `var(${s.token})` }}
                aria-hidden
              />
              <span className="w-40 shrink-0 text-sm font-medium text-foreground">
                {s.name}
              </span>
              <CopyToken token={s.token} />
              <span className="ml-auto hidden font-mono text-xs text-muted-foreground sm:block">
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </Subsection>

      <Subsection title="Intent">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INTENTS.map((s) => (
            <div
              key={s.token}
              className="rounded-xl border border-border bg-card p-4 shadow-token-xs"
            >
              <div className="flex items-center gap-3">
                <span
                  className="size-9 rounded-lg"
                  style={{ background: `var(${s.token})` }}
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <CopyToken token={s.token} className="-ml-1.5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span
                  className="rounded-md px-2 py-0.5 text-xs font-medium"
                  style={{
                    background: `var(${s.token})`,
                    color: 'oklch(0.99 0 0)',
                  }}
                >
                  Solid
                </span>
                <span
                  className="rounded-md border px-2 py-0.5 text-xs font-medium"
                  style={{
                    borderColor: `color-mix(in oklch, var(${s.token}) 25%, transparent)`,
                    background: `color-mix(in oklch, var(${s.token}) 10%, transparent)`,
                    color: `var(${s.token})`,
                  }}
                >
                  Subtle
                </span>
              </div>
            </div>
          ))}
        </div>
      </Subsection>
    </Section>
  )
}

/* -------------------------------- Typography -------------------------------- */

export function TypographySection() {
  return (
    <Section
      id="typography"
      eyebrow="Foundations"
      title="Typography"
      description="Geist Sans carries the interface with optical tracking on larger sizes; Geist Mono handles code, tokens, and metadata. Ten roles cover everything from display to caption."
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-token-xs">
        {TYPE_SCALE.map((t, i) => (
          <div
            key={t.name}
            className={cn(
              'flex flex-col gap-3 px-5 py-6 sm:flex-row sm:items-baseline sm:gap-8',
              i !== 0 && 'border-t border-border',
            )}
          >
            <div className="flex w-40 shrink-0 items-center justify-between gap-2 sm:flex-col sm:items-start sm:justify-start">
              <span className="text-sm font-medium text-foreground">{t.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{t.meta}</span>
            </div>
            <p className={cn('min-w-0 flex-1 text-foreground', t.className)}>{t.sample}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Geist Sans
          </p>
          <p className="font-sans text-4xl tracking-[-0.02em] text-foreground">Ag</p>
          <p className="mt-3 font-sans text-sm text-muted-foreground">
            ABCDEFGHIJKLM · abcdefghijklm · 0123456789
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Geist Mono
          </p>
          <p className="font-mono text-4xl text-foreground">Ag</p>
          <p className="mt-3 font-mono text-sm text-muted-foreground">
            ABCDEFGHIJKLM · abcdefghijklm · 0123456789
          </p>
        </div>
      </div>
    </Section>
  )
}

/* --------------------------------- Spacing ---------------------------------- */

export function SpacingSection() {
  return (
    <Section
      id="spacing"
      eyebrow="Foundations"
      title="Spacing"
      description="A geometric scale rooted in a 4px base unit. Consistent spacing is the quiet discipline that makes an interface feel calm and intentional."
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-token-xs">
        {SPACING.map((s, i) => (
          <div
            key={s.name}
            className={cn(
              'flex items-center gap-4 px-5 py-2.5',
              i !== 0 && 'border-t border-border',
            )}
          >
            <span className="w-10 shrink-0 font-mono text-xs font-medium text-foreground">
              {s.name}
            </span>
            <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">
              {s.px}px
            </span>
            <div className="flex min-w-0 flex-1 items-center">
              <span
                className="h-4 rounded-sm bg-brand/80"
                style={{ width: `${s.px}px` }}
                aria-hidden
              />
            </div>
            <span className="hidden font-mono text-xs text-muted-foreground sm:block">
              {s.rem}
            </span>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ---------------------------------- Radius ---------------------------------- */

export function RadiusSection() {
  return (
    <Section
      id="radius"
      eyebrow="Foundations"
      title="Radius"
      description="One rounding language keeps every surface in the same family — from tight controls to generous cards and pills."
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {RADII.map((r) => (
          <div
            key={r.name}
            className="rounded-xl border border-border bg-card p-4 text-center shadow-token-xs"
          >
            <div
              className={cn(
                'mx-auto mb-4 size-16 border-2 border-brand/30 bg-brand-muted',
                r.className,
              )}
              aria-hidden
            />
            <p className="text-sm font-medium text-foreground">{r.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{r.value}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* -------------------------------- Elevation --------------------------------- */

export function ElevationSection() {
  return (
    <Section
      id="elevation"
      eyebrow="Foundations"
      title="Elevation"
      description="Shadows are whisper-soft and layered from a single tinted color. They imply hierarchy without ever shouting — no heavy floating cards."
    >
      <div className="grid grid-cols-1 gap-6 rounded-xl border border-border bg-muted/40 p-8 sm:grid-cols-3 lg:grid-cols-5">
        {SHADOWS.map((s) => (
          <div key={s.name} className="text-center">
            <div
              className={cn(
                'mx-auto mb-4 flex size-20 items-center justify-center rounded-xl border border-border bg-card font-mono text-sm text-muted-foreground',
                s.className,
              )}
            >
              {s.name}
            </div>
            <p className="text-xs text-muted-foreground">{s.usage}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ----------------------------------- Grid ----------------------------------- */

export function GridSection() {
  return (
    <Section
      id="grid"
      eyebrow="Foundations"
      title="Grid & Layout"
      description="A responsive 12-column grid with consistent gutters and margins. Content breathes with generous, predictable rhythm at every breakpoint."
    >
      <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
        <div className="grid grid-cols-12 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex h-16 items-center justify-center rounded-md bg-brand-muted font-mono text-xs text-brand"
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-12 gap-3">
          <div className="col-span-12 flex h-12 items-center justify-center rounded-md border border-border bg-muted font-mono text-xs text-muted-foreground sm:col-span-6">
            span 6
          </div>
          <div className="col-span-12 flex h-12 items-center justify-center rounded-md border border-border bg-muted font-mono text-xs text-muted-foreground sm:col-span-3">
            3
          </div>
          <div className="col-span-12 flex h-12 items-center justify-center rounded-md border border-border bg-muted font-mono text-xs text-muted-foreground sm:col-span-3">
            3
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Desktop', size: '≥ 1024px', cols: '12 columns · 32px gutter' },
          { label: 'Tablet', size: '640–1023px', cols: '8 columns · 24px gutter' },
          { label: 'Mobile', size: '< 640px', cols: '4 columns · 16px gutter' },
        ].map((b) => (
          <div key={b.label} className="rounded-xl border border-border bg-card p-4 shadow-token-xs">
            <p className="text-sm font-medium text-foreground">{b.label}</p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{b.size}</p>
            <p className="mt-2 text-sm text-muted-foreground">{b.cols}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------- Iconography -------------------------------- */

const ICONS = [
  Search, Bell, Settings, Users, Mail, Calendar, FileText, Folder,
  Globe, Lock, Database, Cloud, Star, Heart, Bookmark, Link2,
  Filter, Trash2, Command, Zap, Layers, Check, ChevronRight, ArrowUpRight,
]

export function IconographySection() {
  return (
    <Section
      id="iconography"
      eyebrow="Foundations"
      title="Iconography"
      description="A single outline set with a consistent 1.75px stroke and 24px canvas. Minimal, legible, and neutral — icons support meaning, never decorate."
    >
      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-token-xs sm:grid-cols-6 lg:grid-cols-8">
        {ICONS.map((Icon, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center bg-card text-foreground transition-colors hover:bg-muted hover:text-brand"
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Copy className="size-4" />
        Sizes: 16px · 20px · 24px — always aligned to the text baseline.
      </p>
    </Section>
  )
}

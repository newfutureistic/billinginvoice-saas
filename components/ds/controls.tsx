'use client'

import {
  ArrowRight,
  Check,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react'
import { useId, useState } from 'react'
import { cn } from '@/lib/utils'
import { Section, Subsection } from './primitives'

/* --------------------------------- Buttons ---------------------------------- */

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-foreground shadow-token-xs hover:bg-primary/90',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-accent',
  outline:
    'border border-border bg-card text-foreground shadow-token-xs hover:bg-muted',
  ghost: 'text-foreground hover:bg-muted',
  danger:
    'bg-destructive text-destructive-foreground shadow-token-xs hover:bg-destructive/90',
  success:
    'bg-success text-success-foreground shadow-token-xs hover:bg-success/90',
}

function Btn({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
    md: 'h-9 px-4 text-sm gap-2 rounded-lg',
    lg: 'h-11 px-6 text-base gap-2 rounded-lg',
  }
  return (
    <button
      className={cn(
        'inline-flex select-none items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4',
        sizes[size],
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function LoadingButton() {
  const [loading, setLoading] = useState(false)
  return (
    <Btn
      variant="primary"
      onClick={() => {
        setLoading(true)
        setTimeout(() => setLoading(false), 1600)
      }}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" /> Saving
        </>
      ) : (
        <>
          <Check /> Save changes
        </>
      )}
    </Btn>
  )
}

export function ButtonsSection() {
  return (
    <Section
      id="buttons"
      eyebrow="Components"
      title="Buttons"
      description="A confident action system. Weight communicates hierarchy — one primary action per view, supported by quieter secondary, outline, and ghost styles."
    >
      <Subsection title="Variants">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <Btn variant="primary">Primary</Btn>
          <Btn variant="secondary">Secondary</Btn>
          <Btn variant="outline">Outline</Btn>
          <Btn variant="ghost">Ghost</Btn>
          <Btn variant="success">
            <Check /> Success
          </Btn>
          <Btn variant="danger">
            <Trash2 /> Danger
          </Btn>
        </div>
      </Subsection>

      <Subsection title="Sizes & icons">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <Btn size="sm" variant="outline">
            Small
          </Btn>
          <Btn size="md" variant="outline">
            Medium
          </Btn>
          <Btn size="lg" variant="outline">
            Large
          </Btn>
          <Btn variant="primary">
            <Plus /> With icon
          </Btn>
          <Btn variant="primary">
            Continue <ArrowRight />
          </Btn>
          <Btn variant="outline" size="md" className="w-9 px-0" aria-label="Add">
            <Plus />
          </Btn>
        </div>
      </Subsection>

      <Subsection title="States">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <Btn variant="primary">Default</Btn>
          <LoadingButton />
          <Btn variant="primary" disabled>
            Disabled
          </Btn>
          <Btn variant="primary" size="lg" className="ml-auto">
            <Sparkles /> Large CTA
          </Btn>
        </div>
      </Subsection>
    </Section>
  )
}

/* ---------------------------------- Forms ----------------------------------- */

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}

const inputCls =
  'h-9 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground shadow-token-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-brand/50 focus:ring-2 focus:ring-ring/25'

function Switch() {
  const [on, setOn] = useState(true)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className={cn(
        'inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        on ? 'bg-brand' : 'bg-border-strong',
      )}
    >
      <span
        className={cn(
          'size-5 rounded-full bg-card shadow-token-sm transition-transform',
          on && 'translate-x-4',
        )}
      />
    </button>
  )
}

function Checkbox({ defaultChecked }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(!!defaultChecked)
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => setChecked((v) => !v)}
      className={cn(
        'flex size-5 items-center justify-center rounded-[6px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        checked ? 'border-brand bg-brand text-brand-foreground' : 'border-border-strong bg-card',
      )}
    >
      {checked && <Check className="size-3.5" strokeWidth={3} />}
    </button>
  )
}

function Radio({ value, current, onSelect }: { value: string; current: string; onSelect: (v: string) => void }) {
  const active = value === current
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={() => onSelect(value)}
      className={cn(
        'flex size-5 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        active ? 'border-brand' : 'border-border-strong',
      )}
    >
      {active && <span className="size-2.5 rounded-full bg-brand" />}
    </button>
  )
}

function OtpInput() {
  const [values, setValues] = useState(['', '', '', ''])
  const id = useId()
  return (
    <div className="flex gap-2">
      {values.map((v, i) => (
        <input
          key={i}
          id={`${id}-${i}`}
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={(e) => {
            const next = [...values]
            next[i] = e.target.value.replace(/\D/g, '').slice(-1)
            setValues(next)
            if (next[i] && i < 3) document.getElementById(`${id}-${i + 1}`)?.focus()
          }}
          className="size-11 rounded-lg border border-border bg-card text-center text-lg font-medium text-foreground shadow-token-xs outline-none transition-colors focus:border-brand/50 focus:ring-2 focus:ring-ring/25"
        />
      ))}
    </div>
  )
}

export function FormsSection() {
  const [radio, setRadio] = useState('monthly')
  return (
    <Section
      id="forms"
      eyebrow="Components"
      title="Forms"
      description="Inputs are calm and generous, with soft focus rings and clear labels. Controls share one rounded, low-shadow language so complex forms stay quiet."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <Field label="Full name" hint="As it appears on your account.">
            <input className={inputCls} placeholder="Ada Lovelace" />
          </Field>
          <Field label="Search">
            <span className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
              <input className={cn(inputCls, 'pl-9')} placeholder="Search projects" />
            </span>
          </Field>
          <Field label="Workspace">
            <select className={cn(inputCls, 'appearance-none pr-8')} defaultValue="acme">
              <option value="acme">Acme Inc.</option>
              <option value="forge">ToolForge Labs</option>
              <option value="northwind">Northwind Co.</option>
            </select>
          </Field>
          <Field label="Notes">
            <textarea
              rows={3}
              className={cn(inputCls, 'h-auto resize-none py-2')}
              placeholder="Add context for your team…"
            />
          </Field>
        </div>

        <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Email notifications</p>
              <p className="text-xs text-muted-foreground">Weekly summary of activity.</p>
            </div>
            <Switch />
          </div>
          <div className="h-px bg-border" />
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Include in export</p>
            <label className="flex items-center gap-3 text-sm text-muted-foreground">
              <Checkbox defaultChecked /> Analytics
            </label>
            <label className="flex items-center gap-3 text-sm text-muted-foreground">
              <Checkbox defaultChecked /> Team members
            </label>
            <label className="flex items-center gap-3 text-sm text-muted-foreground">
              <Checkbox /> Archived items
            </label>
          </div>
          <div className="h-px bg-border" />
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Billing cycle</p>
            {[
              { v: 'monthly', l: 'Monthly' },
              { v: 'annual', l: 'Annual — save 20%' },
            ].map((o) => (
              <label key={o.v} className="flex items-center gap-3 text-sm text-muted-foreground">
                <Radio value={o.v} current={radio} onSelect={setRadio} /> {o.l}
              </label>
            ))}
          </div>
          <div className="h-px bg-border" />
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Verification code</p>
            <OtpInput />
          </div>
          <div className="h-px bg-border" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Upload</p>
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-muted/40 px-4 py-6 text-center">
              <Upload className="size-5 text-muted-foreground" />
              <p className="text-sm text-foreground">
                Drop files or <span className="text-brand">browse</span>
              </p>
              <p className="text-xs text-muted-foreground">PNG, PDF up to 10MB</p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* --------------------------------- Badges ----------------------------------- */

const BADGES = [
  { label: 'New', cls: 'border-brand/20 bg-brand-muted text-brand' },
  { label: 'Popular', cls: 'border-warning/25 bg-warning-muted text-[oklch(0.48_0.11_66)]' },
  { label: 'Free', cls: 'border-success/25 bg-success-muted text-[oklch(0.45_0.1_160)]' },
  { label: 'Premium', cls: 'border-border bg-primary text-primary-foreground' },
  { label: 'Beta', cls: 'border-border bg-muted text-muted-foreground' },
  { label: 'Coming soon', cls: 'border-border bg-card text-muted-foreground' },
]

export function BadgesSection() {
  return (
    <Section
      id="badges"
      eyebrow="Components"
      title="Badges"
      description="Compact status markers with tuned tints. Each maps to a semantic role so meaning stays consistent wherever a badge appears."
    >
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-token-xs">
        {BADGES.map((b) => (
          <span
            key={b.label}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
              b.cls,
            )}
          >
            {b.label === 'New' && <span className="size-1.5 rounded-full bg-current" />}
            {b.label}
          </span>
        ))}
      </div>
    </Section>
  )
}

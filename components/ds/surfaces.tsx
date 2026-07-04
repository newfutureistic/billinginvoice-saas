'use client'

import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  Search,
  TrendingUp,
  Wrench,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Section, Subsection } from './primitives'

/* ---------------------------------- Cards ----------------------------------- */

export function CardsSection() {
  return (
    <Section
      id="cards"
      eyebrow="Components"
      title="Cards"
      description="Surfaces share one recipe — thin border, soft radius, whisper shadow — then specialise by content. Consistency here is what makes dashboards feel unified."
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Feature card */}
        <div className="group rounded-xl border border-border bg-card p-6 shadow-token-xs transition-all hover:-translate-y-0.5 hover:shadow-token-md">
          <span className="inline-flex size-11 items-center justify-center rounded-lg bg-brand-muted text-brand">
            <Zap className="size-5" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 text-base font-semibold text-foreground">Automations</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Chain tools into reliable, repeatable workflows without writing glue code.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
            Learn more <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>

        {/* Stat card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-token-xs">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Active workflows</p>
            <BarChart3 className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-3 font-mono text-4xl font-semibold tracking-tight text-foreground">
            2,481
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-success">
            <TrendingUp className="size-4" /> +12.4%
            <span className="font-normal text-muted-foreground">vs last month</span>
          </p>
        </div>

        {/* Pricing card */}
        <div className="rounded-xl border-2 border-primary bg-card p-6 shadow-token-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Team</p>
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
              Popular
            </span>
          </div>
          <p className="mt-3">
            <span className="font-mono text-4xl font-semibold tracking-tight text-foreground">$29</span>
            <span className="text-sm text-muted-foreground">/mo</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {['Unlimited tools', 'Priority support', 'Advanced analytics'].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="size-4 text-success" /> {f}
              </li>
            ))}
          </ul>
          <button className="mt-5 h-9 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-px active:translate-y-0">
            Choose Team
          </button>
        </div>

        {/* Tool card */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-token-xs transition-colors hover:bg-muted/40">
          <span className="inline-flex size-12 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
            <Wrench className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">PDF Toolkit</p>
            <p className="truncate text-sm text-muted-foreground">Merge, split & compress</p>
          </div>
          <span className="ml-auto rounded-full border border-success/25 bg-success-muted px-2 py-0.5 text-xs font-medium text-[oklch(0.45_0.1_160)]">
            Free
          </span>
        </div>

        {/* Blog card */}
        <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-token-xs transition-all hover:-translate-y-0.5 hover:shadow-token-md md:col-span-2 lg:col-span-2">
          <div className="flex flex-col sm:flex-row">
            <div
              className="h-32 w-full shrink-0 bg-brand-muted sm:h-auto sm:w-40"
              aria-hidden
            />
            <div className="p-5">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Engineering · 6 min
              </p>
              <h3 className="mt-2 text-base font-semibold text-foreground">
                Designing tokens that scale across a product suite
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                How a single source of truth keeps dozens of surfaces perfectly in sync.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ---------------------------------- Table ----------------------------------- */

type Row = { name: string; owner: string; status: 'Active' | 'Paused' | 'Draft'; runs: number }

const DATA: Row[] = [
  { name: 'Invoice sync', owner: 'Ada L.', status: 'Active', runs: 1284 },
  { name: 'Lead enrichment', owner: 'Grace H.', status: 'Active', runs: 942 },
  { name: 'Weekly digest', owner: 'Alan T.', status: 'Paused', runs: 318 },
  { name: 'Slack alerts', owner: 'Katherine J.', status: 'Active', runs: 2765 },
  { name: 'CSV importer', owner: 'Edsger D.', status: 'Draft', runs: 12 },
  { name: 'Backup runner', owner: 'Linus T.', status: 'Paused', runs: 561 },
]

const STATUS_CLS: Record<Row['status'], string> = {
  Active: 'border-success/25 bg-success-muted text-[oklch(0.45_0.1_160)]',
  Paused: 'border-warning/25 bg-warning-muted text-[oklch(0.48_0.11_66)]',
  Draft: 'border-border bg-muted text-muted-foreground',
}

export function TableSection() {
  const [query, setQuery] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const rows = useMemo(() => {
    return DATA.filter(
      (r) =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.owner.toLowerCase().includes(query.toLowerCase()),
    ).sort((a, b) => (sortDir === 'asc' ? a.runs - b.runs : b.runs - a.runs))
  }, [query, sortDir])

  return (
    <Section
      id="table"
      eyebrow="Components"
      title="Table"
      description="A dense but breathable data table with search, sorting, sticky header and pagination — the workhorse of any enterprise product, kept legible and quiet."
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-token-xs">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative flex max-w-xs flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search workflows"
              className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand/50 focus:ring-2 focus:ring-ring/25"
            />
          </label>
          <span className="font-mono text-xs text-muted-foreground">
            {rows.length} of {DATA.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Workflow</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">
                  <button
                    onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                  >
                    Runs
                    {sortDir === 'asc' ? (
                      <ArrowUp className="size-3.5" />
                    ) : (
                      <ArrowDown className="size-3.5" />
                    )}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.name}
                  className={cn(
                    'transition-colors hover:bg-muted/50',
                    i !== 0 && 'border-t border-border',
                  )}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.owner}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                        STATUS_CLS[r.status],
                      )}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">
                    {r.runs.toLocaleString()}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    No workflows match “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border p-4">
          <span className="text-xs text-muted-foreground">Page 1 of 1</span>
          <div className="flex gap-2">
            <button
              disabled
              className="h-8 rounded-md border border-border bg-card px-3 text-xs font-medium text-muted-foreground disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled
              className="h-8 rounded-md border border-border bg-card px-3 text-xs font-medium text-muted-foreground disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ---------------------------------- Motion ---------------------------------- */

function Accordion() {
  const items = [
    { q: 'How are tokens themed?', a: 'Every component reads from CSS custom properties, so a single change re-themes the whole system.' },
    { q: 'Is motion configurable?', a: 'Yes — durations and easings live as tokens and respect reduced-motion preferences.' },
    { q: 'Which framework is this?', a: 'React with Tailwind CSS v4, but the token layer is framework agnostic.' },
  ]
  const [open, setOpen] = useState(0)
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-token-xs">
      {items.map((it, i) => (
        <div key={it.q} className={cn(i !== 0 && 'border-t border-border')}>
          <button
            onClick={() => setOpen((o) => (o === i ? -1 : i))}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
            aria-expanded={open === i}
          >
            {it.q}
            <ChevronDown
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform duration-300',
                open === i && 'rotate-180',
              )}
            />
          </button>
          <div
            className={cn(
              'grid transition-all duration-300 ease-out',
              open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
            )}
          >
            <div className="overflow-hidden">
              <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{it.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const EASINGS = [
  { name: 'Hover lift', body: '−2px translate + shadow', cls: 'hover:-translate-y-1 hover:shadow-token-md' },
  { name: 'Press', body: 'active scale 0.97', cls: 'active:scale-95' },
  { name: 'Elevate', body: 'shadow xs → lg', cls: 'hover:shadow-token-lg' },
]

export function MotionSection() {
  return (
    <Section
      id="motion"
      eyebrow="Components"
      title="Motion"
      description="Motion is quick, purposeful and consistent — 150–300ms with a soft ease-out. It reveals hierarchy and state, and always yields to reduced-motion."
    >
      <Subsection title="Interactions — hover & press">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {EASINGS.map((e) => (
            <button
              key={e.name}
              className={cn(
                'flex flex-col items-start rounded-xl border border-border bg-card p-6 text-left shadow-token-xs transition-all duration-200',
                e.cls,
              )}
            >
              <span className="text-sm font-medium text-foreground">{e.name}</span>
              <span className="mt-1 font-mono text-xs text-muted-foreground">{e.body}</span>
            </button>
          ))}
        </div>
      </Subsection>

      <Subsection title="Accordion">
        <Accordion />
      </Subsection>

      <Subsection title="Loading & skeleton">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-6 shadow-token-xs">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-muted">
              <Zap className="size-4 animate-pulse text-brand" />
            </span>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-token-xs">
            <span className="size-4 animate-spin rounded-full border-2 border-border border-t-brand" />
            Processing your request…
          </div>
        </div>
      </Subsection>
    </Section>
  )
}

'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="scroll-mt-24 border-t border-border py-16 first:border-t-0 first:pt-4 lg:py-24"
    >
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-brand">
          {eyebrow}
        </p>
        <h2
          id={`${id}-title`}
          className="text-pretty text-3xl font-semibold tracking-[-0.02em] text-foreground lg:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground lg:text-lg">
          {description}
        </p>
      </div>
      {children}
    </section>
  )
}

export function Subsection({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-12 last:mb-0', className)}>
      <h3 className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        <span>{title}</span>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </h3>
      {children}
    </div>
  )
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card shadow-token-xs',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CopyToken({ token, className }: { token: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'group inline-flex items-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        className,
      )}
      aria-label={`Copy token ${token}`}
    >
      <span>{token}</span>
      {copied ? (
        <Check className="size-3 text-success" />
      ) : (
        <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  )
}

'use client'

import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'

export function Newsletter({
  title = 'The paperwork newsletter',
  description = 'Practical tips on invoicing, taxes, and running a tidy business — twice a month, no fluff.',
}: {
  title?: string
  description?: string
}) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-3xl border border-border bg-card px-8 py-12 shadow-token-sm lg:px-14 lg:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 className="text-balance text-2xl font-semibold tracking-[-0.02em] text-foreground lg:text-3xl">
              {title}
            </h2>
            <p className="mt-3 max-w-md text-pretty leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          {submitted ? (
            <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success-muted px-5 py-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
                <Check className="size-4" strokeWidth={3} />
              </span>
              <p className="text-sm font-medium text-foreground">
                You&apos;re subscribed. Watch your inbox for the next issue.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-12 flex-1 rounded-xl border border-input bg-background px-4 text-sm text-foreground shadow-token-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              <button
                type="submit"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90"
              >
                Subscribe
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

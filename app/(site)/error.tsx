'use client'

import Link from 'next/link'
import { RefreshCw, Home } from 'lucide-react'

/**
 * Friendly error boundary for the public site (Phase 3 hardening). If a server component in the
 * `(site)` group throws — e.g. the blog page when the database is momentarily unreachable — the
 * visitor sees this calm page with a retry, never a stack trace or raw code.
 */
export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
        Something went wrong on our end
      </h1>
      <p className="mx-auto mt-4 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
        This page couldn’t load just now — usually a brief hiccup. Please try again in a moment.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90"
        >
          <RefreshCw className="size-4" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Home className="size-4" />
          Go home
        </Link>
      </div>
    </main>
  )
}

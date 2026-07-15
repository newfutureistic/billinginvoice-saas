'use client'

import { Menu, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NAV } from '@/lib/design-tokens'
import { cn } from '@/lib/utils'

function ForgeMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7h16M4 12h10M4 17h7" />
        <path d="M17 14l3 3-3 3" />
      </svg>
    </span>
  )
}

function NavList({
  active,
  onNavigate,
}: {
  active: string
  onNavigate?: () => void
}) {
  return (
    <nav className="flex flex-col gap-7" aria-label="Design system sections">
      {NAV.map((group) => (
        <div key={group.title}>
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {group.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = active === item.id
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={onNavigate}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'relative flex items-center rounded-md px-3 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'bg-accent font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand" aria-hidden />
                    )}
                    {item.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export function Shell({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const ids = NAV.flatMap((g) => g.items.map((i) => i.id))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <ForgeMark />
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-foreground">Bill Maker</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Design System
              </p>
            </div>
          </div>

          <div className="mx-auto hidden w-full max-w-sm md:block">
            <label className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-token-xs transition-colors focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-ring/25">
              <Search className="size-4" />
              <input
                type="search"
                placeholder="Search components & tokens"
                className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
                ⌘K
              </kbd>
            </label>
          </div>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <span className="rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
              v1.0
            </span>
            <a
              href="#overview"
              className="rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-px active:translate-y-0"
            >
              Get started
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="ml-auto inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-foreground md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1440px] px-4 sm:px-6 lg:px-8">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 overflow-y-auto py-10 pr-6 lg:block">
          <NavList active={active} />
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 lg:border-l lg:border-border lg:pl-10 xl:pl-16">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
          />
          <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto border-r border-border bg-background p-6 shadow-token-xl">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ForgeMark />
                <p className="text-sm font-semibold text-foreground">Bill Maker</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-foreground"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
            </div>
            <NavList active={active} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

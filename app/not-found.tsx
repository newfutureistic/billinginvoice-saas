import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, FileText, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-20 text-center">
      <Image
        src="/404.png"
        alt=""
        aria-hidden
        width={2000}
        height={2000}
        priority
        sizes="(max-width: 640px) 220px, 300px"
        className="h-52 w-52 object-contain sm:h-72 sm:w-72"
      />
      <p className="mt-2 font-mono text-sm font-medium uppercase tracking-[0.18em] text-brand">404</p>
      <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.025em] text-foreground sm:text-5xl">
        This page could not be found
      </h1>
      <p className="mx-auto mt-4 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
        The link may be broken or the page may have moved. Let’s get you back on track — you can
        create an invoice or head home.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/invoice/new"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90"
        >
          <FileText className="size-4" />
          Create an invoice
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Home className="size-4" />
          Go home
        </Link>
      </div>

      <nav aria-label="Helpful links" className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        {[
          { label: 'Templates', href: '/templates' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'FAQ', href: '/faq' },
          { label: 'Invoice Guide', href: '/invoice-guide' },
          { label: 'Contact', href: '/contact' },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="text-muted-foreground transition-colors hover:text-brand">
            {l.label}
          </Link>
        ))}
      </nav>
    </main>
  )
}

import { Zap } from 'lucide-react'

const columns: { title: string; links: string[] }[] = [
  {
    title: 'Product',
    links: ['Invoice Generator', 'Quotes & Estimates', 'Expense Tracker', 'All tools', 'Templates'],
  },
  {
    title: 'Company',
    links: ['About', 'Customers', 'Careers', 'Blog', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Help center', 'Guides', 'Tax reference', 'API docs', 'Status'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Security', 'GDPR', 'Cookies'],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <a href="#top" className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="size-4" fill="currentColor" strokeWidth={0} />
              </span>
              <span className="text-[0.95rem] font-semibold tracking-[-0.01em] text-foreground">
                ToolForge
              </span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The operating system for your business paperwork. Invoices, quotes, contracts and 40+
              tools in one calm workspace.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ToolForge, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex size-2 items-center justify-center">
              <span className="size-2 rounded-full bg-success" />
            </span>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}

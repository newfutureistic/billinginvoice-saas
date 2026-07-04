import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-28 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <FileQuestion className="size-7" strokeWidth={1.75} />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-foreground">
        Tool not found
      </h1>
      <p className="mt-3 max-w-sm text-pretty leading-relaxed text-muted-foreground">
        We couldn&apos;t find the tool you&apos;re looking for. It may have been renamed or moved.
      </p>
      <Link
        href="/tools"
        className="mt-7 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90"
      >
        Browse all tools
      </Link>
    </div>
  )
}

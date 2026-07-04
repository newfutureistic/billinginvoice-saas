export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-6 h-10 w-2/3 animate-pulse rounded-lg bg-muted" />
      <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-muted" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-6 shadow-token-xs"
          >
            <div className="size-11 animate-pulse rounded-xl bg-muted" />
            <div className="mt-5 h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-muted" />
            <div className="mt-6 h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

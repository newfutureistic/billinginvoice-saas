/**
 * Renders a JSON-LD structured-data block. Server Component — the script is part of the
 * server-rendered HTML so crawlers see it without executing JS. `data` comes from the typed
 * builders in `lib/seo.ts`.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is trusted, server-controlled content (no user input).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

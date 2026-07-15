'use client'

import { useState } from 'react'
import { AlertCircle, Loader2, ZoomIn, ZoomOut } from 'lucide-react'
import type { InvoiceData, PreviewMode } from '@/lib/invoice-types'
import { usePdfPreview } from '@/lib/hooks/use-pdf-preview'

/**
 * Invoice preview — renders the REAL PDF.
 *
 * This pane used to be a second, hand-written HTML renderer. It drifted badly from the export:
 * a "Classic" invoice previewed blue-and-modern while the downloaded PDF was navy-and-gold,
 * because the two renderers didn't even share layout names (the PDF has editorial/lux/ornate/
 * hero/sidebar/swiss/fintech/mag; the HTML had band/topbar/plain/split/block/minimal).
 *
 * Displaying the actual PDF makes "preview" and "export" the same artifact, so they can never
 * diverge again — there is only one renderer.
 */

/** A4 is 595.28 × 841.89pt; keep the paper's true aspect at any preview width. */
const A4_RATIO = 841.89 / 595.28

export function InvoicePreview({
  invoice,
  mode = 'desktop',
}: {
  invoice: InvoiceData
  mode?: PreviewMode
}) {
  const [zoom, setZoom] = useState(100)
  const { url, status } = usePdfPreview(invoice)

  const width = mode === 'mobile' ? 380 : mode === 'tablet' ? 680 : 880
  const scale = zoom / 100

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Zoom Controls */}
      <div className="flex items-center justify-between border-b border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {mode.charAt(0).toUpperCase() + mode.slice(1)} Preview
          </span>
          {status === 'loading' && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground" role="status">
              <Loader2 className="h-3 w-3 animate-spin" />
              Rendering…
            </span>
          )}
          {status === 'stale' && (
            <span
              className="flex items-center gap-1 text-xs text-warning"
              role="status"
              title="The latest edit could not be rendered, so the last valid version is shown."
            >
              <AlertCircle className="h-3 w-3" />
              Showing last valid version
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(40, zoom - 10))}
            className="rounded p-2 transition-colors hover:bg-secondary"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium tabular-nums">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="rounded p-2 transition-colors hover:bg-secondary"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex flex-1 min-h-0 items-start justify-center overflow-auto bg-secondary/40 p-4 sm:p-6">
        <div style={{ width, maxWidth: '100%', zoom: scale } as React.CSSProperties}>
          {url ? (
            <iframe
              // `toolbar=0` hides the built-in PDF chrome so the pane shows only the document.
              src={`${url}#toolbar=0&navpanes=0&view=FitH`}
              title="Invoice PDF preview"
              className="rounded-xl border border-border bg-white shadow-lg"
              style={{ width: '100%', height: width * A4_RATIO, display: 'block' }}
            />
          ) : status === 'error' ? (
            <div
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card p-10 text-center"
              style={{ height: width * A4_RATIO }}
              role="status"
            >
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Preview unavailable</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Complete the required invoice details and the preview will appear here.
              </p>
            </div>
          ) : (
            <div
              className="flex items-center justify-center rounded-xl border border-border bg-card"
              style={{ height: width * A4_RATIO }}
              role="status"
              aria-label="Rendering preview"
            >
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

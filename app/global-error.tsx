'use client'

/**
 * Last-resort error boundary (Phase — reliability hardening). Next renders this only when the
 * ROOT layout itself throws, so it must supply its own <html>/<body>. It uses inline styles
 * (the app's CSS may not have loaded) and never shows a stack trace — production hides those
 * anyway; this guarantees a calm, on-brand page in every case. A retry re-renders the segment.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          background: '#ffffff',
          color: '#0f172a',
        }}
      >
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, margin: 0 }}>Something went wrong</h1>
        <p style={{ maxWidth: '28rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
          We hit an unexpected problem loading this page. Please try again in a moment.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '0.5rem',
            height: '2.75rem',
            padding: '0 1.5rem',
            borderRadius: '0.75rem',
            border: 'none',
            background: '#4f46e5',
            color: '#ffffff',
            fontSize: '0.95rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  )
}

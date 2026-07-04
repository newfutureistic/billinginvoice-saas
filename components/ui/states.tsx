'use client'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:bg-brand/90"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export function ErrorState({
  icon,
  title,
  description,
  action,
}: {
  icon: string
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
      <div className="flex gap-4">
        <div className="text-2xl">{icon}</div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-3 text-sm font-medium text-destructive hover:underline"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-secondary animate-pulse" />
      ))}
    </div>
  )
}

export function SuccessState({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-success/30 bg-success/5 p-6 text-center">
      <div className="mb-3 flex justify-center text-3xl">{icon}</div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function Toast({
  type = 'info',
  title,
  description,
  onClose,
}: {
  type?: 'info' | 'success' | 'error' | 'warning'
  title: string
  description?: string
  onClose?: () => void
}) {
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-success/10 border-success/30 text-success',
    error: 'bg-destructive/10 border-destructive/30 text-destructive',
    warning: 'bg-warning/10 border-warning/30 text-warning',
  }

  const icons = { info: 'ℹ️', success: '✓', error: '✕', warning: '⚠️' }

  return (
    <div className={`rounded-lg border p-4 flex items-start gap-3 ${colors[type]}`}>
      <span className="text-lg">{icons[type]}</span>
      <div className="flex-1">
        <h4 className="font-semibold">{title}</h4>
        {description && <p className="text-sm mt-1">{description}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-lg opacity-60 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  )
}

export function Dialog({
  open,
  title,
  description,
  children,
  onClose,
  confirmText,
  cancelText,
  onConfirm,
  isDangerous,
}: {
  open: boolean
  title: string
  description?: string
  children?: React.ReactNode
  onClose: () => void
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  isDangerous?: boolean
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            {cancelText || 'Cancel'}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                isDangerous
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'bg-brand text-brand-foreground hover:bg-brand/90'
              }`}
            >
              {confirmText || 'Confirm'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

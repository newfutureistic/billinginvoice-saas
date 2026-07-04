'use client'

import Link from 'next/link'

export function OnboardingStep({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextText = 'Next',
  backText = 'Back',
}: {
  step: number
  totalSteps: number
  title: string
  subtitle?: string
  children: React.ReactNode
  onNext?: () => void
  onBack?: () => void
  nextText?: string
  backText?: string
}) {
  const progress = (step / totalSteps) * 100

  return (
    <div className="w-full max-w-2xl">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-brand transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && (
          <p className="mt-3 text-lg text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Form/Content */}
      <div className="mb-12 rounded-xl border border-border bg-card p-8 shadow-token-xs">
        {children}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        {step > 1 && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-input px-6 py-2.5 font-medium text-foreground transition-colors hover:bg-secondary"
          >
            {backText}
          </button>
        ) : (
          <div />
        )}
        {onNext ? (
          <button
            type="button"
            onClick={onNext}
            className="rounded-lg bg-brand px-6 py-2.5 font-medium text-brand-foreground transition-colors hover:bg-brand/90"
          >
            {nextText}
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="rounded-lg bg-brand px-6 py-2.5 font-medium text-brand-foreground transition-colors hover:bg-brand/90"
          >
            Go to dashboard
          </Link>
        )}
      </div>
    </div>
  )
}

export function OnboardingInput({
  label,
  placeholder,
  type = 'text',
  required = true,
}: {
  label: string
  placeholder: string
  type?: string
  required?: boolean
}) {
  return (
    <div className="mb-6 space-y-2 last:mb-0">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50"
      />
    </div>
  )
}

export function OnboardingSelect({
  label,
  options,
  defaultValue,
}: {
  label: string
  options: { value: string; label: string }[]
  defaultValue?: string
}) {
  return (
    <div className="mb-6 space-y-2 last:mb-0">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <select
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function OnboardingCard({
  selected,
  onClick,
  children,
}: {
  selected?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border-2 p-6 cursor-pointer transition-all ${
        selected
          ? 'border-brand bg-brand/5'
          : 'border-border bg-card hover:border-border-strong'
      }`}
    >
      {children}
    </div>
  )
}

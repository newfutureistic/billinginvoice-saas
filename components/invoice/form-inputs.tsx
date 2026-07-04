'use client'

import { cn } from '@/lib/utils'

export function FormField({
  label,
  required,
  error,
  children,
  className,
  htmlFor,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
  htmlFor?: string
}) {
  const errorId = error ? `${htmlFor}-error` : undefined
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive" aria-label="required">*</span>}
      </label>
      {children}
      {error && <p id={errorId} className="text-xs text-destructive" role="alert">{error}</p>}
    </div>
  )
}

export function Input({
  id,
  'aria-describedby': ariaDescribedby,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = ariaDescribedby || (id ? `${id}-error` : undefined)
  return (
    <input
      id={id}
      aria-describedby={describedBy}
      {...props}
      className={cn(
        'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2',
        props.className
      )}
    />
  )
}

export function Textarea({
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 resize-none',
        props.className
      )}
    />
  )
}

export function Select({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Array<{ value: string; label: string }>
}) {
  return (
    <select
      {...props}
      className={cn(
        'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2',
        props.className
      )}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export function Checkbox({
  label,
  id,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
  return (
    <div className="flex items-center gap-2">
      <input
        id={checkboxId}
        type="checkbox"
        {...props}
        className={cn(
          'h-4 w-4 rounded border border-border bg-background text-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 cursor-pointer',
          props.className
        )}
      />
      {label && <label htmlFor={checkboxId} className="text-sm text-foreground cursor-pointer">{label}</label>}
    </div>
  )
}

export function NumberInput({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="number"
      {...props}
      className={cn(
        'rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2',
        props.className
      )}
    />
  )
}

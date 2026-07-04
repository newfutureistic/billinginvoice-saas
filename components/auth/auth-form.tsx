'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function AuthForm({
  title,
  subtitle,
  children,
  onSubmit,
  submitText,
  loading,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  submitText: string
  loading?: boolean
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      {children}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand px-4 py-2.5 font-medium text-brand-foreground transition-colors hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Loading...' : submitText}
      </button>
    </form>
  )
}

export function AuthInput({
  label,
  placeholder,
  type = 'text',
  required = true,
  error,
}: {
  label: string
  placeholder: string
  type?: string
  required?: boolean
  error?: string
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className={cn(
          'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-transparent',
          error && 'border-destructive focus:ring-destructive/50',
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export function AuthCheckbox({
  label,
  id,
}: {
  label: string
  id: string
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        className="h-4 w-4 rounded border border-input bg-background accent-brand"
      />
      <label htmlFor={id} className="text-sm text-foreground cursor-pointer">
        {label}
      </label>
    </div>
  )
}

export function AuthDivider({ text = 'Or continue with' }: { text?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground">{text}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

export function AuthSocialButton({ text, icon }: { text: string; icon: string }) {
  return (
    <button
      type="button"
      className="w-full rounded-lg border border-input bg-card px-4 py-2.5 font-medium text-foreground transition-colors hover:bg-secondary"
    >
      <span className="flex items-center justify-center gap-2">
        <span className="text-lg">{icon}</span>
        {text}
      </span>
    </button>
  )
}

export function AuthLink({
  href,
  text,
  label,
}: {
  href: string
  text: string
  label: string
}) {
  return (
    <p className="text-center text-sm text-muted-foreground">
      {text}{' '}
      <Link href={href} className="font-medium text-brand hover:underline">
        {label}
      </Link>
    </p>
  )
}

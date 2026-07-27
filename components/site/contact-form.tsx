'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { http } from '@/lib/api/http'
import { ApiError } from '@/lib/api/errors'

const topics = ['General question', 'Sales', 'Billing', 'Technical support', 'Partnership']

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setError(null)
    const data = new FormData(e.currentTarget)
    try {
      await http.post('/contact', {
        firstName: data.get('firstName'),
        lastName: data.get('lastName'),
        email: data.get('email'),
        topic: data.get('topic'),
        message: data.get('message'),
      })
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setError(err instanceof ApiError ? err.message : 'Could not send your message. Please try again.')
    }
  }

  if (status === 'done') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-success/30 bg-success-muted px-8 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success text-success-foreground">
          <Check className="size-6" strokeWidth={3} />
        </span>
        <h3 className="mt-4 text-lg font-semibold text-foreground">Message sent</h3>
        <p className="mt-1 max-w-sm text-pretty leading-relaxed text-muted-foreground">
          Thanks for reaching out. Our team will get back to you within one business day.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border bg-card p-7 shadow-token-sm lg:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" id="firstName">
          <input {...inputProps} id="firstName" name="firstName" required placeholder="Jane" />
        </Field>
        <Field label="Last name" id="lastName">
          <input {...inputProps} id="lastName" name="lastName" required placeholder="Doe" />
        </Field>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Work email" id="email">
          <input {...inputProps} id="email" name="email" type="email" required placeholder="jane@company.com" />
        </Field>
        <Field label="Topic" id="topic">
          <select {...inputProps} id="topic" name="topic" defaultValue={topics[0]}>
            {topics.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="mt-5">
        <Field label="Message" id="message">
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            placeholder="How can we help?"
            className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-token-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </Field>
      </div>
      {status === 'error' && error && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-token-sm transition-colors hover:bg-primary/90 disabled:opacity-70 sm:w-auto"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          'Send message'
        )}
      </button>
    </form>
  )
}

const inputProps = {
  className:
    'h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground shadow-token-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40',
}

function Field({
  label,
  id,
  children,
}: {
  label: string
  id: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}

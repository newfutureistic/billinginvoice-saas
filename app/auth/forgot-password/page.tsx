'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthForm, AuthInput } from '@/components/auth/auth-form'
import { authTexts } from '@/lib/auth-data'
import { http } from '@/lib/api/http'
import { ApiError } from '@/lib/api/errors'

const text = authTexts.forgotPassword

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // The API never reveals whether the address exists (no account enumeration).
      await http.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send the reset link. Please try again.')
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <span className="text-xl">✓</span>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Check your email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a password reset link to your email address.
          </p>
        </div>
        <Link href="/auth/sign-in" className="inline-block font-medium text-brand hover:underline">
          {text.backToSignIn}
        </Link>
      </div>
    )
  }

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <AuthForm
        title={text.title}
        subtitle={text.subtitle}
        submitText={text.sendButton}
        loading={loading}
        onSubmit={handleSubmit}
      >
        <AuthInput label={text.emailLabel} placeholder={text.emailPlaceholder} type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </AuthForm>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="font-medium text-brand hover:underline">
          {text.backToSignIn}
        </Link>
      </p>
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthForm, AuthInput } from '@/components/auth/auth-form'
import { authTexts } from '@/lib/auth-data'
import { http } from '@/lib/api/http'
import { ApiError } from '@/lib/api/errors'

const text = authTexts.verifyEmail

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setEmail(new URLSearchParams(window.location.search).get('email') ?? '')
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email) {
      setError('Missing email address. Use the link from your inbox or sign up again.')
      return
    }
    setLoading(true)
    try {
      await http.post('/auth/verify-email', { email, code })
      setVerified(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid or expired code. Please try again.')
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!email) return
    try {
      await http.post('/auth/resend-verification', { email })
      setResent(true)
      setTimeout(() => setResent(false), 2000)
    } catch {
      // Non-fatal — the button simply won't confirm.
    }
  }

  if (verified) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <span className="text-xl">✓</span>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Email verified</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your email has been verified successfully.
          </p>
        </div>
        <Link
          href="/auth/sign-in"
          className="inline-block rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90"
        >
          Go to sign in
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
        submitText={text.verifyButton}
        loading={loading}
        onSubmit={handleSubmit}
      >
        <AuthInput
          label={text.codeLabel}
          placeholder={text.codePlaceholder}
          name="code"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        />
      </AuthForm>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          className="text-sm font-medium text-brand hover:underline"
        >
          {resent ? '✓ Code sent' : text.resendCode}
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="font-medium text-brand hover:underline">
          {text.backToSignIn}
        </Link>
      </p>
    </>
  )
}

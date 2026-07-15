'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AuthForm, AuthInput } from '@/components/auth/auth-form'
import { authTexts } from '@/lib/auth-data'
import { http } from '@/lib/api/http'
import { ApiError } from '@/lib/api/errors'

const text = authTexts.resetPassword

export default function ResetPasswordPage() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [reset, setReset] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') ?? '')
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!token) {
      setError('This reset link is invalid or has expired. Request a new one.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await http.post('/auth/reset-password', { token, password })
      setReset(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset your password. Please try again.')
      setLoading(false)
    }
  }

  if (reset) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <span className="text-xl">✓</span>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Password reset</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password has been reset successfully.
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
        submitText={text.resetButton}
        loading={loading}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <AuthInput label={text.passwordLabel} placeholder={text.passwordPlaceholder} type="password" name="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <AuthInput label={text.confirmLabel} placeholder={text.confirmPlaceholder} type="password" name="confirm" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
      </AuthForm>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="font-medium text-brand hover:underline">
          {text.backToSignIn}
        </Link>
      </p>
    </>
  )
}

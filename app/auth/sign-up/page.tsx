'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthForm, AuthInput, AuthCheckbox, AuthLink } from '@/components/auth/auth-form'
import { authTexts } from '@/lib/auth-data'
import { http } from '@/lib/api/http'
import { ApiError } from '@/lib/api/errors'

const text = authTexts.signUp

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (!agree) {
      setError('Please accept the terms to continue.')
      return
    }
    setLoading(true)
    try {
      await http.post('/auth/signup', { name, email, password, acceptTerms: agree })
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)
    } catch (err) {
      // Show the specific field problem (e.g. "Password must contain an uppercase letter")
      // instead of a generic "Validation failed" so the user knows exactly what to change.
      if (err instanceof ApiError) {
        const fieldMsg = err.fields ? Object.values(err.fields)[0] : undefined
        setError(fieldMsg || err.message)
      } else {
        setError('Could not create your account. Please try again.')
      }
      setLoading(false)
    }
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
        submitText={text.signUpButton}
        loading={loading}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <AuthInput label={text.nameLabel} placeholder={text.namePlaceholder} name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          <AuthInput label={text.emailLabel} placeholder={text.emailPlaceholder} type="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div>
            <AuthInput label={text.passwordLabel} placeholder={text.passwordPlaceholder} type="password" name="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="mt-1.5 text-xs text-muted-foreground">
              At least 8 characters, with an uppercase letter and a number.
            </p>
          </div>
          <AuthInput label={text.confirmLabel} placeholder={text.confirmPlaceholder} type="password" name="confirm" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <AuthCheckbox label={text.agreeTerms} id="agree-terms" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        </div>
      </AuthForm>

      <AuthLink href="/auth/sign-in" text={text.signInLink} label={text.signInLabel} />
    </>
  )
}

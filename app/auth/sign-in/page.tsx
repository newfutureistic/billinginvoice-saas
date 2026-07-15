'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { AuthForm, AuthInput, AuthCheckbox, AuthLink } from '@/components/auth/auth-form'
import { authTexts } from '@/lib/auth-data'

const text = authTexts.signIn

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await signIn('credentials', { redirect: false, email, password, rememberMe })
      if (!res || res.error) {
        // Auth.js returns 'CredentialsSignin' for a genuine bad email/password. Any other error
        // (e.g. the database was briefly unreachable) is an infrastructure issue, not a wrong
        // password — tell the user it's temporary and retryable instead of blaming their login.
        setError(
          res?.error === 'CredentialsSignin'
            ? 'Incorrect email or password.'
            : 'We couldn’t reach the server. Please wait a moment and try again.',
        )
        setLoading(false)
        return
      }
      const cb = new URLSearchParams(window.location.search).get('callbackUrl')
      router.push(cb && cb.startsWith('/') ? cb : '/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
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
        submitText={text.signInButton}
        loading={loading}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <AuthInput
            label={text.emailLabel}
            placeholder={text.emailPlaceholder}
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthInput
            label={text.passwordLabel}
            placeholder={text.passwordPlaceholder}
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between">
            <AuthCheckbox
              label={text.rememberMe}
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <Link href="/auth/forgot-password" className="text-sm font-medium text-brand hover:underline">
              {text.forgotPassword}
            </Link>
          </div>
        </div>
      </AuthForm>

      <AuthLink href="/auth/sign-up" text={text.signUpLink} label={text.signUpLabel} />
    </>
  )
}

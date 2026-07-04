'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthForm, AuthInput } from '@/components/auth/auth-form'
import { authTexts } from '@/lib/auth-data'

const text = authTexts.verifyEmail

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [resent, setResent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setVerified(true)
    }, 1000)
  }

  function handleResend() {
    setResent(true)
    setTimeout(() => setResent(false), 2000)
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
          href="/dashboard"
          className="inline-block rounded-lg bg-brand px-4 py-2 font-medium text-brand-foreground hover:bg-brand/90"
        >
          Go to dashboard
        </Link>
      </div>
    )
  }

  return (
    <>
      <AuthForm
        title={text.title}
        subtitle={text.subtitle}
        submitText={text.verifyButton}
        loading={loading}
        onSubmit={handleSubmit}
      >
        <AuthInput label={text.codeLabel} placeholder={text.codePlaceholder} />
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

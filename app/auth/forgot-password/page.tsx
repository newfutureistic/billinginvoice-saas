'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthForm, AuthInput } from '@/components/auth/auth-form'
import { authTexts } from '@/lib/auth-data'

const text = authTexts.forgotPassword

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1000)
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
        <Link
          href="/auth/sign-in"
          className="inline-block font-medium text-brand hover:underline"
        >
          {text.backToSignIn}
        </Link>
      </div>
    )
  }

  return (
    <>
      <AuthForm
        title={text.title}
        subtitle={text.subtitle}
        submitText={text.sendButton}
        loading={loading}
        onSubmit={handleSubmit}
      >
        <AuthInput label={text.emailLabel} placeholder={text.emailPlaceholder} type="email" />
      </AuthForm>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/auth/sign-in" className="font-medium text-brand hover:underline">
          {text.backToSignIn}
        </Link>
      </p>
    </>
  )
}

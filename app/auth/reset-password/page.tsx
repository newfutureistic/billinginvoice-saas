'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthForm, AuthInput } from '@/components/auth/auth-form'
import { authTexts } from '@/lib/auth-data'

const text = authTexts.resetPassword

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [reset, setReset] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setReset(true)
    }, 1000)
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
        submitText={text.resetButton}
        loading={loading}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <AuthInput label={text.passwordLabel} placeholder={text.passwordPlaceholder} type="password" />
          <AuthInput label={text.confirmLabel} placeholder={text.confirmPlaceholder} type="password" />
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

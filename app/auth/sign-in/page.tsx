'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthForm, AuthInput, AuthCheckbox, AuthDivider, AuthSocialButton, AuthLink } from '@/components/auth/auth-form'
import { authTexts } from '@/lib/auth-data'

const text = authTexts.signIn

export default function SignInPage() {
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <>
      <AuthForm
        title={text.title}
        subtitle={text.subtitle}
        submitText={text.signInButton}
        loading={loading}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <AuthInput label={text.emailLabel} placeholder={text.emailPlaceholder} type="email" />
          <AuthInput label={text.passwordLabel} placeholder={text.passwordPlaceholder} type="password" />

          <div className="flex items-center justify-between">
            <AuthCheckbox label={text.rememberMe} id="remember-me" />
            <Link href="/auth/forgot-password" className="text-sm font-medium text-brand hover:underline">
              {text.forgotPassword}
            </Link>
          </div>
        </div>
      </AuthForm>

      <AuthDivider text={text.divider} />

      <div className="space-y-3">
        <AuthSocialButton text={text.google} icon="🔵" />
        <AuthSocialButton text={text.github} icon="⚫" />
      </div>

      <AuthLink href="/auth/sign-up" text={text.signUpLink} label="" />
    </>
  )
}

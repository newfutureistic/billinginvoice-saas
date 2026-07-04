'use client'

import { useState } from 'react'
import { AuthForm, AuthInput, AuthCheckbox, AuthDivider, AuthSocialButton, AuthLink } from '@/components/auth/auth-form'
import { authTexts } from '@/lib/auth-data'

const text = authTexts.signUp

export default function SignUpPage() {
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
        submitText={text.signUpButton}
        loading={loading}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <AuthInput label={text.nameLabel} placeholder={text.namePlaceholder} />
          <AuthInput label={text.emailLabel} placeholder={text.emailPlaceholder} type="email" />
          <AuthInput label={text.passwordLabel} placeholder={text.passwordPlaceholder} type="password" />
          <AuthInput label={text.confirmLabel} placeholder={text.confirmPlaceholder} type="password" />
          <AuthCheckbox label={text.agreeTerms} id="agree-terms" />
        </div>
      </AuthForm>

      <AuthDivider text={text.divider} />

      <div className="space-y-3">
        <AuthSocialButton text={text.google} icon="🔵" />
        <AuthSocialButton text={text.github} icon="⚫" />
      </div>

      <AuthLink href="/auth/sign-in" text={text.signInLink} label="" />
    </>
  )
}

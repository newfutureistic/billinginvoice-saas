'use client'

import { useRouter } from 'next/navigation'
import { OnboardingStep } from '@/components/onboarding/onboarding-step'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <OnboardingStep
      step={1}
      totalSteps={7}
      title="Welcome to ToolForge"
      subtitle="Let's set up your account in just a few steps"
      onNext={() => router.push('/onboarding/company')}
    >
      <div className="space-y-6">
        <div className="rounded-lg bg-brand/10 p-6">
          <p className="text-base text-foreground">
            ToolForge helps you create professional invoices, manage clients, and get paid faster.
          </p>
          <p className="mt-3 text-base text-muted-foreground">
            This setup wizard will guide you through the essential configuration steps.
          </p>
        </div>
        <div className="space-y-4">
          {[
            'Create your first invoice in seconds',
            'Customize with your branding',
            'Manage invoices and clients',
            'Invite your team members',
          ].map((item) => (
            <div key={item} className="flex gap-3">
              <span className="text-brand">✓</span>
              <span className="text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </OnboardingStep>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { OnboardingStep, OnboardingInput } from '@/components/onboarding/onboarding-step'

export default function CompanyPage() {
  const router = useRouter()

  return (
    <OnboardingStep
      step={2}
      totalSteps={7}
      title="Company Details"
      subtitle="Tell us about your business"
      onNext={() => router.push('/onboarding/branding')}
      onBack={() => router.push('/onboarding/welcome')}
    >
      <div className="space-y-4">
        <OnboardingInput label="Company name" placeholder="Acme Corporation" />
        <OnboardingInput label="Business type" placeholder="Consulting" />
        <OnboardingInput label="Email address" placeholder="info@example.com" type="email" />
        <OnboardingInput label="Phone number" placeholder="+1 (555) 000-0000" type="tel" />
        <OnboardingInput label="Address" placeholder="123 Main Street" />
      </div>
    </OnboardingStep>
  )
}

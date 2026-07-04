'use client'

import { useRouter } from 'next/navigation'
import { OnboardingStep, OnboardingSelect } from '@/components/onboarding/onboarding-step'

export default function CurrencyPage() {
  const router = useRouter()

  const currencies = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'AUD', label: 'Australian Dollar (AUD)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' },
    { value: 'INR', label: 'Indian Rupee (INR)' },
  ]

  return (
    <OnboardingStep
      step={4}
      totalSteps={7}
      title="Currency & Numbers"
      subtitle="How should amounts appear on your invoices?"
      onNext={() => router.push('/onboarding/tax')}
      onBack={() => router.push('/onboarding/branding')}
    >
      <div className="space-y-4">
        <OnboardingSelect
          label="Currency"
          options={currencies}
          defaultValue="USD"
        />
        <OnboardingSelect
          label="Decimal separator"
          options={[
            { value: 'dot', label: 'Dot (.) - 1,234.56' },
            { value: 'comma', label: 'Comma (,) - 1.234,56' },
          ]}
          defaultValue="dot"
        />
        <OnboardingSelect
          label="Thousand separator"
          options={[
            { value: 'comma', label: 'Comma (,) - 1,234.56' },
            { value: 'dot', label: 'Dot (.) - 1.234,56' },
            { value: 'space', label: 'Space - 1 234,56' },
          ]}
          defaultValue="comma"
        />
      </div>
    </OnboardingStep>
  )
}

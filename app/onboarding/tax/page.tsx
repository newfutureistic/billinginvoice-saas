'use client'

import { useRouter } from 'next/navigation'
import { OnboardingStep, OnboardingSelect, OnboardingInput } from '@/components/onboarding/onboarding-step'

export default function TaxPage() {
  const router = useRouter()

  return (
    <OnboardingStep
      step={5}
      totalSteps={7}
      title="Tax Region"
      subtitle="Configure tax settings for your location"
      onNext={() => router.push('/onboarding/templates')}
      onBack={() => router.push('/onboarding/currency')}
    >
      <div className="space-y-4">
        <OnboardingSelect
          label="Country"
          options={[
            { value: 'US', label: 'United States' },
            { value: 'CA', label: 'Canada' },
            { value: 'GB', label: 'United Kingdom' },
            { value: 'AU', label: 'Australia' },
            { value: 'IN', label: 'India' },
            { value: 'DE', label: 'Germany' },
          ]}
          defaultValue="US"
        />
        <OnboardingSelect
          label="Tax type"
          options={[
            { value: 'gst', label: 'GST (Goods & Services Tax)' },
            { value: 'vat', label: 'VAT (Value Added Tax)' },
            { value: 'sales', label: 'Sales Tax' },
            { value: 'none', label: 'No tax' },
          ]}
          defaultValue="gst"
        />
        <OnboardingInput label="Tax ID / ABN" placeholder="XX XXX XXX XXX" />
      </div>
    </OnboardingStep>
  )
}

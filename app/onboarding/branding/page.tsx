'use client'

import { useRouter } from 'next/navigation'
import { OnboardingStep } from '@/components/onboarding/onboarding-step'

export default function BrandingPage() {
  const router = useRouter()

  return (
    <OnboardingStep
      step={3}
      totalSteps={7}
      title="Branding"
      subtitle="Customize how your invoices look"
      onNext={() => router.push('/onboarding/currency')}
      onBack={() => router.push('/onboarding/company')}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Logo</label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-border-strong transition-colors">
            <p className="text-sm text-muted-foreground">Drag and drop your logo here or click to upload</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Brand color</label>
          <div className="flex gap-3">
            {['#0066FF', '#FF6B35', '#004E89', '#1ABC9C', '#9B59B6'].map((color) => (
              <button
                key={color}
                className="w-12 h-12 rounded-lg border-2 border-border hover:border-border-strong transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    </OnboardingStep>
  )
}

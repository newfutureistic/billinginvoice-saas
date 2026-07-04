'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingStep, OnboardingCard } from '@/components/onboarding/onboarding-step'

export default function TemplatesPage() {
  const router = useRouter()
  const [selected, setSelected] = useState('classic')

  const templates = [
    { id: 'classic', name: 'Classic', desc: 'Clean and professional' },
    { id: 'modern', name: 'Modern', desc: 'Contemporary design' },
    { id: 'minimal', name: 'Minimal', desc: 'Simple and elegant' },
    { id: 'corporate', name: 'Corporate', desc: 'Business focused' },
    { id: 'creative', name: 'Creative', desc: 'Bold and colorful' },
    { id: 'luxury', name: 'Luxury', desc: 'Premium feel' },
  ]

  return (
    <OnboardingStep
      step={6}
      totalSteps={7}
      title="Invoice Template"
      subtitle="Choose your default invoice template"
      onNext={() => router.push('/onboarding/finish')}
      onBack={() => router.push('/onboarding/tax')}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {templates.map((template) => (
          <OnboardingCard
            key={template.id}
            selected={selected === template.id}
            onClick={() => setSelected(template.id)}
          >
            <div className="mb-3 h-32 rounded bg-secondary" />
            <h3 className="font-semibold text-foreground">{template.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{template.desc}</p>
          </OnboardingCard>
        ))}
      </div>
    </OnboardingStep>
  )
}

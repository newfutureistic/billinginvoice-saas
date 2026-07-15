'use client'

import { useRouter } from 'next/navigation'
import { OnboardingStep } from '@/components/onboarding/onboarding-step'

export default function FinishPage() {
  const router = useRouter()

  return (
    <OnboardingStep
      step={7}
      totalSteps={7}
      title="You're all set!"
      subtitle="Your Bill Maker account is ready to use"
      onNext={() => router.push('/dashboard')}
      nextText="Go to dashboard"
    >
      <div className="text-center space-y-8">
        <div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Welcome!</h2>
          <p className="mt-2 text-muted-foreground">
            Your account has been configured and is ready to use.
          </p>
        </div>

        <div className="rounded-lg bg-brand/10 p-6 text-left space-y-3">
          <h3 className="font-semibold text-foreground">What's next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-brand">1.</span>
              <span>Create your first invoice</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand">2.</span>
              <span>Add your clients and products</span>
            </li>
            <li className="flex gap-2">
              <span className="text-brand">3.</span>
              <span>Invite your team members</span>
            </li>
          </ul>
        </div>
      </div>
    </OnboardingStep>
  )
}

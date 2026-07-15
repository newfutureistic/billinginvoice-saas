import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Setup Bill Maker | Onboarding' }

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-brand/5">
      <div className="flex flex-col">
        <div className="flex h-16 items-center border-b border-border/50 px-6">
          <h1 className="font-semibold text-foreground">Bill Maker</h1>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-12">{children}</div>
      </div>
    </div>
  )
}

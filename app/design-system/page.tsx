import { BadgesSection, ButtonsSection, FormsSection } from '@/components/ds/controls'
import {
  ColorSection,
  ElevationSection,
  GridSection,
  IconographySection,
  RadiusSection,
  SpacingSection,
  TypographySection,
} from '@/components/ds/foundations'
import { OverviewSection } from '@/components/ds/overview'
import { Shell } from '@/components/ds/shell'
import { CardsSection, MotionSection, TableSection } from '@/components/ds/surfaces'

export default function DesignSystemPage() {
  return (
    <Shell>
      <OverviewSection />
      <ColorSection />
      <TypographySection />
      <SpacingSection />
      <RadiusSection />
      <ElevationSection />
      <GridSection />
      <IconographySection />
      <ButtonsSection />
      <FormsSection />
      <BadgesSection />
      <CardsSection />
      <TableSection />
      <MotionSection />

      <footer className="border-t border-border py-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            ToolForge Design System — built to be re-themed, extended, and trusted.
          </p>
          <p className="font-mono text-xs text-muted-foreground">v1.0 · Foundation</p>
        </div>
      </footer>
    </Shell>
  )
}

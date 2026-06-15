import { ExperienceLandingSection } from '@/features/experience/ExperienceLandingSection'

// ISR: landing page is statically generated and revalidated hourly.
export const revalidate = 3600

/**
 * Landing page. Phase 5 (Composition) owns the full aggregation (globals +
 * projections + conditional Dear Company). For now it mounts the Experience
 * projection so the deep-links are testable end to end.
 */
export default function HomePage() {
  return (
    <main>
      <ExperienceLandingSection />
    </main>
  )
}

import { Landing } from '@/features/landing/Landing'

// ISR daily backstop; on-demand revalidation is primary → docs/ARCHITECTURE.md (ROUTING).
export const revalidate = 86400

/**
 * Landing page. Composes the Landing global + collection projections via the
 * shared Landing RSC. The `/dear/[company]` route renders the same component
 * with a visitor for the personalized variant.
 */
export default function HomePage() {
  return <Landing />
}

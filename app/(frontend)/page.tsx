import { Landing } from '@/features/landing/Landing'

// ISR: daily time-based backstop; content publishes revalidate on demand
// (revalidateSite in every collection/global afterChange), so this timer only
// catches writes outside a request scope (seeds/migrations).
export const revalidate = 86400

/**
 * Landing page. Composes the Landing global + collection projections via the
 * shared Landing RSC. The `/dear/[company]` route renders the same component
 * with a visitor for the personalized variant.
 */
export default function HomePage() {
  return <Landing />
}

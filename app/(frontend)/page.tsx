import { Landing } from '@/features/landing/Landing'

// ISR: landing page is statically generated and revalidated hourly.
export const revalidate = 3600

/**
 * Landing page. Composes the Landing global + collection projections via the
 * shared Landing RSC. The `/dear/[company]` route renders the same component
 * with a visitor for the personalized variant.
 */
export default function HomePage() {
  return <Landing />
}

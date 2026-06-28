'use client'

import dynamic from 'next/dynamic'

/**
 * Pre-hydration placeholder while the client-only graph bundle loads — keeps the
 * band's reserved height stable (no CLS) before @xyflow/react mounts.
 */
function MentalGraphSkeleton() {
  return (
    <div
      className="h-full w-full animate-pulse rounded-xl border border-border bg-muted/40"
      aria-hidden="true"
    />
  )
}

/**
 * Client-only entry point for the mental graph. `next/dynamic` with `ssr:false`
 * is only legal inside a Client Component (Next 15), so this wrapper carries the
 * `'use client'` boundary — it defers the @xyflow/react bundle AND the ~230 KB
 * graph.json (imported by MentalGraph) to the browser, behind the skeleton.
 *
 * Server components (the MoreAboutMe band) render this directly.
 */
const MentalGraph = dynamic(() => import('./MentalGraph').then((m) => m.MentalGraph), {
  ssr: false,
  loading: () => <MentalGraphSkeleton />,
})

export function MentalGraphClient() {
  return <MentalGraph />
}

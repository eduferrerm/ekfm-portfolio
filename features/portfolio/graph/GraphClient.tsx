'use client'

import dynamic from 'next/dynamic'

import { GraphSkeleton } from './GraphSkeleton'
import type { GraphProps } from './Graph'

/**
 * Client-only entry point for the portfolio graph.
 *
 * `next/dynamic` with `ssr:false` is only legal inside a Client Component
 * (Next 15), so this wrapper carries the `'use client'` boundary. It defers the
 * @xyflow/react bundle to the browser and shows GraphSkeleton until it mounts.
 */
const Graph = dynamic(() => import('./Graph').then((m) => m.Graph), {
  ssr: false,
  loading: () => <GraphSkeleton />,
})

export function GraphClient(props: GraphProps) {
  return <Graph {...props} />
}

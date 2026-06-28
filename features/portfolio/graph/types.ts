import type { Edge, Node } from '@xyflow/react'

/**
 * Shared graph data contract consumed by {@link GraphClient}.
 *
 * Both the hand-authored per-feature diagrams (this phase) and the Phase 5 CSV
 * pipeline (the ~300-node "More About Me" map) produce this same shape — so the
 * renderer is shared while the *source* differs by scale. An edge's `label`
 * carries the relationship descriptor (e.g. "sanitises", "requests").
 *
 * `@xyflow/react` is imported type-only here (erased at compile), so this module
 * never pulls the graph runtime into a server or admin bundle.
 */
export type GraphData = {
  nodes: Node[]
  edges: Edge[]
}

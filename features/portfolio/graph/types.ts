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

/**
 * The three brand emphasis tiers a system-design node can be painted in
 * (primary = lime, secondary = blue, tertiary = fuchsia — see {@link SystemNode}).
 * Authored per-node in the hand-built diagrams to encode role: entry/exit points,
 * processing steps, and data stores read as distinct hues.
 */
export type NodeTier = 'primary' | 'secondary' | 'tertiary'

/** Shape of a system-design node's `data` (carried on the xyflow {@link Node}). */
export type SystemNodeData = {
  label: string
  /** Brand tier driving the pill colour; defaults to `primary` when omitted. */
  tier?: NodeTier
}

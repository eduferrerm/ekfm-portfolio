/**
 * Data contract for the "More About Me" mental-graph map — the ~400-node
 * relational map of recurring concepts (the landing's MoreAboutMe band).
 *
 * The pipeline (scripts/build-more-about-me-graph.mts) reads the two source CSVs
 * (scripts/seed/more-about-me/{nodes,edges}.csv), runs an offline force layout,
 * and emits `graph.json` in this exact shape — a plain, xyflow-compatible JSON
 * (no @xyflow/react import at the data level, so the type is serialisable and the
 * pipeline stays decoupled from the renderer). The render layer (MentalGraph)
 * adapts these to `@xyflow/react` `Node`/`Edge`.
 *
 * `category` is the raw value from the CSV; the 13 categories fold into three
 * brand tiers for colour at render time (see categoryTier) — kept as a first-class
 * field on every node so a later category/tier FILTER UI needs no data reshape.
 */
export type MentalNodeData = {
  label: string
  category: string
  description: string
}

export type MentalNode = {
  id: string
  position: { x: number; y: number }
  data: MentalNodeData
}

export type MentalEdge = {
  id: string
  source: string
  target: string
  /** The CSV's `relation_context` — the relationship descriptor, shown on hover. */
  data: { relation: string }
}

export type MentalGraphData = {
  nodes: MentalNode[]
  edges: MentalEdge[]
}

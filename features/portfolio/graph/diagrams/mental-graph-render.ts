import type { GraphData } from '../types'

/**
 * "Mental Graph Render" — how the ~400-node concept map gets to the browser
 * cheaply: positions are laid out offline and baked into static JSON, so the
 * client ships only @xyflow/react + the data. Hand-authored left→right.
 *
 * Tiered by role: the CSV sources + the committed graph.json are `tertiary`
 * (data stores); the build step, the client boundary, and the colour scale are
 * `secondary` (processing); the rendered map is `primary` (exit).
 */
export const mentalGraphRender: GraphData = {
  nodes: [
    { id: 'csvs', position: { x: 0, y: 120 }, data: { label: 'nodes / edges.csv', tier: 'tertiary' } },
    { id: 'build', position: { x: 260, y: 120 }, data: { label: 'build (d3-force, offline)', tier: 'secondary' } },
    { id: 'json', position: { x: 520, y: 120 }, data: { label: 'graph.json (committed)', tier: 'tertiary' } },
    { id: 'client', position: { x: 780, y: 120 }, data: { label: 'MentalGraphClient (ssr:false)', tier: 'secondary' } },
    { id: 'category', position: { x: 780, y: 0 }, data: { label: 'categoryTier (13-colour)', tier: 'secondary' } },
    { id: 'graph', position: { x: 1080, y: 120 }, data: { label: 'MentalGraph (themed xyflow)', tier: 'primary' } },
  ],
  edges: [
    { id: 'e-csvs-build', source: 'csvs', target: 'build', label: 'parse + validate' },
    { id: 'e-build-json', source: 'build', target: 'json', label: 'bakes positions' },
    { id: 'e-json-client', source: 'json', target: 'client', label: 'imports static' },
    { id: 'e-client-graph', source: 'client', target: 'graph', label: 'mounts client-only' },
    { id: 'e-category-graph', source: 'category', target: 'graph', label: 'sets --node per category' },
  ],
}

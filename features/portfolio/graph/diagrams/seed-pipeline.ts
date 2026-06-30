import type { GraphData } from '../types'

/**
 * "Seed Pipeline" — one shared tsx/CSV scaffold feeds two outputs: an idempotent
 * Local-API upsert into Postgres, and a build-time graph baked to static JSON.
 * Hand-authored left→right.
 *
 * Tiered by role: the CSV sources + the two stores (Postgres, graph.json) are
 * `tertiary`; the parse / validate / upsert / layout steps are `secondary`
 * (processing).
 */
export const seedPipeline: GraphData = {
  nodes: [
    { id: 'keywords-csv', position: { x: 0, y: 0 }, data: { label: 'keywords.csv', tier: 'tertiary' } },
    { id: 'graph-csv', position: { x: 0, y: 200 }, data: { label: 'nodes / edges.csv', tier: 'tertiary' } },
    { id: 'parse', position: { x: 260, y: 100 }, data: { label: 'parseCsv (shared)', tier: 'secondary' } },
    { id: 'validate', position: { x: 500, y: 100 }, data: { label: 'validate (fail-fast)', tier: 'secondary' } },
    { id: 'upsert', position: { x: 760, y: 0 }, data: { label: 'Local API upsert-by-key', tier: 'secondary' } },
    { id: 'postgres', position: { x: 1040, y: 0 }, data: { label: 'Postgres (Keywords)', tier: 'tertiary' } },
    { id: 'layout', position: { x: 760, y: 200 }, data: { label: 'd3-force (build-time)', tier: 'secondary' } },
    { id: 'graph-json', position: { x: 1040, y: 200 }, data: { label: 'graph.json (committed)', tier: 'tertiary' } },
  ],
  edges: [
    { id: 'e-keywords-parse', source: 'keywords-csv', target: 'parse', label: 'reads' },
    { id: 'e-graph-parse', source: 'graph-csv', target: 'parse', label: 'reads' },
    { id: 'e-parse-validate', source: 'parse', target: 'validate', label: 'rows' },
    { id: 'e-validate-upsert', source: 'validate', target: 'upsert', label: 'keyword rows' },
    { id: 'e-upsert-postgres', source: 'upsert', target: 'postgres', label: 'upserts (idempotent)' },
    { id: 'e-postgres-keywords', source: 'postgres', target: 'keywords-csv', label: 'export reverses' },
    { id: 'e-validate-layout', source: 'validate', target: 'layout', label: 'graph rows' },
    { id: 'e-layout-graph', source: 'layout', target: 'graph-json', label: 'bakes x/y' },
  ],
}

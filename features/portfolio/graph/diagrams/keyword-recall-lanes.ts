import type { GraphData } from '../types'

/**
 * "Keyword Recall Lanes" — one sealed taxonomy feeds two lanes: the rendered
 * descriptor pills and the hidden search-recall fold. Hand-authored left→right.
 *
 * Tiered by role: the CSV SSOT + Postgres + the built corpus are `tertiary`
 * (data stores); the seed/export round-trip and the recall fold are `secondary`
 * (processing); the rendered pills and the search palette are `primary`
 * (what a visitor actually sees).
 */
export const keywordRecallLanes: GraphData = {
  nodes: [
    { id: 'csv', position: { x: 0, y: 120 }, data: { label: 'keywords.csv (SSOT)', tier: 'tertiary' } },
    { id: 'roundtrip', position: { x: 240, y: 120 }, data: { label: 'seed ⇄ export', tier: 'secondary' } },
    { id: 'db', position: { x: 480, y: 120 }, data: { label: 'Keywords (Postgres)', tier: 'tertiary' } },
    { id: 'pickers', position: { x: 760, y: 0 }, data: { label: 'scope / craft pills', tier: 'primary' } },
    { id: 'searchonly', position: { x: 760, y: 200 }, data: { label: 'searchKeywords (hidden)', tier: 'secondary' } },
    { id: 'aliases', position: { x: 1020, y: 200 }, data: { label: 'host doc aliases[]', tier: 'secondary' } },
    { id: 'corpus', position: { x: 1280, y: 200 }, data: { label: 'SearchDocument corpus', tier: 'tertiary' } },
    { id: 'palette', position: { x: 1540, y: 200 }, data: { label: 'Search palette', tier: 'primary' } },
  ],
  edges: [
    { id: 'e-csv-roundtrip', source: 'csv', target: 'roundtrip', label: 'seeds (upsert by key)' },
    { id: 'e-roundtrip-db', source: 'roundtrip', target: 'db', label: 'upserts' },
    { id: 'e-db-roundtrip', source: 'db', target: 'roundtrip', label: 'exports back' },
    { id: 'e-db-pickers', source: 'db', target: 'pickers', label: 'renders as pills' },
    { id: 'e-db-searchonly', source: 'db', target: 'searchonly', label: 'category = searchOnly' },
    { id: 'e-searchonly-aliases', source: 'searchonly', target: 'aliases', label: 'folds into' },
    { id: 'e-aliases-corpus', source: 'aliases', target: 'corpus', label: 'feeds' },
    { id: 'e-corpus-palette', source: 'corpus', target: 'palette', label: 'recalls one clean hit' },
  ],
}

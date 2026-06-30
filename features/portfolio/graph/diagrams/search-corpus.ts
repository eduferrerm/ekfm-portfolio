import type { GraphData } from '../types'

/**
 * "Search Corpus" — how site-wide search works with no server: the corpus is
 * flattened from the Local API at build/ISR, shipped as static JSON, and Fuse
 * indexes it in the browser. Hand-authored left→right.
 *
 * Tiered by role: the Local API content source + the shipped SearchDocument JSON
 * are `tertiary` (data); the corpus builder, the in-browser index, and the facet
 * layer are `secondary` (processing); the palette is `primary` (entry).
 */
export const searchCorpus: GraphData = {
  nodes: [
    { id: 'local-api', position: { x: 0, y: 120 }, data: { label: 'Payload Local API', tier: 'tertiary' } },
    { id: 'dataset', position: { x: 260, y: 120 }, data: { label: 'dataset.ts (build corpus)', tier: 'secondary' } },
    { id: 'docs', position: { x: 540, y: 120 }, data: { label: 'SearchDocument[] (static)', tier: 'tertiary' } },
    { id: 'index', position: { x: 820, y: 120 }, data: { label: 'useSearchIndex (Fuse)', tier: 'secondary' } },
    { id: 'facets', position: { x: 820, y: 0 }, data: { label: 'facets / visitorContext', tier: 'secondary' } },
    { id: 'palette', position: { x: 1120, y: 120 }, data: { label: 'SearchPalette', tier: 'primary' } },
  ],
  edges: [
    { id: 'e-api-dataset', source: 'local-api', target: 'dataset', label: 'reads at ISR' },
    { id: 'e-dataset-docs', source: 'dataset', target: 'docs', label: 'flattens + folds aliases' },
    { id: 'e-docs-index', source: 'docs', target: 'index', label: 'Fuse indexes in-browser' },
    { id: 'e-index-palette', source: 'index', target: 'palette', label: 'ranked results' },
    { id: 'e-facets-palette', source: 'facets', target: 'palette', label: 'facets + empty state' },
  ],
}

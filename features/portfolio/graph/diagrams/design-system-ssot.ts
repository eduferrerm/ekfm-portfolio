import type { GraphData } from '../types'

/**
 * "Design System SSOT" — how a design token stays authored in exactly one place.
 * Hand-authored left→right: `globals.css` is the single source; the generated
 * catalog, the class-merger, and the live viewer all derive from it.
 *
 * Tiered by role: the source + generated artifacts are `tertiary` (data stores),
 * the codegen / live-resolve / guard steps are `secondary` (processing), and the
 * surfaces a developer actually touches (the viewer, the component layer) are
 * `primary` (entry / exit).
 */
export const designSystemSsot: GraphData = {
  nodes: [
    { id: 'globals', position: { x: 0, y: 120 }, data: { label: 'globals.css (@ds markers)', tier: 'tertiary' } },
    { id: 'generate', position: { x: 280, y: 40 }, data: { label: 'generate:tokens', tier: 'secondary' } },
    { id: 'catalog', position: { x: 560, y: 40 }, data: { label: 'tokens.generated.ts', tier: 'tertiary' } },
    { id: 'cn', position: { x: 840, y: 0 }, data: { label: 'cn() · tailwind-merge', tier: 'secondary' } },
    { id: 'viewer', position: { x: 840, y: 160 }, data: { label: '/design-system viewer', tier: 'primary' } },
    { id: 'resolve', position: { x: 560, y: 220 }, data: { label: 'resolveTokens (live)', tier: 'secondary' } },
    { id: 'hook', position: { x: 280, y: 220 }, data: { label: 'pre-commit hook', tier: 'secondary' } },
  ],
  edges: [
    { id: 'e-globals-generate', source: 'globals', target: 'generate', label: 'scrapes @ds markers' },
    { id: 'e-generate-catalog', source: 'generate', target: 'catalog', label: 'emits name-lists' },
    { id: 'e-catalog-cn', source: 'catalog', target: 'cn', label: 'derives roles' },
    { id: 'e-catalog-viewer', source: 'catalog', target: 'viewer', label: 'lists tokens' },
    { id: 'e-globals-resolve', source: 'globals', target: 'resolve', label: 'reads live values' },
    { id: 'e-resolve-viewer', source: 'resolve', target: 'viewer', label: 'resolves captions' },
    { id: 'e-hook-catalog', source: 'hook', target: 'catalog', label: 'regenerates + stages' },
  ],
}

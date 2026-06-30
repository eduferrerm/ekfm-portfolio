import type { GraphData } from '../types'

/**
 * "Design System SSOT" — how a design token stays authored in exactly one place.
 * Hand-authored left→right: the brand is designed in Figma, encoded once into
 * `globals.css`, and the generated catalog, the class-merger, and the component
 * layer all derive from that single file.
 *
 * Tiered by role: the source + generated artifacts are `tertiary` (data stores),
 * the codegen / class-merge / guard steps are `secondary` (processing), and the
 * surfaces a developer actually touches (the Figma boards, the component layer)
 * are `primary` (entry / exit).
 */
export const designSystemSsot: GraphData = {
  nodes: [
    { id: 'figma', position: { x: 0, y: 120 }, data: { label: 'Figma brand boards', tier: 'primary' } },
    { id: 'globals', position: { x: 260, y: 120 }, data: { label: 'globals.css (@ds markers)', tier: 'tertiary' } },
    { id: 'generate', position: { x: 540, y: 40 }, data: { label: 'generate:tokens', tier: 'secondary' } },
    { id: 'catalog', position: { x: 820, y: 40 }, data: { label: 'tokens.generated.ts', tier: 'tertiary' } },
    { id: 'cn', position: { x: 1100, y: 40 }, data: { label: 'cn() · tailwind-merge', tier: 'secondary' } },
    { id: 'components', position: { x: 1100, y: 180 }, data: { label: 'Pressable / Button (cva)', tier: 'primary' } },
    { id: 'hook', position: { x: 540, y: 200 }, data: { label: 'pre-commit hook', tier: 'secondary' } },
  ],
  edges: [
    { id: 'e-figma-globals', source: 'figma', target: 'globals', label: 'encodes brand boards' },
    { id: 'e-globals-generate', source: 'globals', target: 'generate', label: 'scrapes @ds markers' },
    { id: 'e-generate-catalog', source: 'generate', target: 'catalog', label: 'emits name-lists' },
    { id: 'e-catalog-cn', source: 'catalog', target: 'cn', label: 'derives role list' },
    { id: 'e-cn-components', source: 'cn', target: 'components', label: 'merges utilities' },
    { id: 'e-globals-components', source: 'globals', target: 'components', label: 'semantic utilities' },
    { id: 'e-hook-catalog', source: 'hook', target: 'catalog', label: 'regenerates + stages' },
  ],
}

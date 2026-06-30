import type { GraphData } from '../types'

/**
 * "Diagram Registry" — a meta-diagram of the system that renders these very
 * diagrams: the CMS stores only a key, a runtime-free contract constrains it, and
 * a null-safe registry resolves it to hand-authored {nodes, edges} at render.
 * Hand-authored left→right.
 *
 * Tiered by role: the stored key + the authored data files are `tertiary` (data);
 * the string contract + the registry resolver are `secondary` (processing); the
 * rendered diagram is `primary` (exit).
 */
export const diagramRegistry: GraphData = {
  nodes: [
    { id: 'cms-key', position: { x: 0, y: 120 }, data: { label: 'CMS diagramKey (select)', tier: 'tertiary' } },
    { id: 'keys', position: { x: 280, y: 0 }, data: { label: 'keys.ts (no xyflow)', tier: 'secondary' } },
    { id: 'data', position: { x: 280, y: 220 }, data: { label: 'diagrams/<key>.ts', tier: 'tertiary' } },
    { id: 'registry', position: { x: 560, y: 120 }, data: { label: 'getDiagram registry', tier: 'secondary' } },
    { id: 'client', position: { x: 840, y: 120 }, data: { label: 'GraphClient (ssr:false)', tier: 'primary' } },
  ],
  edges: [
    { id: 'e-key-keys', source: 'cms-key', target: 'keys', label: 'constrained by' },
    { id: 'e-key-registry', source: 'cms-key', target: 'registry', label: 'resolves at render' },
    { id: 'e-data-registry', source: 'data', target: 'registry', label: 'registered in' },
    { id: 'e-registry-client', source: 'registry', target: 'client', label: 'passes {nodes,edges} or null' },
  ],
}

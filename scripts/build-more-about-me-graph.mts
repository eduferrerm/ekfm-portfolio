/**
 * Builds the "More About Me" mental-graph data from the two source CSVs into a
 * committed, positioned graph.json the landing band imports.
 *
 *   scripts/seed/more-about-me/nodes.csv   (id,label,category,description)
 *   scripts/seed/more-about-me/edges.csv   (source,target,relation_context)
 *        │
 *        ▼  parse → validate → dedup → offline d3-force layout → bake x/y
 *   features/landing/more-about-me/graph.json   (MentalGraphData)
 *
 * Why offline: ~400 nodes / ~630 edges. Computing positions here (build time)
 * keeps d3-force out of the client bundle entirely — the browser ships only
 * @xyflow/react + the static JSON, with no runtime layout cost.
 *
 * Run when the CSVs change:  pnpm build:more-about-me-graph
 *
 * Same ESM/tsx bootstrap as the other scripts (no DB — pure file transform).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationNodeDatum,
} from 'd3-force'

import { parseCsv } from '../lib/csv'
import type { MentalEdge, MentalGraphData, MentalNode } from '../features/landing/more-about-me/types'

const SEED_DIR = path.resolve(process.cwd(), 'scripts/seed/more-about-me')
const NODES_CSV = path.join(SEED_DIR, 'nodes.csv')
const EDGES_CSV = path.join(SEED_DIR, 'edges.csv')
const OUT = path.resolve(process.cwd(), 'features/landing/more-about-me/graph.json')

function fail(message: string): never {
  console.error(`✗ ${message}`)
  process.exit(1)
}

/** Read a CSV into objects keyed by (lower-cased) header, requiring `cols`. */
function readTable(file: string, cols: string[]): Record<string, string>[] {
  if (!existsSync(file)) fail(`CSV not found at ${file}`)
  const records = parseCsv(readFileSync(file, 'utf8')).filter((r) => r.some((c) => c.trim() !== ''))
  if (records.length < 2) fail(`${path.basename(file)} has no data rows.`)
  const header = records[0].map((h) => h.trim().toLowerCase())
  const idx = Object.fromEntries(header.map((h, i) => [h, i]))
  for (const col of cols) {
    if (idx[col] === undefined) fail(`${path.basename(file)} missing column "${col}" (header: ${header.join(',')})`)
  }
  return records.slice(1).map((rec) =>
    Object.fromEntries(cols.map((c) => [c, (rec[idx[c]] ?? '').trim()])),
  )
}

// ── Nodes: dedup first-wins, warn on category/description conflicts ────────────
const nodeRows = readTable(NODES_CSV, ['id', 'label', 'category', 'description'])
const nodeById = new Map<string, MentalNode['data'] & { id: string }>()
for (const r of nodeRows) {
  if (!r.id || !r.label) fail(`node row missing id/label: ${JSON.stringify(r)}`)
  const existing = nodeById.get(r.id)
  if (existing) {
    if (existing.category !== r.category) {
      console.warn(
        `⚠ duplicate id "${r.id}" — keeping first category "${existing.category}", dropping "${r.category}"`,
      )
    }
    continue // first-wins
  }
  nodeById.set(r.id, { id: r.id, label: r.label, category: r.category, description: r.description })
}

// ── Edges: drop dangling endpoints, dedup directed pairs ───────────────────────
const edgeRows = readTable(EDGES_CSV, ['source', 'target', 'relation_context'])
const edges: MentalEdge[] = []
const seenPair = new Set<string>()
let dangling = 0
let dupes = 0
for (const r of edgeRows) {
  if (!nodeById.has(r.source) || !nodeById.has(r.target)) {
    dangling++
    continue
  }
  const pair = `${r.source}__${r.target}`
  if (seenPair.has(pair)) {
    dupes++
    continue
  }
  seenPair.add(pair)
  edges.push({ id: `e-${edges.length}`, source: r.source, target: r.target, data: { relation: r.relation_context } })
}
if (dangling) console.warn(`⚠ dropped ${dangling} edge(s) with an endpoint not in nodes`)
if (dupes) console.warn(`⚠ dropped ${dupes} duplicate directed edge(s)`)

// ── Offline force layout ───────────────────────────────────────────────────────
// Pre-seed deterministic ring positions so the simulation starts from a fixed
// state (d3-force's jiggle is the only nondeterminism, and it only perturbs
// coincident nodes — a fixed start keeps re-runs visually stable).
type SimNode = SimulationNodeDatum & { id: string }
const ids = [...nodeById.keys()]
const R = 12 * Math.sqrt(ids.length)
const simNodes: SimNode[] = ids.map((id, i) => ({
  id,
  x: R * Math.cos((2 * Math.PI * i) / ids.length),
  y: R * Math.sin((2 * Math.PI * i) / ids.length),
}))
const simLinks = edges.map((e) => ({ source: e.source, target: e.target }))

const sim = forceSimulation(simNodes)
  .force('charge', forceManyBody().strength(-140))
  .force(
    'link',
    forceLink<SimNode, (typeof simLinks)[number]>(simLinks)
      .id((d) => d.id)
      .distance(70)
      .strength(0.35),
  )
  .force('center', forceCenter(0, 0))
  // Gentle pull to the origin so weakly-connected outliers don't sprawl and drag
  // fitView far out (keeps the core legible at the default zoom).
  .force('x', forceX(0).strength(0.05))
  .force('y', forceY(0).strength(0.05))
  .force('collide', forceCollide(22))
  .stop()

const TICKS = 500
for (let i = 0; i < TICKS; i++) sim.tick()

const posById = new Map(simNodes.map((n) => [n.id, { x: Math.round(n.x ?? 0), y: Math.round(n.y ?? 0) }]))

// ── Emit ───────────────────────────────────────────────────────────────────────
const graph: MentalGraphData = {
  nodes: ids.map((id) => {
    const d = nodeById.get(id)!
    return {
      id,
      position: posById.get(id)!,
      data: { label: d.label, category: d.category, description: d.description },
    }
  }),
  edges,
}

writeFileSync(OUT, JSON.stringify(graph, null, 2) + '\n', 'utf8')
console.log(`✓ wrote ${path.relative(process.cwd(), OUT)} — ${graph.nodes.length} nodes, ${graph.edges.length} edges`)

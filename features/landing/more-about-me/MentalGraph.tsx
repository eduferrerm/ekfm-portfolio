'use client'

import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type EdgeMouseHandler,
  type Node,
  type NodeMouseHandler,
  type NodeProps,
} from '@xyflow/react'
import { memo, useCallback, useMemo, useState } from 'react'

// @xyflow/react ships its own stylesheet; required for nodes/edges to render.
import '@xyflow/react/dist/style.css'

import { cn } from '@/lib/utils'

import graph from './graph.json'
import { CATEGORIES, categoryMeta } from './categoryTier'
import type { MentalGraphData, MentalNodeData } from './types'

const DATA = graph as MentalGraphData

// Edges connect to handles; a custom node with no <Handle> draws no edges at all.
// These are present-but-invisible (no drag/connect) so the relationships render.
const HANDLE = 'opacity-0 !pointer-events-none'

/**
 * One concept node — a pill coloured by its category (`--node`, set via the
 * category's varClass). Rest: tinted fill + on-colour border/text. Hover
 * (CSS-only, no re-render): the fill becomes the solid colour, the label flips
 * dark, it scales 1.2× and gets a coloured glow so it pops. The "dim everything
 * else" half is a `:has()` rule on the wrapper (globals.css) — beyond a Tailwind
 * utility, and xyflow owns those class names.
 */
const MentalNode = memo(function MentalNode({ data }: NodeProps) {
  const d = data as MentalNodeData
  return (
    <div
      className={cn(
        'rounded-full border px-2 py-0.5 text-[10px] font-medium leading-none whitespace-nowrap transition duration-150',
        'border-[var(--node)] text-[var(--node)] bg-[color-mix(in_oklch,var(--node)_22%,var(--color-card))]',
        'hover:scale-[1.2] hover:bg-[var(--node)] hover:text-[var(--color-primary-foreground)] hover:shadow-[0_0_20px_-2px_var(--node)]',
        categoryMeta(d.category).varClass,
      )}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} className={HANDLE} />
      {d.label}
      <Handle type="source" position={Position.Bottom} isConnectable={false} className={HANDLE} />
    </div>
  )
})

const nodeTypes = { mental: MentalNode }
// Straight edges are far cheaper than the default bezier at ~630 edges, and read
// cleaner as a relationship web.
const defaultEdgeOptions = { type: 'straight' as const }

/** Colour key — the 13 categories with their swatch. Visual only (pointer-events
 * pass through to the graph beneath). */
function Legend() {
  return (
    <div className="pointer-events-none absolute left-3 top-3 grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg border border-border bg-card/85 p-2.5">
      {CATEGORIES.map((c) => (
        <div key={c.key} className={cn('flex items-center gap-1.5', c.varClass)}>
          <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--node)]" />
          <span className="text-[10px] leading-none text-muted-foreground">{c.label}</span>
        </div>
      ))}
    </div>
  )
}

type Hover =
  | { kind: 'node'; title: string; categoryKey: string; body: string }
  | { kind: 'edge'; title: string; body: string }
  | null

/**
 * The interactive mental-graph map (~400 nodes / ~630 edges). Positions are
 * precomputed (graph.json); this only renders + themes. Reached through
 * MentalGraphClient (`ssr:false`) — the @xyflow/react bundle stays client-only.
 *
 * Tuned for an embedded landing canvas: nodes are fixed (no drag/connect), wheel
 * scroll passes through to the page (zoom via the Controls or pinch), and hovering
 * a node/edge surfaces its detail in a corner panel. Category lives on every node,
 * so a tier/category filter can layer on later without touching the data.
 *
 * Perf: nodes/edges/handlers are referentially stable so a hover (parent state)
 * never re-renders the canvas; straight edges + onlyRenderVisibleElements keep the
 * frame cost down. (Dev is still heavier than the production build.)
 */
export function MentalGraph() {
  const [hover, setHover] = useState<Hover>(null)

  const nodes = useMemo<Node[]>(
    () => DATA.nodes.map((n) => ({ id: n.id, position: n.position, data: n.data, type: 'mental' })),
    [],
  )
  const edges = useMemo<Edge[]>(
    () => DATA.edges.map((e) => ({ id: e.id, source: e.source, target: e.target, data: e.data })),
    [],
  )

  const onNodeEnter = useCallback<NodeMouseHandler>((_, n) => {
    const d = n.data as MentalNodeData
    setHover({ kind: 'node', title: d.label, categoryKey: d.category, body: d.description })
  }, [])
  const onEdgeEnter = useCallback<EdgeMouseHandler>((_, e) => {
    const rel = (e.data as { relation?: string } | undefined)?.relation
    if (rel) setHover({ kind: 'edge', title: 'Connection', body: rel })
  }, [])
  const clearHover = useCallback(() => setHover(null), [])

  return (
    <div className="mental-graph relative h-full w-full [--xy-controls-button-background-color-hover:var(--color-muted)] [--xy-controls-button-background-color:var(--color-card)] [--xy-controls-button-border-color:var(--color-border)] [--xy-controls-button-color-hover:var(--color-foreground)] [--xy-controls-button-color:var(--color-foreground)] [--xy-edge-stroke:var(--color-border)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        nodeOrigin={[0.5, 0.5]}
        fitView
        minZoom={0.05}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        preventScrolling={false}
        onlyRenderVisibleElements
        onNodeMouseEnter={onNodeEnter}
        onNodeMouseLeave={clearHover}
        onEdgeMouseEnter={onEdgeEnter}
        onEdgeMouseLeave={clearHover}
      >
        <Background color="var(--color-muted)" gap={28} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>

      <Legend />

      {hover && (
        <div className="pointer-events-none absolute right-4 bottom-4 max-w-xs rounded-lg border border-border bg-card/95 p-3 shadow-lg">
          {hover.kind === 'node' ? (
            <>
              <p className="text-meta-bold text-foreground">{hover.title}</p>
              <p className={cn('text-meta', categoryMeta(hover.categoryKey).varClass, 'text-[var(--node)]')}>
                {categoryMeta(hover.categoryKey).label}
              </p>
              <p className="mt-1 text-meta text-muted-foreground">{hover.body}</p>
            </>
          ) : (
            <>
              <p className="text-meta-bold text-foreground">{hover.title}</p>
              <p className="mt-1 text-meta text-muted-foreground">{hover.body}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

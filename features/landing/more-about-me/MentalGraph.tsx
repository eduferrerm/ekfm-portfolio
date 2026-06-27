'use client'

import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import { useMemo, useState } from 'react'

// @xyflow/react ships its own stylesheet; required for nodes/edges to render.
import '@xyflow/react/dist/style.css'

import { cn } from '@/lib/utils'

import graph from './graph.json'
import { TIER_LABEL, TIER_NODE, TIER_TEXT, type Tier, tierOf } from './categoryTier'
import type { MentalGraphData, MentalNodeData } from './types'

const DATA = graph as MentalGraphData

/** One concept node — a tinted pill coloured by its category's brand tier. */
function MentalNode({ data }: NodeProps) {
  const d = data as MentalNodeData
  return (
    <div
      className={cn(
        'rounded-full border px-2 py-0.5 text-[10px] font-medium leading-none whitespace-nowrap',
        TIER_NODE[tierOf(d.category)],
      )}
    >
      {d.label}
    </div>
  )
}

const nodeTypes = { mental: MentalNode }

type Hover =
  | { kind: 'node'; title: string; tier: Tier; body: string }
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

  return (
    <div className="relative h-full w-full [--xy-controls-button-background-color-hover:var(--color-muted)] [--xy-controls-button-background-color:var(--color-card)] [--xy-controls-button-border-color:var(--color-border)] [--xy-controls-button-color-hover:var(--color-foreground)] [--xy-controls-button-color:var(--color-foreground)] [--xy-edge-stroke:var(--color-border)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
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
        onNodeMouseEnter={(_, n) => {
          const d = n.data as MentalNodeData
          setHover({ kind: 'node', title: d.label, tier: tierOf(d.category), body: d.description })
        }}
        onNodeMouseLeave={() => setHover(null)}
        onEdgeMouseEnter={(_, e) => {
          const rel = (e.data as { relation?: string } | undefined)?.relation
          if (rel) setHover({ kind: 'edge', title: 'Connection', body: rel })
        }}
        onEdgeMouseLeave={() => setHover(null)}
      >
        <Background color="var(--color-muted)" gap={28} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>

      {hover && (
        <div className="pointer-events-none absolute bottom-4 left-4 max-w-xs rounded-lg border border-border bg-card/95 p-3 shadow-lg">
          {hover.kind === 'node' ? (
            <>
              <p className="text-meta-bold text-foreground">{hover.title}</p>
              <p className={cn('text-meta', TIER_TEXT[hover.tier])}>{TIER_LABEL[hover.tier]}</p>
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

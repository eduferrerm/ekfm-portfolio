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
  type ReactFlowInstance,
} from '@xyflow/react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// @xyflow/react ships its own stylesheet; required for nodes/edges to render.
import '@xyflow/react/dist/style.css'

import { Button } from '@/components/ui/button'
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
        'cursor-pointer rounded-full border px-2 py-0.5 text-[10px] font-medium leading-none whitespace-nowrap transition duration-150',
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

/**
 * Category filter chips — also the colour key (each chip carries its category's
 * colour + node count). Inactive = coloured outline; active = filled + dark label.
 * Selecting one filters the graph to that category; selecting it again clears.
 */
function FilterChips({
  active,
  counts,
  onToggle,
}: {
  active: string | null
  counts: Record<string, number>
  onToggle: (key: string) => void
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2 p-6">
      {CATEGORIES.map((c) => {
        const on = active === c.key
        return (
          <button
            key={c.key}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(c.key)}
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-600 py-1 pr-1.5 pl-3 text-meta-bold transition',
              c.varClass,
              on
                ? 'bg-[var(--node)] text-[var(--color-primary-foreground)]'
                : 'bg-transparent text-foreground hover:bg-[color-mix(in_oklch,var(--node)_15%,transparent)] hover:text-[var(--node-soft)]',
            )}
          >
            {c.label}
            <span
              className={cn(
                'inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] leading-none',
                on
                  ? 'bg-[var(--color-primary-foreground)] text-[var(--node)]'
                  : 'bg-[var(--node)] text-[var(--color-primary-foreground)]',
              )}
            >
              {counts[c.key] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}

type Hover =
  // Node hovers carry the hovered pill's screen position (relative to the graph
  // container) so the descriptor renders right under the node; edge hovers fall back
  // to the corner card (an edge has no single anchor point).
  | { kind: 'node'; title: string; categoryKey: string; body: string; x: number; y: number }
  | { kind: 'edge'; title: string; body: string }
  | null

/**
 * The interactive mental-graph map (~400 nodes / ~660 edges). Positions are
 * precomputed (graph.json); this only renders + themes. Reached through
 * MentalGraphClient (`ssr:false`) — the @xyflow/react bundle stays client-only.
 *
 * Two ways to cut the busyness, which compose:
 *  - Category chips (top) filter to a single category (click again to clear).
 *  - Press-to-focus: clicking a node isolates it + its directly-connected
 *    neighbours; clicking empty canvas restores. Both auto-zoom to what's shown.
 *
 * Perf: nodes/edges/handlers are referentially stable so a hover never re-renders
 * the canvas — and with nothing filtered/focused the arrays keep their identity, so
 * only a discrete click pays a re-render. Straight edges + onlyRenderVisibleElements
 * keep the frame cost down. (Dev is heavier than the production build.)
 */
export function MentalGraph() {
  const [hover, setHover] = useState<Hover>(null)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const rf = useRef<ReactFlowInstance | null>(null)
  // The `.mental-graph` box — the positioning context for the under-node descriptor.
  const containerRef = useRef<HTMLDivElement | null>(null)

  const baseNodes = useMemo<Node[]>(
    () => DATA.nodes.map((n) => ({ id: n.id, position: n.position, data: n.data, type: 'mental' })),
    [],
  )
  const baseEdges = useMemo<Edge[]>(
    () => DATA.edges.map((e) => ({ id: e.id, source: e.source, target: e.target, data: e.data })),
    [],
  )

  // Built once: undirected adjacency (focus neighbourhood) + ids per category.
  const adjacency = useMemo(() => {
    const m = new Map<string, Set<string>>()
    const link = (a: string, b: string) => (m.get(a) ?? m.set(a, new Set()).get(a)!).add(b)
    for (const e of DATA.edges) {
      link(e.source, e.target)
      link(e.target, e.source)
    }
    return m
  }, [])
  const byCategory = useMemo(() => {
    const m = new Map<string, Set<string>>()
    for (const n of DATA.nodes) {
      ;(m.get(n.data.category) ?? m.set(n.data.category, new Set()).get(n.data.category)!).add(n.id)
    }
    return m
  }, [])
  const counts = useMemo(() => {
    const o: Record<string, number> = {}
    byCategory.forEach((s, k) => (o[k] = s.size))
    return o
  }, [byCategory])

  // The visible set = category filter ∩ focus neighbourhood (null = show all).
  const visible = useMemo(() => {
    if (!activeCategory && !focusedId) return null
    let set: Set<string> | null = activeCategory
      ? (byCategory.get(activeCategory) ?? new Set())
      : null
    if (focusedId) {
      const nb = new Set<string>([focusedId])
      adjacency.get(focusedId)?.forEach((id) => nb.add(id))
      set = set ? new Set([...set].filter((id) => nb.has(id))) : nb
    }
    return set
  }, [activeCategory, focusedId, byCategory, adjacency])

  // Toggle `hidden` only when something is filtered/focused; otherwise hand back the
  // stable base arrays (same refs → no re-render churn for the common case).
  const nodes = useMemo<Node[]>(
    () => (visible ? baseNodes.map((n) => ({ ...n, hidden: !visible.has(n.id) })) : baseNodes),
    [visible, baseNodes],
  )
  const edges = useMemo<Edge[]>(() => {
    if (!visible) return baseEdges
    return baseEdges.map((e) => {
      const bothShown = visible.has(e.source) && visible.has(e.target)
      const focusOk = !focusedId || e.source === focusedId || e.target === focusedId
      return { ...e, hidden: !(bothShown && focusOk) }
    })
  }, [visible, focusedId, baseEdges])

  // Smooth-zoom to whatever is shown (filtered/focused subset, or the whole graph).
  useEffect(() => {
    const inst = rf.current
    if (!inst) return
    if (visible)
      inst.fitView({ nodes: [...visible].map((id) => ({ id })), padding: 0.3, duration: 400 })
    else inst.fitView({ duration: 400 })
  }, [visible])

  // Full-screen overlay modal affordances — Escape closes, lock background scroll.
  // (Site convention: MenuOverlay / SearchPalette.)
  useEffect(() => {
    if (!expanded) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [expanded])

  const onToggleCategory = useCallback((key: string) => {
    setFocusedId(null)
    setActiveCategory((a) => (a === key ? null : key))
  }, [])
  const onNodeClick = useCallback<NodeMouseHandler>((_, n) => setFocusedId(n.id), [])
  const onPaneClick = useCallback(() => setFocusedId(null), [])

  const onNodeEnter = useCallback<NodeMouseHandler>((event, n) => {
    const d = n.data as MentalNodeData
    const container = containerRef.current
    const nodeEl = (event.target as HTMLElement).closest('.react-flow__node')
    if (!container || !nodeEl) return
    // Anchor the descriptor to the node's bottom-centre, in the container's own
    // coordinate space (screen px) — so it stays a fixed, readable size regardless
    // of the canvas zoom, rather than scaling with the node.
    const c = container.getBoundingClientRect()
    const r = nodeEl.getBoundingClientRect()
    setHover({
      kind: 'node',
      title: d.label,
      categoryKey: d.category,
      body: d.description,
      x: r.left + r.width / 2 - c.left,
      y: r.bottom - c.top,
    })
  }, [])
  const onEdgeEnter = useCallback<EdgeMouseHandler>((_, e) => {
    const rel = (e.data as { relation?: string } | undefined)?.relation
    if (rel) setHover({ kind: 'edge', title: 'Connection', body: rel })
  }, [])
  const clearHover = useCallback(() => setHover(null), [])

  const content = (
    <div className="flex h-full w-full flex-col">
      <div
        ref={containerRef}
        className="mental-graph relative min-h-0 flex-1 select-none [--xy-controls-button-background-color-hover:var(--color-muted)] [--xy-controls-button-background-color:var(--color-card)] [--xy-controls-button-border-color:var(--color-border)] [--xy-controls-button-color-hover:var(--color-primary)] [--xy-controls-button-color:var(--color-primary)] [--xy-edge-stroke:var(--color-border)]"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          nodeOrigin={[0.5, 0.5]}
          proOptions={{ hideAttribution: true }}
          fitView
          minZoom={0.05}
          maxZoom={2}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          // Wheel-zoom only in the full-screen overlay. Inline it stays off so a
          // page scroll over the hero map isn't trapped here; expanded there's no
          // page to scroll past (body scroll is locked), so the gesture is safe.
          zoomOnScroll={expanded}
          panOnScroll={false}
          preventScrolling={expanded}
          onlyRenderVisibleElements
          onInit={(inst) => {
            rf.current = inst
          }}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onNodeMouseEnter={onNodeEnter}
          onNodeMouseLeave={clearHover}
          onEdgeMouseEnter={onEdgeEnter}
          onEdgeMouseLeave={clearHover}
        >
          <Background color="var(--color-muted)" gap={28} size={1} />
          <Controls showInteractive={false} position="top-left" />
        </ReactFlow>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? 'Exit full screen' : 'Expand to full screen'}
          aria-pressed={expanded}
          className="absolute top-2 right-2 z-10 bg-card/80 text-primary"
        >
          {expanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>

        {/* Node descriptor — anchored just under the hovered pill. `left/top` are the
            only dynamic bits (computed screen coords); everything visual is Tailwind.
            `-translate-x-1/2` centres it on the node; `mt-2` clears the hover pop. */}
        {hover?.kind === 'node' && (
          <div
            className="pointer-events-none absolute z-10 mt-2 w-56 max-w-[60vw] -translate-x-1/2 rounded-lg border border-border bg-card/95 p-3 shadow-lg"
            style={{ left: hover.x, top: hover.y }}
          >
            <p className="text-meta-bold text-foreground">{hover.title}</p>
            <p
              className={cn('text-meta', categoryMeta(hover.categoryKey).varClass, 'text-[var(--node)]')}
            >
              {categoryMeta(hover.categoryKey).label}
            </p>
            <p className="mt-1 text-meta text-muted-foreground">{hover.body}</p>
          </div>
        )}

        {hover?.kind === 'edge' && (
          <div className="pointer-events-none absolute right-4 bottom-4 max-w-xs rounded-lg border border-border bg-card/95 p-3 shadow-lg">
            <p className="text-meta-bold text-foreground">{hover.title}</p>
            <p className="mt-1 text-meta text-muted-foreground">{hover.body}</p>
          </div>
        )}
      </div>

      <FilterChips active={activeCategory} counts={counts} onToggle={onToggleCategory} />
    </div>
  )

  // Portaling the SINGLE rendered instance (not a second copy) preserves the
  // active filter / focus / hover across expand+collapse and avoids re-rendering
  // ~400 nodes twice. Portal to <body>: the sticky landing nav's backdrop-blur
  // would otherwise trap a `fixed` overlay. fitView re-runs on remount.
  if (!expanded) return content

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="More about me — mental map"
      className="fixed inset-0 z-50 bg-sunken"
    >
      {content}
    </div>,
    document.body,
  )
}

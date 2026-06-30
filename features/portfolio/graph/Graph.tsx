'use client'

import { Background, Controls, ReactFlow, type Node, type NodeMouseHandler } from '@xyflow/react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

// @xyflow/react ships its own stylesheet; required for nodes/edges to render.
import '@xyflow/react/dist/style.css'

import { Button } from '@/components/ui/button'
import { capture } from '@/lib/posthog/client'
import { AnalyticsEvent } from '@/lib/posthog/events'

import { SystemNode } from './SystemNode'
import type { GraphData, SystemNodeData } from './types'

export type GraphProps = GraphData

const nodeTypes = { system: SystemNode }

// xyflow's own theming vars, re-skinned to the design-system roles (card / border /
// foreground) so the zoom controls + edges match the landing map and the brand
// sheet rather than xyflow's stock white chrome.
const FLOW_THEME =
  '[--xy-controls-button-background-color-hover:var(--color-muted)] ' +
  '[--xy-controls-button-background-color:var(--color-card)] ' +
  '[--xy-controls-button-border-color:var(--color-border)] ' +
  '[--xy-controls-button-color-hover:var(--color-primary)] ' +
  '[--xy-controls-button-color:var(--color-primary)] ' +
  '[--xy-edge-stroke:var(--color-border)] ' +
  // Edge relationship labels — re-skin off xyflow's stock white box.
  '[--xy-edge-label-background-color:var(--color-card)] ' +
  '[--xy-edge-label-color:var(--color-muted-foreground)]'

/**
 * The interactive flow canvas, shared by the inline diagram and its full-screen
 * overlay. Each mount carries `fitView`, so opening the overlay re-fits the graph
 * to the larger viewport with no manual recentring.
 */
function FlowCanvas({
  nodes,
  edges,
  expanded,
  onToggle,
}: GraphProps & { expanded: boolean; onToggle: () => void }) {
  // The diagrams author plain nodes; the shared renderer paints them as branded
  // pills by stamping every node with our custom `system` type.
  const typedNodes = useMemo<Node[]>(() => nodes.map((n) => ({ ...n, type: 'system' })), [nodes])

  // Diagram nodes aren't navigational, but a click is a genuine "they poked at
  // the system design" interest signal worth capturing (no behaviour change).
  const onNodeClick = useCallback<NodeMouseHandler>((_, node) => {
    const data = node.data as SystemNodeData | undefined
    capture(AnalyticsEvent.GraphNodeClicked, {
      nodeId: node.id,
      nodeType: data?.tier,
      label: data?.label,
      graph: 'portfolio',
    })
  }, [])

  return (
    <div className={`relative h-full w-full ${FLOW_THEME}`}>
      <ReactFlow
        nodes={typedNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <Background color="var(--color-muted)" gap={28} size={1} />
        <Controls showInteractive={false} position="top-left" />
      </ReactFlow>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-label={expanded ? 'Exit full screen' : 'Expand to full screen'}
        aria-pressed={expanded}
        className="absolute top-2 right-2 z-10 bg-card/80 text-primary"
      >
        {expanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
      </Button>
    </div>
  )
}

/**
 * The actual interactive graph. Never imported directly into a Server
 * Component — always reached through GraphClient, which loads it with
 * `ssr:false` (see CLAUDE.md NOSSR rule for @xyflow/react).
 *
 * The corner button expands the canvas into a full-viewport portal overlay
 * (the site's MenuOverlay / SearchPalette convention: portal to <body>,
 * `fixed inset-0`, `bg-sunken`, Escape closes, background scroll locked).
 */
export function Graph({ nodes, edges }: GraphProps) {
  const [expanded, setExpanded] = useState(false)

  // Modal affordances while the overlay is open — Escape closes, lock page scroll.
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

  return (
    <>
      <FlowCanvas nodes={nodes} edges={edges} expanded={false} onToggle={() => setExpanded(true)} />

      {expanded &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="System design diagram"
            className="fixed inset-0 z-50 bg-sunken"
          >
            <FlowCanvas nodes={nodes} edges={edges} expanded onToggle={() => setExpanded(false)} />
          </div>,
          document.body,
        )}
    </>
  )
}

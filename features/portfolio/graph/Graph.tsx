'use client'

import {
  ReactFlow,
  Background,
  Controls,
  type Edge,
  type Node,
} from '@xyflow/react'

// @xyflow/react ships its own stylesheet; required for nodes/edges to render.
import '@xyflow/react/dist/style.css'

export type GraphProps = {
  nodes: Node[]
  edges: Edge[]
}

/**
 * The actual interactive graph. Never imported directly into a Server
 * Component — always reached through GraphClient, which loads it with
 * `ssr:false` (see CLAUDE.md NOSSR rule for @xyflow/react).
 */
export function Graph({ nodes, edges }: GraphProps) {
  return (
    <ReactFlow nodes={nodes} edges={edges} fitView>
      <Background />
      <Controls />
    </ReactFlow>
  )
}

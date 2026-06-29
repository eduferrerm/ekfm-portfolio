'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { memo } from 'react'

import { cn } from '@/lib/utils'

import type { NodeTier, SystemNodeData } from './types'

// Edges connect to handles; a custom node with no <Handle> draws no edges at all.
// These are present-but-invisible (no drag/connect). The diagrams flow left→right,
// so edges enter the Left (target) handle and leave the Right (source) handle.
const HANDLE = 'opacity-0 !pointer-events-none'

// Map each brand tier to its semantic colour token, set on `--tier` so the pill's
// border / label / tinted fill all read one value. STATIC literals — the Tailwind
// scanner needs to see the arbitrary-property classes spelled out.
const TIER_CLASS: Record<NodeTier, string> = {
  primary: '[--tier:var(--color-primary)]', // lime — entry / exit points
  secondary: '[--tier:var(--color-selection)]', // blue — processing steps
  tertiary: '[--tier:var(--color-accent)]', // fuchsia — data stores
}

/**
 * One system-design node — a pill coloured by its brand tier (`--tier`, set via
 * {@link TIER_CLASS}). Tinted fill + on-colour border/label, mirroring the
 * More-About-Me map's node treatment but with the three brand hues rather than the
 * 13-colour category scale. No hover pop: these diagrams are small and static.
 */
export const SystemNode = memo(function SystemNode({ data }: NodeProps) {
  const d = data as SystemNodeData
  return (
    <div
      className={cn(
        'rounded-md border px-3 py-1.5 text-meta-bold whitespace-nowrap',
        'border-[var(--tier)] text-[var(--tier)] bg-[color-mix(in_oklch,var(--tier)_18%,var(--color-card))]',
        TIER_CLASS[d.tier ?? 'primary'],
      )}
    >
      <Handle type="target" position={Position.Left} isConnectable={false} className={HANDLE} />
      {d.label}
      <Handle type="source" position={Position.Right} isConnectable={false} className={HANDLE} />
    </div>
  )
})

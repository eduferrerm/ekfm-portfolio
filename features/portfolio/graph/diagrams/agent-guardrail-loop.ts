import type { GraphData } from '../types'

/**
 * "Agent Guardrail Loop" — how a coding agent ships changes without drifting the
 * codebase: a thin resident contract + read-on-demand docs guide it, codegen and
 * commit-time hooks block drift, and merged decisions feed back into the docs.
 * Hand-authored left→right.
 *
 * Tiered by role: the contract + docs are `tertiary` (the knowledge stores);
 * the codegen + guard steps are `secondary` (processing); the agent and the
 * merged change are `primary` (entry / exit).
 */
export const agentGuardrailLoop: GraphData = {
  nodes: [
    { id: 'claude-md', position: { x: 0, y: 0 }, data: { label: 'CLAUDE.md (resident)', tier: 'tertiary' } },
    { id: 'docs', position: { x: 0, y: 200 }, data: { label: 'docs/ ARCH + RUNBOOK', tier: 'tertiary' } },
    { id: 'agent', position: { x: 300, y: 100 }, data: { label: 'Agent (Claude Code)', tier: 'primary' } },
    { id: 'codegen', position: { x: 600, y: 0 }, data: { label: 'codegen (types/tokens)', tier: 'secondary' } },
    { id: 'hooks', position: { x: 600, y: 200 }, data: { label: 'pre-commit hooks', tier: 'secondary' } },
    { id: 'repo', position: { x: 900, y: 100 }, data: { label: 'repo / PR (decisions)', tier: 'primary' } },
  ],
  edges: [
    { id: 'e-claude-agent', source: 'claude-md', target: 'agent', label: 'loads every turn' },
    { id: 'e-docs-agent', source: 'docs', target: 'agent', label: 'reads before risky work' },
    { id: 'e-agent-codegen', source: 'agent', target: 'codegen', label: 'runs after edits' },
    { id: 'e-agent-hooks', source: 'agent', target: 'hooks', label: 'commit attempt' },
    { id: 'e-codegen-hooks', source: 'codegen', target: 'hooks', label: 'staleness checked' },
    { id: 'e-hooks-repo', source: 'hooks', target: 'repo', label: 'blocks drift, else commits' },
    { id: 'e-repo-docs', source: 'repo', target: 'docs', label: 'decisions feed back' },
  ],
}

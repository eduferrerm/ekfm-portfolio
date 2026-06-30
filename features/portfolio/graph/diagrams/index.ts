import type { GraphData } from '../types'
import type { DiagramKey } from './keys'
import { contextAwareRoutes } from './context-aware-routes'
import { designSystemSsot } from './design-system-ssot'
import { keywordRecallLanes } from './keyword-recall-lanes'
import { seedPipeline } from './seed-pipeline'
import { mentalGraphRender } from './mental-graph-render'
import { diagramRegistry } from './diagram-registry'
import { searchCorpus } from './search-corpus'
import { agentGuardrailLoop } from './agent-guardrail-loop'
import { websiteStack } from './website-stack'

/**
 * Maps each {@link DiagramKey} to its hand-authored graph data. The Portfolio
 * `features[].diagramKey` select stores only the key; this resolves it at render
 * time on the server, then the plain `{nodes, edges}` is passed to GraphClient.
 */
const registry: Record<DiagramKey, GraphData> = {
  'context-aware-routes': contextAwareRoutes,
  'design-system-ssot': designSystemSsot,
  'keyword-recall-lanes': keywordRecallLanes,
  'seed-pipeline': seedPipeline,
  'mental-graph-render': mentalGraphRender,
  'diagram-registry': diagramRegistry,
  'search-corpus': searchCorpus,
  'agent-guardrail-loop': agentGuardrailLoop,
  'website-stack': websiteStack,
}

/**
 * Resolve a feature's `diagramKey` to its graph data. Returns `null` for an
 * unknown/empty key (warns in dev) so a stale key degrades to "no diagram"
 * rather than throwing during a build/ISR render.
 */
export function getDiagram(key?: string | null): GraphData | null {
  if (!key) return null
  const data = registry[key as DiagramKey]
  if (!data) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[portfolio/graph] unknown diagramKey: "${key}"`)
    }
    return null
  }
  return data
}

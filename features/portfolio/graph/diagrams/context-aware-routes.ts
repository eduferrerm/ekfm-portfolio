import type { GraphData } from '../types'

/**
 * "Context Aware Routes" — how a visiting company resolves to a personalised
 * page. Hand-authored: node positions are deliberate (left-to-right flow), not
 * auto-laid-out, because the layout itself tells the architecture story.
 *
 * Nodes are tiered by role so the three brand hues carry meaning: entry/exit
 * points (Visitor, Personalised page) are `primary` (lime), processing steps
 * (route, ISR) are `secondary` (blue), and the data store (Visitors collection)
 * is `tertiary` (fuchsia).
 */
export const contextAwareRoutes: GraphData = {
  nodes: [
    { id: 'visitor', position: { x: 0, y: 80 }, data: { label: 'Visitor', tier: 'primary' } },
    { id: 'route', position: { x: 220, y: 80 }, data: { label: '/dear/[company]', tier: 'secondary' } },
    { id: 'isr', position: { x: 460, y: 0 }, data: { label: 'On-demand ISR', tier: 'secondary' } },
    { id: 'visitors', position: { x: 460, y: 160 }, data: { label: 'Visitors collection', tier: 'tertiary' } },
    { id: 'page', position: { x: 700, y: 80 }, data: { label: 'Personalised page', tier: 'primary' } },
  ],
  edges: [
    { id: 'e-visitor-route', source: 'visitor', target: 'route', label: 'requests' },
    { id: 'e-route-isr', source: 'route', target: 'isr', label: 'renders via' },
    { id: 'e-route-visitors', source: 'route', target: 'visitors', label: 'looks up' },
    { id: 'e-visitors-page', source: 'visitors', target: 'page', label: 'hydrates' },
    { id: 'e-isr-page', source: 'isr', target: 'page', label: 'caches' },
  ],
}

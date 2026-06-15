/**
 * Registry of diagram keys a feature can be authored against.
 *
 * Deliberately free of any `@xyflow/react` import: this module feeds the Payload
 * `features[].diagramKey` select, so it must never drag the graph runtime into
 * the admin bundle. The diagram *data* lives in `./<key>.ts` and is wired up in
 * `./index.ts`; this is just the string contract shared between CMS and code.
 */
export const DIAGRAM_KEYS = ['context-aware-routes'] as const

export type DiagramKey = (typeof DIAGRAM_KEYS)[number]

/** Options for the Portfolio `features[].diagramKey` select (value === key). */
export const DIAGRAM_OPTIONS = DIAGRAM_KEYS.map((key) => ({ label: key, value: key }))

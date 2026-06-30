import type { GraphData } from '../types'

/**
 * "Website Stack" — the hosting + data topology: a serverless app on Vercel reads
 * Payload in-process (no network hop), with state split across Railway Postgres
 * and Vercel Blob, and analytics reverse-proxied to PostHog. Hand-authored.
 *
 * Tiered by role: the stateful stores (Postgres, Blob, PostHog) are `tertiary`;
 * Vercel + the in-process Local API are `secondary` (processing); the browser
 * and the rendered page are `primary` (entry / exit).
 */
export const websiteStack: GraphData = {
  nodes: [
    { id: 'browser', position: { x: 0, y: 120 }, data: { label: 'Browser / recruiter', tier: 'primary' } },
    { id: 'vercel', position: { x: 280, y: 120 }, data: { label: 'Vercel (Next + Payload)', tier: 'secondary' } },
    { id: 'local-api', position: { x: 560, y: 20 }, data: { label: 'Local API (in-process)', tier: 'secondary' } },
    { id: 'postgres', position: { x: 840, y: 20 }, data: { label: 'Railway Postgres', tier: 'tertiary' } },
    { id: 'blob', position: { x: 560, y: 200 }, data: { label: 'Vercel Blob (media)', tier: 'tertiary' } },
    { id: 'page', position: { x: 840, y: 200 }, data: { label: 'Rendered page (ISR)', tier: 'primary' } },
    { id: 'posthog', position: { x: 280, y: 280 }, data: { label: 'PostHog (via /ingest)', tier: 'tertiary' } },
  ],
  edges: [
    { id: 'e-browser-vercel', source: 'browser', target: 'vercel', label: 'requests' },
    { id: 'e-vercel-api', source: 'vercel', target: 'local-api', label: 'reads in-process' },
    { id: 'e-api-postgres', source: 'local-api', target: 'postgres', label: 'queries content' },
    { id: 'e-vercel-blob', source: 'vercel', target: 'blob', label: 'serves media bytes' },
    { id: 'e-vercel-page', source: 'vercel', target: 'page', label: 'emits (ISR-cached)' },
    { id: 'e-browser-posthog', source: 'browser', target: 'posthog', label: 'events via /ingest' },
  ],
}

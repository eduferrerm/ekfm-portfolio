/**
 * Types + loader for Portfolio (feature-detail) content. The DATA lives in
 * scripts/seed/portfolio.json (the version-controlled SSOT); this module only
 * defines its shape and reads it.
 *
 * Round-trip (mirrors keywords.csv ⇄ DB):
 *   - `pnpm seed:portfolio`   JSON → DB  (idempotent upsert by slug)
 *   - `pnpm export:portfolio` DB → JSON  (capture CMS edits, commit the diff)
 *
 * Why JSON, not a TS literal or a CSV: rows are deeply nested (overview +
 * keyDecisions/points) so a flat CSV can't hold them, while JSON is both
 * human-diffable AND machine-writable by the export — which a hand-formatted TS
 * literal is not. Keyword/relatedContent links are stored by stable key/slug and
 * resolved to numeric IDs at seed time, so the JSON survives a rebuild.
 *
 * Authoring rules (match across all features for the uniform-height slider):
 *   - keyDecisions: max 5 per feature
 *   - each decision: `description` = "the idea" (renders left), `points` = the
 *     conclusion (max 3 bullets, ~102 words total, renders right)
 *   - `conclusion` is 'up' (adopted); rejected alternatives live in the points
 *   - slide `title` ≤ 5 words; feature `title` kept short (eyebrow gives context)
 *   - `slug` is pinned explicitly so it never drifts when the title changes
 *   - keyword fields hold keyword `key`s (see scripts/seed/keywords.csv)
 *   - `spotlight` must be a subset of scope ∪ craft, max 5
 *   - `thumbnail` is intentionally absent: assigned in the CMS, preserved across
 *     reseeds (the seeder never writes the field), never serialized here
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

export type Conclusion = 'up' | 'down' | 'none'

export type PortfolioSeedDecision = {
  title: string
  conclusion: Conclusion
  description?: string
  points: string[]
}

export type PortfolioSeedRelated = {
  relationTo: 'portfolio' | 'experience'
  slug: string
}

export type PortfolioSeedEntry = {
  slug: string
  order?: number
  eyebrow: string
  title: string
  summary: string
  diagramKey: string
  overview: string[]
  /** null clears any stale value so the page falls back to `eyebrow`. */
  keyDecisionsTitle?: string | null
  keyDecisions: PortfolioSeedDecision[]
  scope: string[]
  craft: string[]
  spotlight: string[]
  searchKeywords?: string[]
  relatedContent?: PortfolioSeedRelated[]
}

const JSON_PATH = path.resolve(process.cwd(), 'scripts/seed/portfolio.json')

/** Read + parse the portfolio content SSOT. */
export function loadPortfolioContent(): PortfolioSeedEntry[] {
  return JSON.parse(readFileSync(JSON_PATH, 'utf8')) as PortfolioSeedEntry[]
}

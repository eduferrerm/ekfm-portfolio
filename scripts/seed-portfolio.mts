/**
 * Seeds Portfolio (feature-detail) content from scripts/seed/portfolio-content.ts
 * into the DB via the Payload Local API. Idempotent: upserts by the stable
 * `slug`, so re-running updates in place rather than duplicating.
 *
 *   pnpm seed:portfolio
 *   # or: node --env-file=.env.local --import tsx/esm scripts/seed-portfolio.mts
 *
 * Keyword/relatedContent links are authored by stable key/slug in the data file
 * and resolved to numeric IDs here. A missing keyword key or related slug is a
 * hard error (we never silently drop a relationship). Run `pnpm seed:keywords`
 * first so every referenced keyword exists.
 *
 * Same ESM/tsx bootstrap as the keyword seeder (Node 24 can't require() the
 * lexical config — see scripts/generate-types.mts).
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { PORTFOLIO_CONTENT, type PortfolioSeedEntry } from './seed/portfolio-content'

const configPath = pathToFileURL(path.resolve(process.cwd(), 'payload.config.ts')).href
const config = await (await import(configPath)).default
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

// --- Resolve keyword keys → numeric IDs ------------------------------------
const { docs: keywordDocs } = await payload.find({
  collection: 'keywords',
  depth: 0,
  pagination: false,
  limit: 0,
})
const keywordIdByKey = new Map<string, number>()
for (const k of keywordDocs) {
  if (k.key) keywordIdByKey.set(String(k.key), k.id as number)
}

function resolveKeywords(keys: string[] | undefined, field: string, slug: string): number[] {
  if (!keys?.length) return []
  return keys.map((key) => {
    const id = keywordIdByKey.get(key)
    if (id === undefined) {
      throw new Error(
        `[${slug}] ${field}: keyword "${key}" not found. Add it to scripts/seed/keywords.csv and run pnpm seed:keywords first.`,
      )
    }
    return id
  })
}

/** spotlight must be a curated subset of scope ∪ craft (mirrors the field's admin filter). */
function validateSpotlight(entry: PortfolioSeedEntry): void {
  const allowed = new Set([...entry.scope, ...entry.craft])
  const stray = (entry.spotlight ?? []).filter((k) => !allowed.has(k))
  if (stray.length) {
    throw new Error(
      `[${entry.slug}] spotlight keys not in scope∪craft: ${stray.join(', ')}`,
    )
  }
  if ((entry.spotlight ?? []).length > 5) {
    throw new Error(`[${entry.slug}] spotlight has >5 keys (max 5)`)
  }
}

// --- Resolve relatedContent slugs → polymorphic { relationTo, value } ------
async function resolveRelated(entry: PortfolioSeedEntry) {
  if (!entry.relatedContent?.length) return []
  const out: Array<{ relationTo: 'portfolio' | 'experience'; value: number }> = []
  for (const ref of entry.relatedContent) {
    const { docs } = await payload.find({
      collection: ref.relationTo,
      where: { slug: { equals: ref.slug } },
      depth: 0,
      limit: 1,
    })
    if (!docs.length) {
      throw new Error(
        `[${entry.slug}] relatedContent: ${ref.relationTo} "${ref.slug}" not found (seed it first).`,
      )
    }
    out.push({ relationTo: ref.relationTo, value: docs[0].id as number })
  }
  return out
}

// --- Seed loop --------------------------------------------------------------
let created = 0
let updated = 0

for (const entry of PORTFOLIO_CONTENT) {
  validateSpotlight(entry)

  const data = {
    slug: entry.slug,
    order: entry.order ?? 0,
    eyebrow: entry.eyebrow,
    title: entry.title,
    summary: entry.summary,
    diagramKey: entry.diagramKey,
    overview: entry.overview.map((text) => ({ text })),
    keyDecisionsTitle: entry.keyDecisionsTitle ?? null,
    keyDecisions: entry.keyDecisions.map((d) => ({
      title: d.title,
      conclusion: d.conclusion,
      description: d.description ?? '',
      points: d.points.map((text) => ({ text })),
    })),
    scope: resolveKeywords(entry.scope, 'scope', entry.slug),
    craft: resolveKeywords(entry.craft, 'craft', entry.slug),
    spotlight: resolveKeywords(entry.spotlight, 'spotlight', entry.slug),
    searchKeywords: resolveKeywords(entry.searchKeywords, 'searchKeywords', entry.slug),
    relatedContent: await resolveRelated(entry),
  }

  const existing = await payload.find({
    collection: 'portfolio',
    where: { slug: { equals: entry.slug } },
    limit: 1,
    depth: 0,
  })

  if (existing.docs.length > 0) {
    await payload.update({ collection: 'portfolio', id: existing.docs[0].id, data, depth: 0 })
    updated++
    console.log(`  ↻ updated  ${entry.slug}`)
  } else {
    await payload.create({ collection: 'portfolio', data, depth: 0 })
    created++
    console.log(`  + created  ${entry.slug}`)
  }
}

console.log(`✓ Seed complete — ${created} created, ${updated} updated`)
process.exit(0)

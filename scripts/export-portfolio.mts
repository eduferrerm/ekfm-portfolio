/**
 * Exports every Portfolio (feature-detail) row from the DB back to
 * scripts/seed/portfolio.json via the Payload Local API — the reverse of
 * scripts/seed-portfolio.mts. Run it after editing feature content in the CMS
 * so the JSON (the version-controlled SSOT) captures those edits; commit the
 * result. With both directions in place the JSON and the DB stay in sync, so a
 * reseed never loses a CMS edit.
 *
 *   pnpm export:portfolio
 *   # or: node --env-file=.env.local --import tsx/esm scripts/export-portfolio.mts
 *
 * Keyword/relatedContent links are serialized by STABLE KEY/SLUG (never numeric
 * IDs), so the JSON survives a rebuild. Output is deterministic — entries sorted
 * by order then slug, fixed key order — for clean, reviewable git diffs.
 *
 * NOTE on `thumbnail`: deliberately NOT exported. Thumbnails are assigned in the
 * CMS (uploads → Blob) and the seeder never writes the field, so they live only
 * in the DB and are preserved across reseeds. Keeping them out of the JSON SSOT
 * avoids serializing volatile media IDs.
 *
 * Same ESM/tsx bootstrap as the keyword export (Node 24 can't require() the
 * lexical config — see scripts/generate-types.mts).
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const JSON_PATH = path.resolve(process.cwd(), 'scripts/seed/portfolio.json')

/** depth:1 keyword relationship → its stable keys, in stored (drag) order. */
function keys(rel: unknown): string[] {
  if (!Array.isArray(rel)) return []
  return rel
    .map((k) => (k && typeof k === 'object' ? String((k as { key?: unknown }).key ?? '') : ''))
    .filter(Boolean)
}

const configPath = pathToFileURL(path.resolve(process.cwd(), 'payload.config.ts')).href
const config = await (await import(configPath)).default
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'portfolio',
  depth: 1,
  pagination: false,
  limit: 0,
})

const entries = docs
  .map((d: Record<string, unknown>) => {
    const entry: Record<string, unknown> = {
      slug: String(d.slug ?? ''),
      order: typeof d.order === 'number' ? d.order : 0,
      eyebrow: String(d.eyebrow ?? ''),
      title: String(d.title ?? ''),
      summary: String(d.summary ?? ''),
      diagramKey: String(d.diagramKey ?? ''),
      overview: Array.isArray(d.overview)
        ? d.overview.map((o: { text?: unknown }) => String(o.text ?? ''))
        : [],
      keyDecisionsTitle: d.keyDecisionsTitle ? String(d.keyDecisionsTitle) : null,
      keyDecisions: Array.isArray(d.keyDecisions)
        ? d.keyDecisions.map((dec: Record<string, unknown>) => {
            const out: Record<string, unknown> = { title: String(dec.title ?? '') }
            out.conclusion = dec.conclusion === 'down' ? 'down' : 'up'
            if (dec.description) out.description = String(dec.description)
            out.points = Array.isArray(dec.points)
              ? dec.points.map((p: { text?: unknown }) => String(p.text ?? ''))
              : []
            return out
          })
        : [],
      scope: keys(d.scope),
      craft: keys(d.craft),
      spotlight: keys(d.spotlight),
    }
    const searchKeywords = keys(d.searchKeywords)
    if (searchKeywords.length) entry.searchKeywords = searchKeywords
    const related = Array.isArray(d.relatedContent)
      ? d.relatedContent
          .map((r: { relationTo?: unknown; value?: unknown }) => ({
            relationTo: String(r.relationTo ?? ''),
            slug:
              r.value && typeof r.value === 'object'
                ? String((r.value as { slug?: unknown }).slug ?? '')
                : '',
          }))
          .filter((r) => r.relationTo && r.slug)
      : []
    if (related.length) entry.relatedContent = related
    return entry
  })
  .sort(
    (a, b) =>
      (a.order as number) - (b.order as number) ||
      (a.slug as string).localeCompare(b.slug as string),
  )

writeFileSync(JSON_PATH, JSON.stringify(entries, null, 2) + '\n', 'utf8')

console.log(`✓ Exported ${entries.length} portfolio rows → ${path.relative(process.cwd(), JSON_PATH)}`)
process.exit(0)

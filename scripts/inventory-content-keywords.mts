/**
 * Read-only snapshot of which keywords are attached to every Portfolio and
 * Experience item, written to scripts/seed/content-keyword-inventory.json.
 *
 *   pnpm inventory:content
 *   # or: node --env-file=.env.local --import tsx/esm scripts/inventory-content-keywords.mts
 *
 * Why this exists: keyword attachments (scope / craft / spotlight / searchKeywords)
 * live ONLY on the Portfolio/Experience rows as relationship arrays, and the DB
 * stores them as numeric keyword IDs — which are not stable across a rebuild.
 * export:keywords captures the keyword vocabulary but NOT these attachments. This
 * script captures the attachment graph by STABLE KEY (keyword.key) and SLUG, so
 * the "what is wired to what" mapping is version-controlled and human-readable
 * before any seed/reseed touches content. Purely reads — never writes the DB.
 *
 * Same ESM/tsx bootstrap as the seeder/export (Node 24 can't require() the
 * lexical config — see scripts/generate-types.mts).
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const OUT_PATH = path.resolve(process.cwd(), 'scripts/seed/content-keyword-inventory.json')

/** Resolve a depth:1 keyword relationship array to its stable keys, sorted. */
function keys(rel: unknown): string[] {
  if (!Array.isArray(rel)) return []
  return rel
    .map((k) => (k && typeof k === 'object' ? String((k as { key?: unknown }).key ?? '') : ''))
    .filter(Boolean)
    .sort()
}

/** Resolve polymorphic relatedContent (depth:1) to { relationTo, slug } pairs. */
function related(rel: unknown): Array<{ relationTo: string; slug: string }> {
  if (!Array.isArray(rel)) return []
  return rel
    .map((r) => {
      const relationTo = String((r as { relationTo?: unknown })?.relationTo ?? '')
      const value = (r as { value?: unknown })?.value
      const slug =
        value && typeof value === 'object' ? String((value as { slug?: unknown }).slug ?? '') : ''
      return { relationTo, slug }
    })
    .filter((r) => r.relationTo && r.slug)
}

const configPath = pathToFileURL(path.resolve(process.cwd(), 'payload.config.ts')).href
const config = await (await import(configPath)).default
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const portfolioRes = await payload.find({
  collection: 'portfolio',
  depth: 1,
  pagination: false,
  limit: 0,
})
const experienceRes = await payload.find({
  collection: 'experience',
  depth: 1,
  pagination: false,
  limit: 0,
})

const portfolio = portfolioRes.docs
  .map((d) => ({
    slug: String((d as { slug?: unknown }).slug ?? ''),
    title: String((d as { title?: unknown }).title ?? ''),
    diagramKey: String((d as { diagramKey?: unknown }).diagramKey ?? ''),
    scope: keys((d as { scope?: unknown }).scope),
    craft: keys((d as { craft?: unknown }).craft),
    spotlight: keys((d as { spotlight?: unknown }).spotlight),
    searchKeywords: keys((d as { searchKeywords?: unknown }).searchKeywords),
    relatedContent: related((d as { relatedContent?: unknown }).relatedContent),
  }))
  .sort((a, b) => a.slug.localeCompare(b.slug))

const experience = experienceRes.docs
  .map((d) => ({
    slug: String((d as { slug?: unknown }).slug ?? ''),
    role: String((d as { role?: unknown }).role ?? ''),
    company: String((d as { company?: unknown }).company ?? ''),
    scope: keys((d as { scope?: unknown }).scope),
    craft: keys((d as { craft?: unknown }).craft),
    spotlight: keys((d as { spotlight?: unknown }).spotlight),
    searchKeywords: keys((d as { searchKeywords?: unknown }).searchKeywords),
  }))
  .sort((a, b) => a.slug.localeCompare(b.slug))

const inventory = {
  generatedFrom: 'DB via Payload Local API (read-only)',
  counts: { portfolio: portfolio.length, experience: experience.length },
  portfolio,
  experience,
}

writeFileSync(OUT_PATH, JSON.stringify(inventory, null, 2) + '\n', 'utf8')

console.log(`✓ Inventory: ${portfolio.length} portfolio, ${experience.length} experience items`)
console.log(`  → ${path.relative(process.cwd(), OUT_PATH)}`)
for (const e of experience) {
  console.log(
    `  [exp] ${e.slug}: scope=[${e.scope.join(',')}] craft=[${e.craft.join(',')}] spotlight=[${e.spotlight.join(',')}]`,
  )
}
for (const p of portfolio) {
  console.log(
    `  [pf]  ${p.slug}: scope=[${p.scope.join(',')}] craft=[${p.craft.join(',')}] spotlight=[${p.spotlight.join(',')}]`,
  )
}
process.exit(0)

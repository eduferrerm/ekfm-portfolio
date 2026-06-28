/**
 * Exports every Keyword from the DB back to scripts/seed/keywords.csv via the
 * Payload Local API — the reverse of scripts/seed-keywords.mts. Run it after
 * editing keywords in the CMS so the CSV (the version-controlled SSOT) captures
 * those edits; commit the result. With both directions in place the CSV and the
 * DB stay in sync, so a reseed — or a wipe-and-reseed — never loses a
 * CMS-authored keyword.
 *
 *   pnpm export:keywords
 *   # or: node --env-file=.env.local --import tsx/esm scripts/export-keywords.mts
 *
 * Output is deterministic — grouped by category (scope → craft → searchOnly),
 * then sorted by `key` — so re-exports produce minimal, reviewable git diffs.
 * (The first export normalises the existing row order to this sort.)
 *
 * Same ESM/tsx bootstrap as the seeder + codegen scripts (Node 24 can't require()
 * the lexical config — see scripts/generate-types.mts).
 */
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const CSV_PATH = path.resolve(process.cwd(), 'scripts/seed/keywords.csv')

/** Category sort order — mirrors the logical grouping the CSV has always used. */
const CATEGORY_ORDER: Record<string, number> = { scope: 0, craft: 1, searchOnly: 2 }

/** RFC-4180 field: quote when it contains a comma, quote, or newline; double inner quotes. */
function csvField(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

const configPath = pathToFileURL(path.resolve(process.cwd(), 'payload.config.ts')).href
const config = await (await import(configPath)).default
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const { docs } = await payload.find({
  collection: 'keywords',
  depth: 0,
  pagination: false,
  limit: 0,
})

const rows = docs
  .map((doc) => ({
    key: String(doc.key ?? ''),
    label: String(doc.label ?? ''),
    category: String(doc.category ?? ''),
    aliases: (Array.isArray(doc.aliases) ? doc.aliases : []).filter(Boolean).join('|'),
  }))
  .sort(
    (a, b) =>
      (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99) ||
      a.key.localeCompare(b.key),
  )

const lines = [
  'key,label,category,aliases',
  ...rows.map((r) => [r.key, r.label, r.category, r.aliases].map(csvField).join(',')),
]
writeFileSync(CSV_PATH, lines.join('\n') + '\n', 'utf8')

console.log(`✓ Exported ${rows.length} keywords → ${path.relative(process.cwd(), CSV_PATH)}`)
process.exit(0)

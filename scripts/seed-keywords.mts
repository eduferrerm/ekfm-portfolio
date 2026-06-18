/**
 * Seeds / upserts Keywords from scripts/seed/keywords.csv via the Payload Local
 * API. Idempotent: matches existing keywords by the immutable `key` and updates
 * label / category / aliases; creates a row for any new key. (The `key` field
 * denies update access, so re-running never mutates an existing key — it stays
 * the stable upsert identity.)
 *
 * CSV columns (header row required): key,label,category,aliases
 *   - category ∈ scope | craft | searchOnly
 *   - aliases  = pipe-delimited, optional (e.g. "FE|Front-end")
 *   - label / aliases values may contain commas if double-quoted (RFC-4180)
 *
 * Run AFTER the schema is pushed (this hits the Local API, which triggers a
 * dev-push on any pending diff — push the schema first, see scripts/push-schema.mts):
 *
 *   pnpm seed:keywords
 *   # or: node --import tsx/esm scripts/seed-keywords.mts
 *
 * Same ESM/tsx bootstrap as the codegen + push scripts (Node 24 can't require()
 * the lexical config — see scripts/generate-types.mts).
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const CSV_PATH = path.resolve(process.cwd(), 'scripts/seed/keywords.csv')
const VALID_CATEGORIES = new Set(['scope', 'craft', 'searchOnly'])

/** Minimal RFC-4180-ish CSV parser: double-quoted fields, "" escape, CRLF/LF. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') {
      field += c
    }
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function fail(message: string): never {
  console.error(`✗ ${message}`)
  process.exit(1)
}

if (!existsSync(CSV_PATH)) {
  fail(`CSV not found at ${CSV_PATH} — author it (cols: key,label,category,aliases) before seeding.`)
}

const records = parseCsv(readFileSync(CSV_PATH, 'utf8')).filter((r) =>
  r.some((c) => c.trim() !== ''),
)
if (records.length < 2) fail('CSV has no data rows (expected a header row + at least one keyword).')

const header = records[0].map((h) => h.trim().toLowerCase())
const idx: Record<string, number> = Object.fromEntries(header.map((h, i) => [h, i]))
for (const col of ['key', 'label', 'category']) {
  if (idx[col] === undefined) fail(`CSV missing required column: "${col}". Header was: ${header.join(',')}`)
}

type Row = { key: string; label: string; category: 'scope' | 'craft' | 'searchOnly'; aliases: string[] }
const rows: Row[] = []
const errors: string[] = []
const seen = new Set<string>()

records.slice(1).forEach((rec, n) => {
  const line = n + 2 // 1-based, +1 for header
  const key = (rec[idx.key] ?? '').trim()
  const label = (rec[idx.label] ?? '').trim()
  const category = (rec[idx.category] ?? '').trim()
  const aliases =
    idx.aliases !== undefined
      ? (rec[idx.aliases] ?? '')
          .split('|')
          .map((a) => a.trim())
          .filter(Boolean)
      : []

  if (!key) errors.push(`Line ${line}: missing key`)
  if (!label) errors.push(`Line ${line}: missing label`)
  if (!VALID_CATEGORIES.has(category)) {
    errors.push(`Line ${line}: invalid category "${category}" (expected scope | craft | searchOnly)`)
  }
  if (key) {
    if (seen.has(key)) errors.push(`Line ${line}: duplicate key "${key}"`)
    seen.add(key)
  }
  rows.push({ key, label, category: category as Row['category'], aliases })
})

if (errors.length) {
  fail(`Validation failed (${errors.length}):\n` + errors.map((e) => `  - ${e}`).join('\n'))
}

const configPath = pathToFileURL(path.resolve(process.cwd(), 'payload.config.ts')).href
const config = await (await import(configPath)).default
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

let created = 0
let updated = 0
for (const r of rows) {
  const existing = await payload.find({
    collection: 'keywords',
    where: { key: { equals: r.key } },
    limit: 1,
    depth: 0,
  })
  const data = { key: r.key, label: r.label, category: r.category, aliases: r.aliases }
  if (existing.docs.length > 0) {
    await payload.update({ collection: 'keywords', id: existing.docs[0].id, data, depth: 0 })
    updated++
  } else {
    await payload.create({ collection: 'keywords', data, depth: 0 })
    created++
  }
}

console.log(`✓ Seed complete — ${created} created, ${updated} updated (${rows.length} total)`)
process.exit(0)

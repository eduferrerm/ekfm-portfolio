/**
 * Seeds initial published version rows for documents/globals that gained
 * `versions.drafts` while ALREADY holding data.
 *
 * Why this exists: enabling drafts on a collection/global with existing rows adds
 * the `_status` column (the migration backfills it to `published`) but creates NO
 * rows in the `_<slug>_v` version tables. The Payload admin lists via `draft:true`
 * — which reads the version tables — so every pre-existing document shows up as
 * EMPTY in the admin, even though the public site still renders (it reads the main
 * table). Re-publishing each document once writes its first version row and the
 * admin shows it again. See docs/RUNBOOK.md → DRAFTS-MIGRATION.
 *
 * Run AFTER a drafts-enabling migration, on EVERY database that carried
 * pre-existing rows (local/staging via .env.local, prod via .env.prod.local):
 *   pnpm seed-versions          # local / shared dev-push DB
 *   pnpm seed-versions:prod     # prod (needs .env.prod.local w/ NODE_ENV=production
 *                               # so payload.init does NOT dev-push — see RUNBOOK)
 *
 * Idempotent: a document/global that already has a version is skipped, so it is
 * safe to re-run. Discovers which collections/globals have drafts from the config,
 * so a future drafts-enabled collection needs no change here.
 *
 * Invoked with `node --import tsx/esm` (same ESM/node24 reason as the codegen +
 * migrate wrappers — the stock Payload CLI can't load the config under require()).
 */
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const { default: payload } = await import('payload')
const configPath = pathToFileURL(path.resolve(process.cwd(), 'payload.config.ts')).href
const config = await (await import(configPath)).default

await payload.init({ config })

const draftCollections = payload.config.collections.filter((c) => (c.versions as { drafts?: unknown })?.drafts)
const draftGlobals = payload.config.globals.filter((g) => (g.versions as { drafts?: unknown })?.drafts)

for (const col of draftCollections) {
  const slug = col.slug
  // All existing docs (published — the state pre-existing rows land in after the
  // backfill). depth:0 keeps it lean; we only re-save to trigger a version.
  const { docs } = await payload.find({ collection: slug, limit: 100_000, depth: 0, pagination: false })
  let seeded = 0
  for (const doc of docs) {
    const { totalDocs } = await payload.findVersions({
      collection: slug,
      where: { parent: { equals: doc.id } },
      limit: 1,
      depth: 0,
    })
    if (totalDocs > 0) continue // already has a version — skip (idempotent)
    await payload.update({ collection: slug, id: doc.id, data: { _status: 'published' }, depth: 0 })
    seeded++
  }
  console.log(`${slug}: seeded ${seeded}/${docs.length} (skipped ${docs.length - seeded} that already had versions)`)
}

for (const global of draftGlobals) {
  const slug = global.slug
  const { totalDocs } = await payload.findGlobalVersions({ slug, limit: 1, depth: 0 })
  if (totalDocs > 0) {
    console.log(`${slug} (global): skipped (already has versions)`)
    continue
  }
  await payload.updateGlobal({ slug, data: { _status: 'published' } })
  console.log(`${slug} (global): seeded`)
}

console.log('Done.')
process.exit(0)

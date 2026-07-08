/**
 * Backfills `blurDataURL` on existing Media docs. The upload hook
 * (generateBlurPlaceholder) only derives blur for NEW uploads, so images already
 * in the DB when the field shipped have a null placeholder and would render a
 * blank box during the cold image-optimizer pass. This refetches each image's
 * bytes from Blob, derives the same LQIP, and writes it back.
 *
 * Idempotent: skips docs that already have a blurDataURL and non-image uploads.
 * Pass --force to re-derive for every image (e.g. after tweaking the LQIP recipe).
 *
 * Run against whichever DB the env file points at (schema column must exist
 * there first — dev-push for dev, migrate:prod for prod):
 *
 *   pnpm backfill:media-blur        # dev  (.env.local)
 *   pnpm backfill:media-blur:prod   # prod (.env.prod.local)
 *
 * PROD HAZARD: this calls getPayload() → payload.init against the target DB. For
 * prod, .env.prod.local MUST carry NODE_ENV=production (push OFF) or init drifts
 * the prod schema and drops a 'dev' payload_migrations row — see PROD-DEVPUSH-
 * DEV-ROW in docs/RUNBOOK.md.
 *
 * Same ESM/tsx bootstrap as the seed/codegen scripts (Node 24 can't require() the
 * lexical config — see scripts/generate-types.mts).
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { blurDataURLFromBuffer } from '../payload/collections/mediaBlurPlaceholder'

const force = process.argv.includes('--force')

// Media `url` comes back as a relative Payload route (/api/media/file/<name>)
// that redirects to Blob, so resolve it against the deploy's own origin. This is
// the same server that must be reachable to stream the bytes (dev: localhost;
// prod: the live domain), so require it explicitly rather than guess.
const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL
if (!baseUrl) {
  console.error('✗ NEXT_PUBLIC_PAYLOAD_URL is required to resolve media URLs')
  process.exit(1)
}

const configPath = pathToFileURL(path.resolve(process.cwd(), 'payload.config.ts')).href
const config = await (await import(configPath)).default
const { getPayload } = await import('payload')
const payload = await getPayload({ config })

const { docs } = await payload.find({ collection: 'media', limit: 0, depth: 0, pagination: false })

let updated = 0
let skipped = 0
let failed = 0

for (const doc of docs) {
  const isImage = doc.mimeType?.startsWith('image/')
  if (!isImage || !doc.url) {
    skipped++
    continue
  }
  if (doc.blurDataURL && !force) {
    skipped++
    continue
  }

  try {
    const fileUrl = new URL(doc.url, baseUrl).href
    const res = await fetch(fileUrl)
    if (!res.ok) throw new Error(`fetch ${fileUrl} → ${res.status}`)
    const blurDataURL = await blurDataURLFromBuffer(Buffer.from(await res.arrayBuffer()))
    if (!blurDataURL) {
      console.warn(`⚠ ${doc.filename ?? doc.id}: undecodable, left null`)
      skipped++
      continue
    }
    // Direct field set — the beforeChange hook only overwrites when a new file
    // is uploaded (req.file), so this value passes through untouched.
    await payload.update({ collection: 'media', id: doc.id, data: { blurDataURL }, depth: 0 })
    updated++
    console.log(`✓ ${doc.filename ?? doc.id}`)
  } catch (err) {
    failed++
    console.error(`✗ ${doc.filename ?? doc.id}: ${err instanceof Error ? err.message : err}`)
  }
}

console.log(`\nBackfill complete — ${updated} updated, ${skipped} skipped, ${failed} failed (${docs.length} total)`)
process.exit(failed > 0 ? 1 : 0)

/**
 * Generates `app/(payload)/admin/importMap.js` programmatically.
 *
 * Why this exists instead of `payload generate:importmap`:
 * the Payload CLI loads the TypeScript config through `require()`, and
 * `@payloadcms/richtext-lexical` uses top-level await in its ESM graph, which
 * Node rejects under `require()` (`ERR_REQUIRE_ASYNC_MODULE`).
 *
 * This script is invoked with `node --import tsx/esm`, so the dynamic `import()`
 * below resolves the config (and all of Payload) through the ESM loader where
 * top-level await is legal — no CLI, no require().
 *
 * Run with: `pnpm generate:importmap`
 */
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const { generateImportMap } = await import('payload')

const configPath = pathToFileURL(
  path.resolve(process.cwd(), 'payload.config.ts'),
).href

const config = await (await import(configPath)).default

await generateImportMap(config, { force: true, log: true })

console.log('✓ Import map written to app/(payload)/admin/importMap.js')

/**
 * Generates `payload-types.ts` programmatically.
 *
 * Why this exists instead of `payload generate:types`:
 * the Payload CLI loads the TypeScript config through `require()`, and
 * `@payloadcms/richtext-lexical` uses top-level await in its ESM graph, which
 * Node rejects under `require()` (`ERR_REQUIRE_ASYNC_MODULE`) — this bites on
 * Node 24. See scripts/generate-importmap.mts for the same workaround.
 *
 * Invoked with `node --import tsx/esm`, so the dynamic `import()` below resolves
 * the config (and all of Payload) through the ESM loader where top-level await
 * is legal — no CLI, no require().
 *
 * Run with: `pnpm generate:types`
 */
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const { generateTypes } = await import('payload/node')

const configPath = pathToFileURL(
  path.resolve(process.cwd(), 'payload.config.ts'),
).href

const config = await (await import(configPath)).default

await generateTypes(config, { log: true })

console.log('✓ Types written to payload-types.ts')

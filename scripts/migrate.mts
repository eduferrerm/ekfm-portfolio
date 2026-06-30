/**
 * Runs Payload database migrations programmatically.
 *
 * Why this exists instead of `payload migrate`:
 * the Payload CLI loads the TypeScript config through `require()`, and
 * `@payloadcms/richtext-lexical` uses top-level await in its ESM graph, which
 * Node rejects under `require()` (`ERR_REQUIRE_ASYNC_MODULE`) — this bites on
 * Node 24. Same root cause (and same fix) as scripts/generate-types.mts and
 * scripts/generate-importmap.mts.
 *
 * Invoked with `node --import tsx/esm`, so the dynamic `import()` below resolves
 * the config (and all of Payload) through the ESM loader where top-level await
 * is legal — no CLI, no `require()`.
 *
 * Payload's own `migrate` dispatcher lives in `payload/dist/bin/migrate.js`,
 * which is NOT in the package `exports` map (only `.` and `./node` are), so it
 * can't be imported. This script therefore replicates that dispatcher's logic
 * (init a barebones Payload to reach the DB adapter, then call the matching
 * adapter method) against the public `payload` + adapter API.
 *
 * Run with (all pass the command as the first arg):
 *   pnpm migrate                   # apply pending migrations
 *   pnpm migrate:create [name]     # author a migration from the schema diff
 *   pnpm migrate:status            # list applied / pending migrations
 *   pnpm migrate:down              # roll back the last batch
 *   pnpm migrate:refresh           # roll back then re-apply all
 *   pnpm migrate:reset             # roll back every migration
 *   pnpm migrate:fresh             # drop everything then re-apply all
 *
 * Flags (mirror the stock CLI): `--force-accept-warning`, `--skip-empty`.
 * All read DATABASE_URL — invoke via `node --env-file=.env.local` (wired in
 * package.json). `migrate:create` is the only command that does not connect to
 * the DB (it diffs config schema against existing migration files).
 */
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const SUPPORTED = [
  'migrate',
  'migrate:create',
  'migrate:down',
  'migrate:refresh',
  'migrate:reset',
  'migrate:status',
  'migrate:fresh',
] as const

const argv = process.argv.slice(2)
const command = (argv[0] ?? 'migrate') as (typeof SUPPORTED)[number]
const positional = argv.slice(1).filter((arg) => !arg.startsWith('-'))
const flags = new Set(
  argv.filter((arg) => arg.startsWith('--')).map((arg) => arg.replace(/^--+/, '')),
)

if (!SUPPORTED.includes(command)) {
  console.error(`Unknown migration command: "${command}". Available: ${SUPPORTED.join(', ')}`)
  process.exit(1)
}

const forceAcceptWarning = flags.has('force-accept-warning') || flags.has('forceAcceptWarning')
const skipEmpty = flags.has('skip-empty') || flags.has('skipEmpty')
const migrationName = positional[0]

const { default: payload } = await import('payload')

const configPath = pathToFileURL(path.resolve(process.cwd(), 'payload.config.ts')).href
const config = await (await import(configPath)).default

// Signals to collections/hooks that we are migrating (matches Payload's bin).
process.env.PAYLOAD_MIGRATING = 'true'

// Barebones instance to reach the database adapter — no onInit, and no DB
// connection for `migrate:create` (it diffs schema, never touches the DB).
await payload.init({
  config,
  disableDBConnect: command === 'migrate:create',
  disableOnInit: true,
})

const adapter = payload.db
if (!adapter) {
  throw new Error('No database adapter found on the Payload instance')
}

try {
  switch (command) {
    case 'migrate':
      await adapter.migrate()
      break
    case 'migrate:create':
      await adapter.createMigration({
        forceAcceptWarning,
        migrationName,
        payload,
        skipEmpty,
      })
      break
    case 'migrate:down':
      await adapter.migrateDown()
      break
    case 'migrate:refresh':
      await adapter.migrateRefresh()
      break
    case 'migrate:reset':
      await adapter.migrateReset()
      break
    case 'migrate:status':
      await adapter.migrateStatus()
      break
    case 'migrate:fresh':
      await adapter.migrateFresh({ forceAcceptWarning })
      break
  }
  payload.logger.info('Done.')
} finally {
  await payload.destroy()
}

process.exit(0)

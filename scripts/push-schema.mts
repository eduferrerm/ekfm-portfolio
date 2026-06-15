/**
 * Forces a Payload dev-push (schema sync) outside the Next dev server.
 *
 * Why this exists: dev push runs at Payload `init()` and, on a destructive diff
 * (e.g. dropping a column), prompts interactively on the TTY. The Next dev
 * server runs that prompt on a stdin we can't drive from a backgrounded process.
 * This script triggers the same init in the foreground so a confirmation can be
 * piped in, e.g.:
 *
 *   echo y | node --import tsx/esm scripts/push-schema.mts
 *
 * Same ESM/tsx bootstrap as the codegen scripts (Node 24 can't `require()` the
 * lexical config — see scripts/generate-types.mts). One-off; not wired to a
 * package script.
 */
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const { getPayload } = await import('payload')

const configPath = pathToFileURL(
  path.resolve(process.cwd(), 'payload.config.ts'),
).href

const config = await (await import(configPath)).default

// init() runs the dev push; the destructive-drop confirm reads from stdin.
await getPayload({ config })

console.log('✓ Schema push complete')
process.exit(0)

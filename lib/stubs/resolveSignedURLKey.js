// Client-side stub for @payloadcms/plugin-cloud-storage's resolveSignedURLKey.
//
// The real implementation imports `payload/internal` (the whole server graph:
// pino logger, migrations → fs/module, etc.), which webpack cannot bundle for
// the browser. The Vercel Blob client upload handler only uses `getFileKey`
// from the same barrel — signed-URL key resolution happens server-side — so on
// the client this is dead code. See next.config.ts webpack alias.
export function resolveSignedURLKey() {
  throw new Error(
    'resolveSignedURLKey is server-only and must not be called in the browser',
  )
}

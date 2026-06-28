// Client-side stub for @payloadcms/plugin-cloud-storage's resolveSignedURLKey.
//
// storage-vercel-blob@3.85.1 registers VercelBlobClientUploadHandler in the
// admin import map UNCONDITIONALLY (independent of clientUploads). That handler
// reaches resolveSignedURLKey, whose real implementation imports
// `payload/internal` — the whole server graph (pino logger, migrations →
// fs/module, undici → node:*) — which webpack cannot bundle for the browser.
// Signed-URL key resolution is server-only, so on the client this is dead code;
// the redirect to this stub (see next.config.ts) cuts the leak.
export function resolveSignedURLKey() {
  throw new Error(
    'resolveSignedURLKey is server-only and must not be called in the browser',
  )
}

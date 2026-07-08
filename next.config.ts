import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Vercel Blob public URLs: https://<storeId>.public.blob.vercel-storage.com/...
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    // WebP only (not AVIF). AVIF's files are ~20-30% smaller but its cold
    // optimizer encode is several times slower — and the whole point here is the
    // FIRST view, where a never-seen variant is encoded on demand. WebP resolves
    // the crisp image sooner behind the blur placeholder; AVIF's smaller bytes
    // would only pay off on the already-warm path. Fewer formats also means
    // fewer variants to warm across the size ladder. (This is Next's default;
    // pinned explicitly to record the decision.)
    formats: ['image/webp'],
    // Blob replaces get a fresh URL (new optimizer key), so a variant is
    // effectively immutable — hold it in the optimizer cache for a year rather
    // than re-cooling on the short default TTL and re-paying the cold pass.
    minimumCacheTTL: 31536000,
  },
  // Reverse-proxy PostHog through this app to reduce adblock loss. The browser
  // talks to /ingest/*; Next rewrites to the PostHog edge. Host is env-driven.
  async rewrites() {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
    if (!host) return []

    // PostHog serves static assets from a sibling host: eu.i.posthog.com → eu-assets.i.posthog.com
    const assetHost = host.replace(/^(https:\/\/[a-z]+)\./, '$1-assets.')

    return [
      { source: '/ingest/static/:path*', destination: `${assetHost}/static/:path*` },
      { source: '/ingest/:path*', destination: `${host}/:path*` },
    ]
  },
  // Required for PostHog reverse-proxy rewrites with a trailing-slash-free setup.
  skipTrailingSlashRedirect: true,
  webpack: (config, { webpack, isServer }) => {
    // storage-vercel-blob@3.85.1 registers VercelBlobClientUploadHandler in the
    // admin import map UNCONDITIONALLY (independent of clientUploads). It reaches
    // `resolveSignedURLKey`, whose real impl imports `payload/internal` — the
    // full server graph (pino, migrations → fs/module, undici → node:*) — which
    // webpack can't bundle for the browser. Redirect that one dead-on-client
    // module to a stub. Required while on this adapter version; revisit on
    // upgrade or when withPayload allows Turbopack (Next >= 16.1).
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /utilities[\\/]resolveSignedURLKey(\.js)?$/,
          path.resolve(dirname, 'lib/stubs/resolveSignedURLKey.js'),
        ),
      )
    }
    return config
  },
}

export default withPayload(nextConfig)

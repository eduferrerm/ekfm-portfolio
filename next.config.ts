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
    // The Vercel Blob client upload handler (clientUploads:true) imports
    // `getFileKey` from plugin-cloud-storage's `/utilities` barrel. That barrel
    // also re-exports `resolveSignedURLKey`, which imports `payload/internal`
    // (the full server graph: pino, migrations → fs/module, undici → node:*).
    // It's dead code on the client, but webpack still resolves the chain and
    // fails on node builtins. Redirect just that module to a browser stub.
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

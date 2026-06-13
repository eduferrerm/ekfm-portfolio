import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/**
 * Upload collection backing all images/files. Storage is delegated to the
 * Vercel Blob adapter (see payload.config.ts), which sets `disableLocalStorage`
 * automatically — files never touch the serverless filesystem.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    // Show assets by their human-friendly name in list views and the upload
    // picker drawer, rather than by filename/ID.
    useAsTitle: 'title',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    // Adapter (Vercel Blob) handles persistence; no local on-disk copies.
    // With clientUploads off (server uploads only), every file flows through a
    // serverless function — each upload must stay under Vercel's ~4.5MB
    // request-body limit. Runtime validation only; no DB schema change.
    mimeTypes: ['image/*', 'application/pdf', 'video/mp4', 'video/webm'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Human-friendly name for this asset (shown in the media picker).',
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Alternative text for accessibility and SEO.',
      },
    },
  ],
}

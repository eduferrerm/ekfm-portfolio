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
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    // Adapter (Vercel Blob) handles persistence; no local on-disk copies.
    mimeTypes: ['image/*', 'application/pdf'],
  },
  fields: [
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

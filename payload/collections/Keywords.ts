import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/** Tags used to relate and search across portfolio items and experience. */
export const Keywords: CollectionConfig = {
  slug: 'keywords',
  admin: {
    useAsTitle: 'label',
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      // Single-value axis: a keyword is scope OR craft, never both (SEO included).
      // Drives the two scoped relationship fields on Experience/Portfolio, which
      // filterOptions on this value so each picker only offers its own category.
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Scope', value: 'scope' },
        { label: 'Craft', value: 'craft' },
      ],
    },
    {
      // Recruiter-term synonyms fed to Fuse for search recall (e.g. ["FE",
      // "Frontend"]). Never rendered — search-only. Authors populate as they
      // create keywords.
      name: 'aliases',
      type: 'text',
      hasMany: true,
    },
  ],
}

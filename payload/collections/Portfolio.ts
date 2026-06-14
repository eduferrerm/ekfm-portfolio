import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/** Portfolio pieces surfaced at /portfolio and /portfolio/[slug]. */
export const Portfolio: CollectionConfig = {
  slug: 'portfolio',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'title',
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
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      // Two scoped relationship fields (not one mixed field). Each filters the
      // shared Keywords collection to its own category. Display order = attach
      // order (hasMany preserves it, drag-reorderable in admin) — never sorted
      // at render.
      name: 'scope',
      type: 'relationship',
      relationTo: 'keywords',
      hasMany: true,
      filterOptions: () => ({ category: { equals: 'scope' } }),
    },
    {
      name: 'craft',
      type: 'relationship',
      relationTo: 'keywords',
      hasMany: true,
      filterOptions: () => ({ category: { equals: 'craft' } }),
    },
  ],
}

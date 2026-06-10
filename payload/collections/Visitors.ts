import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/** Per-company visitor landing data surfaced at /visitor/[company]. */
export const Visitors: CollectionConfig = {
  slug: 'visitors',
  admin: {
    useAsTitle: 'company',
    defaultColumns: ['company', 'slug', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'company',
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
      name: 'headline',
      type: 'text',
    },
    {
      name: 'notes',
      type: 'richText',
    },
  ],
}

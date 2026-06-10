import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/** Work history surfaced at /experience. */
export const Experience: CollectionConfig = {
  slug: 'experience',
  admin: {
    useAsTitle: 'role',
    defaultColumns: ['role', 'company', 'startDate', 'current'],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'role',
      type: 'text',
      required: true,
    },
    {
      name: 'company',
      type: 'text',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            condition: (data) => !data?.current,
          },
        },
      ],
    },
    {
      name: 'current',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'keywords',
      type: 'relationship',
      relationTo: 'keywords',
      hasMany: true,
    },
  ],
}

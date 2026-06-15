import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugify } from '../../lib/slugify'

/** Work history surfaced at /experience (one anchored section per role). */
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
      // Anchor target for /experience#slug and the search href. Auto-derived
      // from the role when left blank, but editable + stable: once set it does
      // not track later role edits, so existing bookmarks/search hrefs survive
      // a role rename. Unique to guarantee a single DOM id per anchor.
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'URL anchor for /experience#slug. Auto-filled from the role if left blank; editable.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) =>
            value || (typeof data?.role === 'string' ? slugify(data.role) : value),
        ],
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'monthOnly',
              displayFormat: 'MMMM yyyy',
            },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: {
            condition: (data) => !data?.current,
            date: {
              pickerAppearance: 'monthOnly',
              displayFormat: 'MMMM yyyy',
            },
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
      // Optional company mark, rendered via next/image on the experience card.
      name: 'companyLogo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional company logo.',
      },
    },
    {
      // Optional autoplay showcase reel. Authored lean (<4.5MB, server uploads);
      // picker is scoped to video assets only.
      name: 'showcase',
      type: 'upload',
      relationTo: 'media',
      filterOptions: () => ({ mimeType: { contains: 'video' } }),
      admin: {
        description: 'Optional autoplay showcase video (kept under 4.5MB at encode).',
      },
    },
    {
      // Renders as the hardcoded "Role Description" section — a list of prose
      // paragraphs (List, prose variant), not a single rich-text block.
      name: 'responsibilities',
      type: 'array',
      labels: { singular: 'Responsibility', plural: 'Responsibilities' },
      fields: [
        {
          name: 'text',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'scope',
      type: 'relationship',
      relationTo: 'keywords',
      hasMany: true,
      filterOptions: () => ({ category: { equals: 'scope' }, searchOnly: { not_equals: true } }),
      admin: { allowCreate: false },
    },
    {
      name: 'craft',
      type: 'relationship',
      relationTo: 'keywords',
      hasMany: true,
      filterOptions: () => ({ category: { equals: 'craft' }, searchOnly: { not_equals: true } }),
      admin: { allowCreate: false },
    },
    {
      // Hidden, search-only attachments. Never rendered on the page; flattened
      // into the search doc's aliases (see lib/search/dataset.ts) so these terms
      // surface this item without cluttering the card. Offers only searchOnly
      // keywords, so it never overlaps the scope/craft pickers.
      name: 'searchKeywords',
      type: 'relationship',
      relationTo: 'keywords',
      hasMany: true,
      filterOptions: () => ({ searchOnly: { equals: true } }),
      admin: {
        allowCreate: false,
        description: 'Hidden terms that surface this item in search but never render on the page.',
      },
    },
  ],
}

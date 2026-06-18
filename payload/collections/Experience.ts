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
      // Showcase gallery for the detail page: a main image + thumbnail strip.
      // Each item is an image with an optional "Visit site" url and caption.
      // Picker is scoped to image assets only.
      name: 'showcase',
      type: 'array',
      labels: { singular: 'Showcase item', plural: 'Showcase' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          filterOptions: () => ({ mimeType: { contains: 'image' } }),
        },
        {
          name: 'url',
          type: 'text',
          admin: { description: 'Optional "Visit site" link for this showcase image.' },
        },
        {
          name: 'label',
          type: 'text',
          admin: { description: 'Optional caption / accessible label for this image.' },
        },
      ],
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
      // Deep Dive: the storytelling band below the fold — a slider of
      // {team, details[]} entries (experience's analogue of Portfolio's Key
      // Decisions). Each entry pairs a "Team" narrative with a "Details" list.
      name: 'deepDive',
      type: 'array',
      labels: { singular: 'Deep Dive', plural: 'Deep Dive' },
      fields: [
        {
          name: 'team',
          type: 'textarea',
        },
        {
          name: 'details',
          type: 'array',
          labels: { singular: 'Detail', plural: 'Details' },
          fields: [{ name: 'text', type: 'textarea', required: true }],
        },
      ],
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

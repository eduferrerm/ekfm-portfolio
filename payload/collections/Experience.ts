import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateSite } from '../../lib/revalidate'
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
  hooks: {
    // A role feeds its detail page (+ scoped twin), the landing cards, and the
    // search corpus, so an edit revalidates the whole tree on demand.
    afterChange: [() => revalidateSite()],
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
        description:
          'URL anchor for /experience#slug. Auto-filled from the role if left blank; editable.',
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
          // Optional override for the link button's text. Defaults to "Visit
          // site" when blank, and only matters (so only shows) when a url is set.
          name: 'linkLabel',
          type: 'text',
          admin: {
            description: 'Optional button text for the link (defaults to "Visit site").',
            condition: (_, siblingData) => Boolean(siblingData?.url),
          },
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
      filterOptions: () => ({ category: { equals: 'scope' } }),
      admin: { allowCreate: false },
    },
    {
      name: 'craft',
      type: 'relationship',
      relationTo: 'keywords',
      hasMany: true,
      filterOptions: () => ({ category: { equals: 'craft' } }),
      admin: { allowCreate: false },
    },
    {
      // Curated subset of this role's scope/craft tags to feature on the landing
      // card (the detail page still renders the full scope + craft). The picker
      // is restricted to keywords already attached above, so set scope/craft
      // first; spotlight has its own drag order, which is the card's render order.
      name: 'spotlight',
      type: 'relationship',
      relationTo: 'keywords',
      hasMany: true,
      required: true,
      maxRows: 5,
      filterOptions: ({ data }) => ({
        id: { in: [...(data?.scope ?? []), ...(data?.craft ?? [])] },
      }),
      admin: {
        allowCreate: false,
        description:
          'Up to 5 tags to feature on the landing card, chosen from the scope/craft set above (set those first). Drag to set card order.',
      },
    },
    {
      // Deep Dive: the storytelling band below the fold — a slider of
      // {title, description, details[]} entries (experience's analogue of
      // Portfolio's Key Decisions). Each entry pairs a titled narrative with a
      // "Details" list.
      name: 'deepDive',
      type: 'array',
      labels: { singular: 'Deep Dive', plural: 'Deep Dive' },
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
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
      filterOptions: () => ({ category: { equals: 'searchOnly' } }),
      admin: {
        allowCreate: false,
        description: 'Hidden terms that surface this item in search but never render on the page.',
      },
    },
  ],
}

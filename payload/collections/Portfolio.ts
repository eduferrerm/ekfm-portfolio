import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateSite } from '../../lib/revalidate'
import { slugify } from '../../lib/slugify'
import { DIAGRAM_OPTIONS } from '../../features/portfolio/graph/diagrams/keys'

/** Portfolio pieces ("features") surfaced at /portfolio/[slug]. */
export const Portfolio: CollectionConfig = {
  slug: 'portfolio',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'eyebrow', 'slug', 'order', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    // A piece feeds its detail page (+ scoped twin), the landing cards, and the
    // search corpus, so an edit revalidates the whole tree on demand.
    afterChange: [() => revalidateSite()],
  },
  fields: [
    {
      // Descriptive headline (e.g. "Website UX Personalisation").
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      // Short canonical name shown as the green eyebrow above the title, and as
      // the primary label in the (future) aside nav + related-content cards
      // (e.g. "Context Aware Routes"). Distinct from the headline `title`.
      name: 'eyebrow',
      type: 'text',
      required: true,
      admin: { description: 'Short feature name shown above the title and in nav/related cards.' },
    },
    {
      // Auto-derived from the title when left blank, but editable + stable once
      // set (mirrors Experience.slug) so hrefs/bookmarks survive a title rename.
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'URL slug for /portfolio/[slug]. Auto-filled from the title if left blank; editable.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) =>
            value || (typeof data?.title === 'string' ? slugify(data.title) : value),
        ],
      },
    },
    {
      // Explicit display order (not date-driven): listing sort + redirect target.
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description:
          'Sort order (ascending). Lower shows first; /portfolio redirects to the lowest.',
      },
    },
    {
      // Circular thumbnail for the aside nav + landing cards (both built later).
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
        description: 'Square/circular thumbnail for nav + landing cards.',
      },
    },
    {
      // Short lede; the search result description (see lib/search/dataset.ts).
      name: 'summary',
      type: 'textarea',
    },
    {
      // Detail-page Overview body: prose paragraphs (List `prose`).
      name: 'overview',
      type: 'array',
      labels: { singular: 'Overview paragraph', plural: 'Overview' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      // The single System Design diagram for this piece. Hand-authored in the
      // repo (features/portfolio/graph/diagrams) and linked by key; select-only.
      name: 'diagramKey',
      type: 'select',
      required: true,
      options: DIAGRAM_OPTIONS,
      admin: {
        description: 'System Design diagram (authored in features/portfolio/graph/diagrams).',
      },
    },
    {
      // Persistent subtitle under the hardcoded "Key Decisions" heading. Stays
      // fixed while slides are navigated. Falls back to `eyebrow` at render when
      // blank (see features/portfolio/portfolio.ts).
      name: 'keyDecisionsTitle',
      type: 'text',
      admin: { description: 'Subtitle under "Key Decisions". Defaults to the eyebrow when blank.' },
    },
    {
      // The N options/approaches considered, cycled by the slider. Each carries
      // a thumb up/down conclusion and a prose reasoning list.
      name: 'keyDecisions',
      type: 'array',
      labels: { singular: 'Key decision', plural: 'Key decisions' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        {
          name: 'conclusion',
          type: 'radio',
          required: true,
          defaultValue: 'up',
          options: [
            { label: '👍 Adopted', value: 'up' },
            { label: '👎 Rejected', value: 'down' },
          ],
        },
        {
          name: 'points',
          type: 'array',
          labels: { singular: 'Point', plural: 'Points' },
          fields: [{ name: 'text', type: 'textarea', required: true }],
        },
      ],
    },
    {
      // "Relevant content" — links to other work and to roles. Polymorphic.
      name: 'relatedContent',
      type: 'relationship',
      relationTo: ['portfolio', 'experience'],
      hasMany: true,
    },
    {
      // Two scoped relationship fields (not one mixed field), each filtered to
      // its Keywords category. Display = attach order (drag-reorder), not sorted.
      // On portfolio these render as one combined tag row; the taxonomy stays
      // homogeneous with Experience (no bespoke "tech" category).
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
      // Curated subset of this item's scope/craft tags to feature on the landing
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
      // Hidden, search-only attachments. Never rendered; flattened into the
      // search doc's aliases (see lib/search/dataset.ts). Offers only searchOnly
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

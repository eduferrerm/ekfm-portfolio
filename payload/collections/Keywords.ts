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
      // Phase 6 primitive, pulled forward. Marks a keyword as search-only:
      // never rendered, never offered in the scope/craft pickers. Attaches to
      // content via the `searchKeywords` relationship field to lift that item
      // in search without showing on the page (e.g. "fintech", "B2B SaaS").
      // (Phase 6 will also add a `target` for navigational search-only keywords.)
      name: 'searchOnly',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Hidden recruiter term — feeds search only, never rendered. Skips category.',
      },
    },
    {
      // Single-value axis for *descriptor* keywords: scope OR craft, never both.
      // Drives the two scoped relationship fields on Experience/Portfolio, which
      // filterOptions on this value so each picker only offers its own category.
      // Hidden + not required for search-only keywords (which carry no category).
      name: 'category',
      type: 'select',
      options: [
        { label: 'Scope', value: 'scope' },
        { label: 'Craft', value: 'craft' },
      ],
      admin: {
        condition: (data) => !data?.searchOnly,
        description: 'Scope = areas/domains (Frontend, Platform). Craft = skills & how (React, Testing).',
      },
      validate: (value: unknown, { siblingData }: { siblingData: { searchOnly?: boolean } }) => {
        if (!siblingData?.searchOnly && !value) {
          return 'Category is required for descriptor keywords.'
        }
        return true
      },
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

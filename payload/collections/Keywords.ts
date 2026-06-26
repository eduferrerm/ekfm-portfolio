import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateSite } from '../../lib/revalidate'
import { slugify } from '../../lib/slugify'

/** Tags used to relate and search across portfolio items and experience. */
export const Keywords: CollectionConfig = {
  slug: 'keywords',
  admin: {
    // The relationship pickers' server-side typeahead searches this stored
    // field — keep it on `label`. The "SO:" prefix for search-only rows is a
    // list-view-only Cell (see the `label` field below), not a virtual title,
    // so it never bleeds into the picker results.
    useAsTitle: 'label',
    defaultColumns: ['label', 'category', 'key'],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    // Keyword labels/aliases feed the rendered descriptor pills + the search
    // corpus, so an edit revalidates the whole tree on demand. (Bulk seeding
    // runs outside a request scope — revalidateSite swallows that and the daily
    // backstop covers it.)
    afterChange: [() => revalidateSite()],
  },
  fields: [
    {
      // Immutable machine identity. The seeder (scripts/seed-keywords.mts)
      // upserts by this key, so it must never change once a keyword exists —
      // field-level update access is denied to enforce that. `label` is the
      // editable human display; `key` is the stable handle the CSV owns.
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      access: { update: () => false },
      admin: {
        description:
          'Immutable machine key (seeder/exporter upsert identity). Auto-filled from the label if left blank; set once, cannot be edited after.',
      },
      hooks: {
        // Auto-derive a clean machine key from the label when left blank (CMS
        // create), mirroring the slug pattern on Portfolio/Experience. On update
        // the value is already set (and access denies changes), so `value ||`
        // returns it unchanged — the key stays the stable upsert identity that
        // the seed/export round-trip keys on.
        beforeValidate: [
          ({ value, data }) =>
            value || (typeof data?.label === 'string' ? slugify(data.label) : value),
        ],
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        components: {
          // List-view-only: prefixes "SO:" on search-only rows so hidden
          // recruiter terms read distinctly in the admin list. Does not affect
          // the stored value or the relationship picker typeahead.
          Cell: '@/payload/components/KeywordLabelCell#KeywordLabelCell',
        },
      },
    },
    {
      // The keyword's single axis. `scope`/`craft` are *descriptor* keywords —
      // rendered, and offered in the two scoped pickers on Experience/Portfolio
      // (each filterOptions on this value). `searchOnly` keywords are never
      // rendered and attach only via `searchKeywords` (hidden recall terms like
      // "fintech", "B2B SaaS"). Required for every keyword — the old searchOnly
      // boolean folded into this third value. (Phase 6 dropped `slug`; keywords
      // carry no URL identity.)
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Scope', value: 'scope' },
        { label: 'Craft', value: 'craft' },
        { label: 'Search-only', value: 'searchOnly' },
      ],
      admin: {
        description:
          'Scope = areas/domains (Frontend, Platform). Craft = skills & how (React, Testing). Search-only = hidden recruiter term, feeds search only, never rendered.',
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

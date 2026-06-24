import type { CollectionConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugify } from '../../lib/slugify'

/** Per-company visitor landing data surfaced at /dear/[company]. */
export const Visitors: CollectionConfig = {
  slug: 'visitors',
  admin: {
    useAsTitle: 'company',
    defaultColumns: ['company', 'role', 'slug', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    // On-demand ISR: publishing/editing a visitor refreshes its /dear page. A
    // slug rename revalidates the old path too so the stale page drops out.
    afterChange: [
      ({ doc, previousDoc }) => {
        // Best-effort cache hint. revalidatePath only works inside a Next request
        // scope, so swallow the throw when writing from a script (seed/migration)
        // — the page is ISR and self-heals on its next revalidate regardless.
        try {
          revalidatePath(`/dear/${doc.slug}`)
          if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
            revalidatePath(`/dear/${previousDoc.slug}`)
          }
        } catch {
          // Not in a request context (e.g. programmatic create) — ignore.
        }
      },
    ],
  },
  fields: [
    {
      name: 'company',
      type: 'text',
      required: true,
    },
    {
      // The position the company is hiring for (e.g. "Senior Product Engineer").
      // Rendered as "Company: {role}" on the Expectations card.
      name: 'role',
      type: 'text',
      required: true,
    },
    {
      // Anchor for /dear/[company]. Auto-derived from the company name when left
      // blank, but editable + stable once set (mirrors Experience/Portfolio
      // slug) so a published link survives a company rename.
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'URL slug for /dear/[company]. Auto-filled from the company if left blank; editable.',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) =>
            value || (typeof data?.company === 'string' ? slugify(data.company) : value),
        ],
      },
    },
    {
      // Company mark shown as the avatar in the welcome banner + Expectations
      // card. Bytes live in Media / Vercel Blob; this stores only the FK.
      name: 'companyLogo',
      type: 'upload',
      relationTo: 'media',
      admin: { position: 'sidebar', description: 'Company avatar for the welcome banner + card.' },
    },
    {
      // The job post the expectations were sourced from ("Job Post Here" button).
      name: 'jobPostUrl',
      type: 'text',
      required: true,
      admin: { description: 'Link to the job post the expectations were sourced from.' },
    },
    {
      // The N candidate expectations picked from the job post. Each pairs a
      // reply (prose paragraphs rendered as a two-column block) with the site
      // content that supports it. Cycled by the Expectations slider.
      name: 'expectations',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Expectation', plural: 'Expectations' },
      fields: [
        {
          name: 'expectation',
          type: 'textarea',
          required: true,
          // Matches the design comp's expectation headline 1:1 (133-char sample,
          // zero headroom) so authored content can't outgrow the slider card.
          maxLength: 133,
        },
        {
          // The reply contrasting the candidate against this expectation. A
          // single body of prose (blank lines separate paragraphs); the UI flows
          // it into two balanced columns at any length so the slide + nav stay
          // within one viewport.
          name: 'reply',
          type: 'textarea',
          required: true,
          // Matches the design comp's 4-paragraph reply 1:1 (510-char sample,
          // including the blank-line paragraph separators) so it flows into the
          // two-column block within one viewport, no headroom.
          maxLength: 510,
        },
        {
          // Per-expectation supporting content. Polymorphic (mirrors
          // Portfolio.relatedContent); each item resolves to a thumbnail + label
          // card and seeds the visitor search-palette empty state (Phase 6).
          name: 'relevantContent',
          type: 'relationship',
          relationTo: ['portfolio', 'experience'],
          hasMany: true,
        },
      ],
    },
  ],
}

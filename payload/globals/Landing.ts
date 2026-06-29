import type { GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidateSite } from '../../lib/revalidate'
import { slugify } from '../../lib/slugify'

/**
 * The landing page composed at `/` (plain) and `/dear/[company]` (visitor-aware,
 * which additionally mounts the welcome banner + Dear Company band). One global,
 * fully CMS-editable, so there is NO code-level section manifest:
 *
 * - `sections[]` is the CMS replacement for that manifest — the ordered, navigable
 *   bands. It drives three surfaces: the persistent nav, the anchor id stamped on
 *   each band (`slugify(navLabel)`), and the search palette's `section` docs
 *   (`href: /#${slug}`). Reorder / relabel / re-alias here, no deploy.
 * - The per-band *copy* lives in the structured groups below; the per-band *render*
 *   is bespoke (Drive/Craft grid, prose blocks, projected cards, CTA), so the only
 *   code-bound piece is the `key` enum — a section type must bind to a renderer,
 *   you can't CMS-invent a band with no component.
 *
 * Hero is the un-anchored top band (nav hidden during it) so it is not a `sections`
 * entry — just its own copy group. The Dear Company band is injected by the visitor
 * route, not authored here.
 */

/** The renderable section types. Each binds to a band component in the Landing RSC. */
const SECTION_KEYS = ['tldr', 'experience', 'portfolio', 'moreAboutMe', 'contact'] as const

/** Reusable prose-array field (blank-line-free paragraphs), mirrors Experience/Portfolio. */
const proseArray = (name: string, singular: string, plural: string) => ({
  name,
  type: 'array' as const,
  labels: { singular, plural },
  fields: [{ name: 'text', type: 'textarea' as const, required: true }],
})

/** The shared "landing section" copy shape — heading + descriptive subheader, a
 * labelled "Dive into" list, and the card CTA label. Used identically by the
 * Experience and Portfolio bands (the cards themselves project from the
 * collections, not from here). */
const landingSectionGroup = (
  name: string,
  heading: string,
  subheaderDefault: string,
  ctaDefault: string,
) => ({
  name,
  type: 'group' as const,
  fields: [
    { name: 'heading', type: 'text' as const, defaultValue: heading },
    { name: 'subheader', type: 'textarea' as const, defaultValue: subheaderDefault },
    {
      name: 'diveInto',
      type: 'group' as const,
      fields: [
        { name: 'subheader', type: 'text' as const, defaultValue: 'Dive into' },
        proseArray('items', 'Item', 'Items'),
      ],
    },
    // The label on every card's CTA button in this band.
    { name: 'ctaLabel', type: 'text' as const, defaultValue: ctaDefault },
  ],
})

export const Landing: GlobalConfig = {
  slug: 'landing',
  access: {
    read: anyone,
    update: authenticated,
  },
  hooks: {
    // Landing copy fans out to `/` AND every /dear/[company] mirror (one shared
    // RSC), so an edit revalidates the whole tree on demand — not just `/`.
    afterChange: [() => revalidateSite()],
  },
  fields: [
    {
      // The navigable bands. Order = nav + scroll order; the visitor "Dear Company"
      // band is injected ahead of these by the /dear route.
      name: 'sections',
      type: 'array',
      labels: { singular: 'Section', plural: 'Sections' },
      admin: {
        components: {
          // Collapsed-row label = the section's nav label (not "Section 01/02…"),
          // so the nav spine is scannable. See payload/components/SectionRowLabel.
          RowLabel: '@/payload/components/SectionRowLabel#SectionRowLabel',
        },
      },
      // Pre-seed the spine so the nav works out of the box; editable thereafter.
      defaultValue: [
        { key: 'tldr', navLabel: 'TLDR' },
        { key: 'experience', navLabel: 'Experience' },
        { key: 'portfolio', navLabel: 'Portfolio' },
        { key: 'moreAboutMe', navLabel: 'More About Me' },
        { key: 'contact', navLabel: 'Contact' },
      ],
      // Build-/save-time guard: anchors are slugify(navLabel), so duplicate slugs
      // (or a label that slugs to nothing) would collide DOM ids; a repeated key
      // would double-render its band. Reject either.
      validate: (value: unknown) => {
        if (!Array.isArray(value)) return true
        const slugs = new Set<string>()
        const keys = new Set<string>()
        for (const row of value) {
          const navLabel = typeof row?.navLabel === 'string' ? row.navLabel : ''
          const slug = slugify(navLabel)
          if (!slug) return 'Every section needs a nav label that yields a non-empty anchor.'
          if (slugs.has(slug))
            return `Duplicate section anchor "${slug}" — nav labels must be unique.`
          slugs.add(slug)
          const key = row?.key
          if (typeof key === 'string') {
            if (keys.has(key)) return `Section "${key}" is listed more than once.`
            keys.add(key)
          }
        }
        return true
      },
      fields: [
        {
          name: 'key',
          type: 'select',
          required: true,
          options: SECTION_KEYS.map((value) => ({ label: value, value })),
          admin: {
            description:
              'Which band this is. Binds to its renderer; the copy comes from the matching group below.',
          },
        },
        {
          name: 'navLabel',
          type: 'text',
          required: true,
          admin: {
            description:
              'Nav text. The band’s anchor id + search title derive from this (slugified).',
          },
        },
        {
          // Hidden, search-only keywords that surface this section on curated
          // recall terms (e.g. "hobbies" -> More About Me) without rendering on
          // the page — the single recall lane for sections (free-text per-section
          // `aliases[]` was retired; all section synonyms are curated keywords
          // now). The keyword's label + aliases fold into this section's search
          // aliases (see lib/search/dataset.ts). Offers only searchOnly keywords,
          // so it never overlaps scope/craft.
          name: 'searchKeywords',
          type: 'relationship',
          relationTo: 'keywords',
          hasMany: true,
          filterOptions: () => ({ category: { equals: 'searchOnly' } }),
          admin: {
            allowCreate: false,
            description: 'Hidden terms that surface this section in search but never render.',
          },
        },
      ],
    },
    {
      // Top band: "PRODUCT ENGINEERING" + Drive (prose) + a "Craft & Scope" tag
      // list. Un-anchored — nav is hidden over the hero — so not a `sections`
      // entry. The tag list is two CMS-distinct pickers (craft, then scope) that
      // the hero render concatenates under one `listLabel`.
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', defaultValue: 'PRODUCT ENGINEERING' },
        { name: 'driveLabel', type: 'text', defaultValue: 'Drive' },
        // Free prose, a single textarea (was a repeatable row list). The hero
        // renders it as one block, honouring any line breaks the author types.
        { name: 'drive', type: 'textarea' },
        // Single label over the combined craft+scope tag list (render concatenates
        // the two pickers below). Kept as one editable string, not per-picker.
        { name: 'listLabel', type: 'text', defaultValue: 'Craft & Scope' },
        {
          // Curated craft tags, CMS-ordered (display = attach order, drag-reorder,
          // no render-time sort) — the descriptor pattern from Portfolio/Experience.
          // Scoped to craft keywords, hidden search-only tags excluded. Rendered
          // first, before `scope`, under the shared `listLabel`.
          name: 'craft',
          type: 'relationship',
          relationTo: 'keywords',
          hasMany: true,
          filterOptions: () => ({ category: { equals: 'craft' } }),
          admin: {
            allowCreate: false,
            description: 'Craft keywords shown in the hero (before scope), in attach order.',
          },
        },
        {
          // Curated scope tags, same descriptor pattern. Scoped to scope keywords;
          // rendered after `craft` under the shared `listLabel` ("Craft & Scope").
          name: 'scope',
          type: 'relationship',
          relationTo: 'keywords',
          hasMany: true,
          filterOptions: () => ({ category: { equals: 'scope' } }),
          admin: {
            allowCreate: false,
            description: 'Scope keywords shown in the hero (after craft), in attach order.',
          },
        },
      ],
    },
    {
      // The TL;DR band ("Hi there! I'm Edu") — a greeting plus an array of titled
      // prose blocks (the bio "Background" block is the first). Long single column.
      name: 'tldr',
      type: 'group',
      fields: [
        { name: 'greeting', type: 'text', defaultValue: "Hi there! I'm Edu 👋" },
        // Lead paragraph under the greeting, above the titled blocks (e.g. "Here's
        // a quick summary of who I am and what I do if you're short on time").
        {
          name: 'subtitle',
          type: 'textarea',
          defaultValue:
            "Here's a quick summary of who I am and what I do if in case you're short on time",
        },
        {
          name: 'blocks',
          type: 'array',
          labels: { singular: 'Block', plural: 'Blocks' },
          fields: [
            { name: 'title', type: 'text', required: true },
            proseArray('body', 'Paragraph', 'Body'),
          ],
        },
      ],
    },
    landingSectionGroup(
      'experience',
      'Experience',
      'The roles and teams where I have shipped product.',
      'View Role',
    ),
    landingSectionGroup(
      'portfolio',
      'Portfolio',
      'The features, systems, and architectural decisions that power this website.',
      'Feature Details',
    ),
    {
      // "More about me" band. The copy + teaser card land now; the relational map
      // itself (CSV->JSON pipeline + GraphClient) is its own feature branch and
      // fills the space between the heading and the card. The teaser card
      // contextualises that upcoming feature.
      name: 'moreAboutMe',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', defaultValue: 'More about me' },
        {
          name: 'subheader',
          type: 'textarea',
          defaultValue: 'Slight chance that perhaps too much, lol',
        },
        {
          name: 'teaser',
          type: 'group',
          fields: [
            { name: 'eyebrow', type: 'text', defaultValue: 'Mental Graph' },
            {
              name: 'title',
              type: 'text',
              defaultValue: 'Relational Map Of ChatGPT Conversations',
            },
            { name: 'description', type: 'textarea' },
            proseArray('items', 'Item', 'Items'),
            {
              name: 'ctaLabel',
              type: 'text',
              defaultValue: 'Read the write-up',
              admin: {
                description:
                  'Button text. The button only renders when a portfolio write-up is attached below.',
              },
            },
            {
              // Attach the portfolio detail page that documents this feature. The
              // band's CTA button renders only when this is set (→ a real link to
              // /portfolio/[slug]); leave it empty to hide the button.
              name: 'ctaPortfolioItem',
              type: 'relationship',
              relationTo: 'portfolio',
              admin: {
                description:
                  'Portfolio write-up this section links to. Attach one to show the button; empty hides it.',
              },
            },
          ],
        },
      ],
    },
    {
      // Closing contact band: a CTA to reach out (the LinkedIn card in the mock).
      name: 'contact',
      type: 'group',
      fields: [
        { name: 'header', type: 'text', defaultValue: 'Contact' },
        {
          name: 'subheader',
          type: 'textarea',
          defaultValue: 'Thanks for taking the time to drop by and check out my portfolio 👋',
        },
        { name: 'description', type: 'textarea' },
        { name: 'ctaLabel', type: 'text' },
        { name: 'ctaUrl', type: 'text' },
      ],
    },
  ],
}

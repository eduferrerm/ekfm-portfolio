import type { GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/**
 * Fixed copy for the visitor routes (the welcome banner + the Dear Company
 * section chrome). Identical across every /dear/[company] route — only the
 * company name + per-expectation content vary — so it lives here as a single
 * editable source of truth rather than scattered consts. First Payload global
 * in the project; the Phase 5 global-doc work folds the existing
 * CONTENT_SUBHEADERS consts into this same pattern.
 */
export const VisitorContent: GlobalConfig = {
  slug: 'visitor-content',
  access: {
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      // Banner subtext under "Welcome {company}".
      name: 'welcomeGreeting',
      type: 'text',
      defaultValue: 'Thanks for making time to drop by!',
    },
    {
      // The explanatory bullets above the Expectations slider.
      name: 'intro',
      type: 'array',
      labels: { singular: 'Intro line', plural: 'Intro' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      // A phrase within `intro` to visually highlight (a bg-coloured span, not a
      // link) — surfaces that each expectation has a relevant-content section.
      name: 'highlightPhrase',
      type: 'text',
      admin: { description: 'Phrase in the intro to highlight (e.g. "Relevant content"). Optional.' },
    },
    {
      // Fixed UI strings for the Dear Company section (subheaders + button).
      // Defaults match the mock; editable so copy can be tuned without a deploy.
      name: 'constants',
      type: 'group',
      fields: [
        { name: 'expectations', type: 'text', defaultValue: 'Expectations' },
        { name: 'reply', type: 'text', defaultValue: 'Reply' },
        { name: 'relevantContent', type: 'text', defaultValue: 'Relevant content' },
        { name: 'jobPost', type: 'text', defaultValue: 'Job Post Here' },
      ],
    },
  ],
}

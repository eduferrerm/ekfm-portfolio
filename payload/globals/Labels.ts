import type { GlobalConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

/**
 * Fixed section subheaders for the content detail pages — the labels that must
 * read the same across every item of a type (every portfolio detail shows the
 * same "Overview"/"System Design"/…; every experience the same "Role
 * Description"/"Scope"/"Craft"). Formerly the `CONTENT_SUBHEADERS` code const;
 * refactored to a global so the copy is CMS-editable without a deploy.
 *
 * Grouped under `constants` so it renders as a titled "Constants" section in the
 * admin, matching the convention established by VisitorContent.constants. The
 * defaults match the prior consts, so a fresh global already reads correctly.
 */
export const Labels: GlobalConfig = {
  slug: 'labels',
  access: {
    read: anyone,
    update: authenticated,
  },
  fields: [
    {
      name: 'constants',
      type: 'group',
      fields: [
        {
          name: 'portfolio',
          type: 'group',
          fields: [
            { name: 'overview', type: 'text', defaultValue: 'Overview' },
            { name: 'systemDesign', type: 'text', defaultValue: 'System Design' },
            { name: 'keyDecisions', type: 'text', defaultValue: 'Key Decisions' },
            { name: 'conclusion', type: 'text', defaultValue: 'Conclusion' },
            { name: 'relevantContent', type: 'text', defaultValue: 'Relevant content' },
          ],
        },
        {
          name: 'experience',
          type: 'group',
          fields: [
            { name: 'roleDescription', type: 'text', defaultValue: 'Role Description' },
            { name: 'scope', type: 'text', defaultValue: 'Scope' },
            { name: 'craft', type: 'text', defaultValue: 'Craft' },
          ],
        },
      ],
    },
  ],
}

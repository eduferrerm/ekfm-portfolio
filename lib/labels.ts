/**
 * Shared, render-only section subheaders — the fixed labels that must read the
 * same across every item of a content type (every portfolio detail shows the
 * same "Overview"/"System Design"/… headings; every experience the same
 * "Role Description"/"Scope"/"Craft").
 *
 * Kept in code, not the CMS, on purpose: these are UI chrome, not content, so
 * they carry zero schema surface (no global, no table, nothing to migrate or
 * drop). Edit here once and it propagates everywhere; values are shared by
 * reference, so items can't drift apart. If CMS-editing without a deploy is ever
 * needed, back this module with a `Labels` global then.
 */
export const CONTENT_SUBHEADERS = {
  portfolio: {
    overview: 'Overview',
    systemDesign: 'System Design',
    keyDecisions: 'Key Decisions',
    conclusion: 'Conclusion',
    relevantContent: 'Relevant content',
  },
  experience: {
    roleDescription: 'Role Description',
    scope: 'Scope',
    craft: 'Craft',
  },
} as const

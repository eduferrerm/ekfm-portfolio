import 'server-only'

import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Fixed content-detail subheaders — the labels that read the same across every
 * item of a type (every portfolio detail shows "Overview"/"System Design"/…;
 * every experience "Role Description"/"Scope"/"Craft").
 *
 * Source of truth is now the `Labels` global (CMS-editable, `constants` group);
 * these are the fallback so a blank or unsaved global still renders correct copy.
 * Read with `getSubheaders()` in a server component, then thread the relevant
 * group down as props — client components (e.g. KeyDecisions) can't read the
 * global themselves.
 */
export const SUBHEADER_DEFAULTS = {
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

export type Subheaders = {
  portfolio: Record<keyof typeof SUBHEADER_DEFAULTS.portfolio, string>
  experience: Record<keyof typeof SUBHEADER_DEFAULTS.experience, string>
}

/**
 * Resolve the detail-page subheaders from the Labels global, falling back to the
 * defaults for any blank/unset field (`||` treats '' and null as unset). One
 * findGlobal per page; thread the result down as props.
 */
export async function getSubheaders(): Promise<Subheaders> {
  const payload = await getPayload({ config })
  const { constants } = await payload.findGlobal({ slug: 'labels', depth: 0 })
  const p = constants?.portfolio
  const e = constants?.experience
  const d = SUBHEADER_DEFAULTS

  return {
    portfolio: {
      overview: p?.overview || d.portfolio.overview,
      systemDesign: p?.systemDesign || d.portfolio.systemDesign,
      keyDecisions: p?.keyDecisions || d.portfolio.keyDecisions,
      conclusion: p?.conclusion || d.portfolio.conclusion,
      relevantContent: p?.relevantContent || d.portfolio.relevantContent,
    },
    experience: {
      roleDescription: e?.roleDescription || d.experience.roleDescription,
      scope: e?.scope || d.experience.scope,
      craft: e?.craft || d.experience.craft,
    },
  }
}

import type { IFuseOptions } from 'fuse.js'

/**
 * Flat, denormalized document the search palette indexes over. Built
 * server-side from navigable surfaces (portfolio items, experience, and landing
 * sections) so the client only ever sees one uniform shape.
 *
 * `keyword` was dropped from the union in Phase 6 (Open #6): keyword docs had no
 * real destination once the navigational `target` mechanism was retired
 * (sections own navigation now), and a keyword's recall value already folds into
 * the content docs it tags — descriptor labels ride in `keywords[]`, and both
 * those and `searchKeywords` synonyms ride in `aliases[]`. So a search for
 * "React" still surfaces the tagged portfolio/experience items; it just no
 * longer produces an un-openable standalone "React" result.
 */
export type SearchDocumentType = 'portfolio' | 'experience' | 'section'

export type SearchDocument = {
  id: string
  type: SearchDocumentType
  /**
   * Category eyebrow shown above the name in a result row ("Feature" /
   * "Experience" / "Section"). Mirrors the shared card contract used by the
   * visitor relevant-content cards. Display only.
   */
  label: string
  /**
   * The bold display line of a result row: portfolio eyebrow, experience
   * company, or section navLabel. Searchable (see Fuse keys) and rendered.
   */
  name: string
  /** Resolved thumbnail/logo URL (portfolio thumbnail, experience companyLogo). Display only. */
  thumbnail?: string
  /**
   * Fuse-searchable primary text — NOT always what's displayed. experience:
   * "role · company" (so "IC5" matches a row that shows only "Meta"); portfolio:
   * the headline title; section: the navLabel. Carries terms the `name` omits.
   */
  title: string
  description?: string
  keywords: string[]
  /** Recruiter-term synonyms of this doc's keywords. Fed to Fuse, never rendered. */
  aliases: string[]
  /** Route to navigate to when this result is selected. */
  href: string
}

/**
 * Fuse config shared by the index build. Title leads (carries the fullest
 * searchable text); the displayed name sits just below so a portfolio eyebrow
 * or company name matches strongly; rendered descriptor keywords next;
 * recruiter-synonym aliases just under those so a query like "k8s" or "FE" still
 * lifts the Kubernetes/Frontend-tagged item without out-shouting a real title
 * match; prose description is the weakest signal. `minMatchCharLength: 2` keeps
 * single-character noise out while still matching short real terms ("AI", "QA").
 *
 * `threshold: 0.3` (tightened from 0.4): at 0.4 a 5-char query like "hippo"
 * fuzzy-matched the "hip" inside owner**ship** (an alias of the `e2e-ownership`
 * keyword), surfacing every item tagged with it. 0.3 rejects that 2-error
 * fragment match while still admitting genuine typos (e.g. "ownrship" → 0.29,
 * "custm" → 0.36) and all exact/prefix hits (≤0.05).
 */
export const SEARCH_FUSE_OPTIONS: IFuseOptions<SearchDocument> = {
  includeScore: true,
  threshold: 0.3,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'name', weight: 0.4 },
    { name: 'keywords', weight: 0.3 },
    { name: 'aliases', weight: 0.25 },
    { name: 'description', weight: 0.1 },
  ],
}

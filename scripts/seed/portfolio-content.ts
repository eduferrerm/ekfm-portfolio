/**
 * Version-controlled source-of-truth for Portfolio (feature-detail) content,
 * seeded into the DB by scripts/seed-portfolio.mts (`pnpm seed:portfolio`).
 *
 * Why a TS module and not a CSV (like keywords): Portfolio rows are deeply
 * nested (overview paragraphs, keyDecisions with their own points arrays) and
 * carry keyword relationships — a flat CSV can't represent that without ugly
 * encoding. Keyword/relatedContent links are written by STABLE KEY/SLUG here
 * and resolved to numeric IDs at seed time, so this file survives a rebuild.
 *
 * Authoring rules (match across all features for the uniform-height slider):
 *   - keyDecisions: max 5 per feature
 *   - each decision: max 3 points, ~102 words total across those points
 *   - `slug` is pinned explicitly so it never drifts when the title changes
 *   - keyword fields hold keyword `key`s (see scripts/seed/keywords.csv)
 *   - `spotlight` must be a subset of scope ∪ craft, max 5
 */

export type Conclusion = 'up' | 'down'

export type PortfolioSeedDecision = {
  title: string
  conclusion: Conclusion
  description?: string
  points: string[]
}

export type PortfolioSeedRelated = {
  relationTo: 'portfolio' | 'experience'
  slug: string
}

export type PortfolioSeedEntry = {
  slug: string
  order?: number
  eyebrow: string
  title: string
  summary: string
  diagramKey: string
  overview: string[]
  /** null clears any stale value so the page falls back to `eyebrow`. */
  keyDecisionsTitle?: string | null
  keyDecisions: PortfolioSeedDecision[]
  scope: string[]
  craft: string[]
  spotlight: string[]
  searchKeywords?: string[]
  relatedContent?: PortfolioSeedRelated[]
}

export const PORTFOLIO_CONTENT: PortfolioSeedEntry[] = [
  {
    slug: 'website-ux-personalisation',
    order: 0,
    eyebrow: 'Context-Aware Routes',
    title: 'Website UX Personalization',
    summary:
      'Every recruiter who opens a /dear/[company] link gets a private, edge-cached twin of the entire site — and never falls out of their scope, by construction.',
    diagramKey: 'context-aware-routes',
    overview: [
      "When I apply somewhere, I don't want to send a generic portfolio — I want to hand that company a version of the site that speaks to them: a cover-letter band, expectation-matched content, their name in the nav. The hard part isn't the personalization, it's doing it without (a) breaking the edge-cache that keeps the public site fast, (b) leaking the list of companies I'm targeting, or (c) letting a single un-scoped link drop a visitor back onto the generic site mid-visit.",
      'The answer is a mirror: the whole site is duplicated under /dear/[company]/… as real route twins that reuse the exact same render code as the canonical pages — no content duplication, just a scope prefix threaded through every link. The canonical site stays byte-for-byte unchanged; the personalization rides entirely on the ISR cache.',
      'What makes it interesting as an engineering story is that almost every decision was forced by a genuine three-way trade-off between cacheable, bulletproof, and simple — and most of them are now machine-enforced so they can’t silently rot.',
    ],
    keyDecisionsTitle: null,
    keyDecisions: [
      {
        title: 'Two thin route trees sharing one view',
        conclusion: 'up',
        points: [
          "Next's static/dynamic boundary is per-route, forcing a trilemma — single-tree, edge-cached, bulletproof-scoped: pick two.",
          'Company-as-route-param (/dear/[company]) keeps scoped pages edge-cached and the canonical site static, with links correct server-side — no hydration flash.',
          'The cost, section parity between the trees, is paid down by a CI test, not vigilance.',
        ],
      },
      {
        title: 'Path-based /dear/[company], not subdomains',
        conclusion: 'up',
        points: [
          'Subdomains leak the targeted-company list via Certificate-Transparency logs and add infra.',
          'A path segment is non-enumerable and ships zero infra.',
          'Subdomains can layer on later if ever wanted.',
        ],
      },
      {
        title: 'One scopeHref chokepoint, threaded server-side',
        conclusion: 'up',
        points: [
          'Every link funnels through a single function — cards, nav, related content, redirects, the logo.',
          'One place to reason about leaks; an empty scope returns the path unchanged, so canonical output is provably identical.',
          'Anchors and absolute URLs pass through untouched.',
        ],
      },
      {
        title: 'CI route-parity test derived from the filesystem',
        conclusion: 'up',
        points: [
          'A test walks the routes, finds every canonical section, and asserts each has a /dear/[company] twin that declares noindex.',
          'Add a section without its scoped twin → CI fails, not a recruiter.',
          'Turns "keep the trees in lock-step" from discipline into a machine-checked invariant.',
        ],
      },
      {
        title: 'Unknown company → 307 redirect to /',
        conclusion: 'up',
        points: [
          'A mistyped or expired link should land on the real portfolio, not a dead-end 404.',
          'The guard wraps the whole subtree, so deeper routes redirect too — no half-personalized page renders.',
          '307 not 308: a company can be seeded later, so the mapping isn’t permanent.',
        ],
      },
    ],
    scope: ['frontend', 'platform', 'product-engineering'],
    craft: [
      'nextjs',
      'rendering-strategies',
      'frontend-architecture',
      'system-design',
      'performance',
      'testing',
      'seo',
    ],
    spotlight: ['rendering-strategies', 'frontend-architecture', 'nextjs', 'platform', 'performance'],
    searchKeywords: ['e2e-ownership'],
  },
]

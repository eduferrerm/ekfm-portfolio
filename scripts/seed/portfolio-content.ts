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
 *   - each decision: `description` = "the idea" (renders left), `points` = the
 *     conclusion (max 3 bullets, ~102 words total, renders right)
 *   - `conclusion` is 'up' (adopted); rejected alternatives live in the points
 *   - slide `title` ≤ 5 words; feature `title` kept short (eyebrow gives context)
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
  // ─────────────────────────────────────────────────────────────────────────
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
        description:
          "Next's static/dynamic boundary is per route module, so personalizing the whole site forces a trilemma — single tree, edge-cached, bulletproof-scoped links. You can only pick two.",
        points: [
          "Next's static/dynamic boundary is per-route, forcing a trilemma — single-tree, edge-cached, bulletproof-scoped: pick two.",
          'Company-as-route-param (/dear/[company]) keeps scoped pages edge-cached and the canonical site static, with links correct server-side — no hydration flash.',
          'The cost, section parity between the trees, is paid down by a CI test, not vigilance.',
        ],
      },
      {
        title: 'Path-based /dear/[company], not subdomains',
        conclusion: 'up',
        description:
          'A personalized link has to identify the company somewhere. The two real options were a path segment or a per-company subdomain — and one of them quietly leaks the list of companies I’m targeting.',
        points: [
          'Subdomains leak the targeted-company list via Certificate-Transparency logs and add infra.',
          'A path segment is non-enumerable and ships zero infra.',
          'Subdomains can layer on later if ever wanted.',
        ],
      },
      {
        title: 'One scopeHref chokepoint, threaded server-side',
        conclusion: 'up',
        description:
          'Inside a company mirror, every link has to stay scoped — a single stray href drops the visitor back onto the canonical site mid-visit. The question is where that scoping should live.',
        points: [
          'Every link funnels through a single function — cards, nav, related content, redirects, the logo.',
          'One place to reason about leaks; an empty scope returns the path unchanged, so canonical output is provably identical.',
          'Anchors and absolute URLs pass through untouched.',
        ],
      },
      {
        title: 'CI route-parity test derived from the filesystem',
        conclusion: 'up',
        description:
          'Two parallel route trees only stay in lock-step through discipline — add a section to one and forget its twin, and a recruiter finds the gap. Can the repo enforce parity instead of me?',
        points: [
          'A test walks the routes, finds every canonical section, and asserts each has a /dear/[company] twin that declares noindex.',
          'Add a section without its scoped twin → CI fails, not a recruiter.',
          'Turns "keep the trees in lock-step" from discipline into a machine-checked invariant.',
        ],
      },
      {
        title: 'Unknown company → 307 redirect to /',
        conclusion: 'up',
        description:
          'A mistyped or expired /dear/[company] link has to resolve to something. A dead-end 404 is the wrong landing for a recruiter who clicked a link I sent them.',
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

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'website-stack',
    order: 1,
    eyebrow: 'Website Stack',
    title: 'The Portfolio Is the Exhibit',
    summary:
      'A code-first CMS, in-process rendering, on-demand cache invalidation, and a deliberately split serverless/stateful hosting model — every architectural choice is one I can defend on camera, because the site is the exhibit.',
    diagramKey: 'website-stack',
    overview: [
      "This site has a recursive problem to solve: it's a portfolio about my engineering, so its own architecture is on display. A drag-and-drop site builder would undercut the whole pitch. So every layer is a defensible choice — content as version-controlled code, rendering with no network hop, freshness that's instant rather than timed, and a hosting split that respects what's stateless and what isn't.",
      'The throughline is "generate or guard everything that can drift, and keep the hot path boring." Content lives in code-first Payload collections; pages render through the in-process Local API (the public GraphQL endpoint exists purely as a skill-signal surface, never on the render path); a single revalidateSite() makes any publish go live in seconds; and the stack is split across Vercel (serverless app), Railway (stateful Postgres), and Vercel Blob (media) because those are three different jobs.',
      "It's also honest about what isn't done: production migration infra is intentionally parked behind a documented launch sequence, with the parked main branch acting as a guard rail rather than a half-finished deploy.",
    ],
    keyDecisionsTitle: null,
    keyDecisions: [
      {
        title: 'Code-first CMS over visual',
        conclusion: 'up',
        description:
          'This site is a portfolio about engineering, so its own architecture is on display. A drag-and-drop site builder or a SaaS CMS would hide the schema and undercut the whole pitch.',
        points: [
          'Collections are TypeScript in the repo, so the schema is version-controlled and reviewed like code rather than clicked into a dashboard, with Drizzle and Postgres underneath for real SQL and migrations.',
          'Strapi, Contentful, and visual CMSes were rejected for hiding the schema and adding per-seat lock-in — the opposite of what a self-hostable, code-first stack demonstrates.',
          'Every layer is chosen to be defensible on camera, because the site is itself the exhibit: a builder would quietly contradict the work it’s meant to show.',
        ],
      },
      {
        title: 'Local API on hot path',
        conclusion: 'up',
        description:
          'Payload exposes both an in-process Local API and an HTTP GraphQL endpoint. Rendering pages over HTTP adds a network hop and latency under traffic, for no benefit on a server that already holds the data.',
        points: [
          'Every page renders by reading Payload in-process through the Local API — no HTTP hop, no network latency under load.',
          'The built-in GraphQL endpoint stays enabled purely as a skill-signal surface for visitors who want to poke it, but it is never on the render path.',
          'Keeping the hot path boring and in-process is the throughline; separating the demo surface from the production path means the GraphQL endpoint can stay public without ever slowing a real render.',
        ],
      },
      {
        title: 'Revalidate on demand, ISR backstop',
        conclusion: 'up',
        description:
          'Content freshness can be timed (ISR every N seconds) or event-driven. Timed alone means edits sit stale until the timer fires; the goal is publishes that go live in seconds.',
        points: [
          "Every content source's afterChange fires one whole-tree revalidateSite(), so an edit goes live in seconds across the canonical site and every visitor mirror at once.",
          'The whole-tree bust was chosen over per-source scoping: the Landing and VisitorContent globals fan out across every mirror, so per-source reasoning is error-prone for marginal savings on a small, cheap-to-regenerate site.',
          'A 24h ISR timer is demoted to a backstop for out-of-request writes like seeds and migrations, and warmVisitor prefills a freshly-published company’s page.',
        ],
      },
      {
        title: 'Split hosting by job',
        conclusion: 'up',
        description:
          'One host for everything is simplest, but Next and Payload are stateless while Postgres is stateful and media is bytes. Forcing them onto one box gets at least one of them wrong.',
        points: [
          'Three different jobs get three right-shaped hosts: serverless on Vercel for the stateless app, Railway for stateful Postgres, and Vercel Blob for media bytes.',
          'Local-disk uploads would break serverless, so media has to go to Blob; a single stateful VPS was rejected for reintroducing a server to patch and losing edge caching for the canonical site and every mirror.',
          "The split respects what's stateless and what isn't, rather than optimising for the convenience of one deploy target.",
        ],
      },
      {
        title: 'One pre-launch DB, parked migrations',
        conclusion: 'up',
        description:
          "Building migration infrastructure before launch is work spent on a problem you don't have yet. Pre-launch, nobody is served by prod, so destructive schema changes have nowhere to break.",
        points: [
          'Local, preview, and would-be-prod all point at one Railway database that local dev-push reaches, so destructive diffs stack against a DB nobody serves — no intermediate migrations needed.',
          'main is a parked prod branch with no prod env vars on purpose: a failed prod build there is an intentional guard rail, not a bug.',
          'At go-live the plan is documented — clone staging to prod, snapshot the schema as migration 0001 — so the gap is a known, deferred risk rather than a hidden one.',
        ],
      },
    ],
    scope: ['platform', 'frontend', 'product-engineering'],
    craft: ['nextjs', 'headless-cms', 'rendering-strategies', 'postgres', 'system-design', 'scalability'],
    spotlight: ['nextjs', 'headless-cms', 'rendering-strategies', 'postgres', 'system-design'],
    searchKeywords: ['e2e-ownership'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'search-palette',
    order: 2,
    eyebrow: 'Search Palette',
    title: 'Client-Side Command Palette',
    summary:
      'A Cmd-K palette over a Fuse.js index built at render from the Payload Local API — tuned to reject fuzzy garbage, scoped to keep visitors in their mirror, and personalized into a curated empty state for each company.',
    diagramKey: 'search-corpus',
    overview: [
      "Search on a content site usually means a hosted index (Algolia) and a sync pipeline. For a site this size that's overkill and a moving part that can go stale. Instead the whole corpus is flattened into a small SearchDocument[] at build/ISR time straight from the Local API, shipped as static JSON, and Fuse.js builds the index in the browser — no server round-trip, no index to keep in sync.",
      'The work that makes it feel good is in the edges: a fuzzy matcher tuned so typos still hit but "hippo" doesn\'t surface unrelated items; section results that resolve through the same scoping chokepoint the visitor mirror uses, so a recruiter never lands on a dead anchor; and an empty state that, for a visitor, is their curated relevant content rather than a blank box.',
      'It also became the proving ground for the component layer — the trigger, the facet chips, the result cards, and a shared MetaCard row all came out of building it.',
    ],
    keyDecisionsTitle: null,
    keyDecisions: [
      {
        title: 'Client-side search, no server',
        conclusion: 'up',
        description:
          'Site search usually means a hosted index like Algolia plus a sync pipeline that can go stale. For a site this size that’s overkill and a moving part — a second source of truth to keep aligned.',
        points: [
          'The whole corpus is flattened into a small SearchDocument[] at build/ISR time straight from the Local API and shipped as static JSON; Fuse.js builds the index in the browser.',
          'No Algolia, no server search endpoint, no sync job — and no stale index by construction, because the index is rebuilt from content every time the page is generated.',
          'A locked SearchDocument contract (portfolio | experience | section) keeps title as the searchable field with a weighted config, so the right field dominates recall.',
        ],
      },
      {
        title: 'Reject fuzzy garbage at source',
        conclusion: 'up',
        description:
          'A fuzzy matcher tuned too loose surfaces nonsense — "hippo" was matching the "hip" inside "ownership", an alias every item carries, at a score close to real typos. Tightening it can’t break genuine misspellings.',
        points: [
          'The Fuse threshold was lowered at source (0.4 → 0.3), tightening the per-field bitap so loose multi-error fragments are rejected while exact, prefix, and genuine typo hits still match.',
          'minMatchCharLength stays at 2 so short real terms like "AI" and "QA" survive the tighter matching.',
          'A post-hoc score cutoff was rejected: the combined score conflates a strong hit on a low-weight field with a weak one, so any cutoff that killed "hippo" sat too close to real typos.',
        ],
      },
      {
        title: 'Curated content as empty state',
        conclusion: 'up',
        description:
          'Under a visitor’s Company facet, typing a category word like "experience" returned nothing, because the curated list was a scope filtered by href and the category label isn’t indexed. The empty box was the wrong default.',
        points: [
          'The reframe: a visitor’s curated relevant content (grouped per expectation) is the empty state itself, not a blank box waiting for a query.',
          'The first keystroke auto-flips the facet to All and runs a real corpus search; clearing the field returns to the curated list, while a manual mid-query facet pick still sticks.',
          'Making the category label searchable was rejected — it pollutes general-search salience and misreads the feature’s purpose, which is to hand the visitor curated content first, then let them search everything.',
        ],
      },
      {
        title: 'Resolve links through one chokepoint',
        conclusion: 'up',
        description:
          'Searching a section from an inner page used to append a bare #slug to the current path — a dead anchor, because section anchors only render on the assembled landing, not on every route.',
        points: [
          'Section docs now ship a root-relative /#slug, and the palette runs every selected href through scopeHref(href, scopeFromPath(pathname)) before navigating.',
          'So a section resolves to /#more-about-me on the canonical site and /dear/ashby/#more-about-me inside a company mirror — the visitor never lands on a dead anchor.',
          'Reconstructing "the landing route for this scope" inside the palette was rejected for duplicating scoping logic that already exists as one chokepoint shared with the visitor routes.',
        ],
      },
      {
        title: 'Extract one shared meta row',
        conclusion: 'up',
        description:
          'The thumbnail · eyebrow · name row was rendered three times — search results, Expectations cards, nav sub-items — two of them drifted inline copies. Three near-identical rows is three things to keep in sync.',
        points: [
          'The row was extracted to a single MetaCard primitive, hoisted to primitives/ so visitor, menu, and palette all import it without a sideways feature→feature dependency.',
          "It's polymorphic on thumbnail (URL string or Payload Media) and wrapper (a button for the palette's nav-plus-analytics, a Link otherwise), so one component covers every surface.",
          'The nav outlier resolved to one invariant: the name is always the foreground line and the descriptor the muted eyebrow — keeping it the other way would make the descriptor louder than the name.',
        ],
      },
    ],
    scope: ['frontend', 'product-engineering'],
    craft: ['search', 'react', 'performance', 'component-libraries', 'ui-engineering'],
    spotlight: ['search', 'react', 'ui-engineering', 'performance', 'component-libraries'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'keywords-ia',
    order: 3,
    eyebrow: 'Keywords & IA',
    title: 'A Sealed Keyword Taxonomy',
    summary:
      "A single Keywords collection with an immutable machine key and a three-value category drives the rendered descriptor pills, the search corpus, and the landing's information architecture — with a CSV that stays authoritative in both directions.",
    diagramKey: 'keyword-recall-lanes',
    overview: [
      'Every portfolio and experience item needs tags — for the visitor to read ("React, Design Systems") and for search to recall. The naïve version sprawls fast: tech tags vs. skill tags vs. hidden recruiter terms as separate fields or collections, a slug per keyword, synonyms sprayed everywhere until search returns a wall of half-matches that reads as self-promotion.',
      "The model here is sealed: one collection, one immutable key, one three-value category (scope / craft / searchOnly). The same keyword can be a rendered pill or a hidden recall term depending only on its category — there's no second mechanism. The hardest-won decision is a discipline, not a feature: hidden recall terms are kept deliberately disjoint from the visible content vocabulary, so a query lands one clean high-salience hit instead of a per-term explosion.",
      "The IA half is the landing page's section manifest living in the CMS, where each section's anchor, nav label, and searchability derive from one record — and a {years} token lets experience copy stay editorial while the code supplies only the figure.",
    ],
    keyDecisionsTitle: null,
    keyDecisions: [
      {
        title: 'One sealed keyword model',
        conclusion: 'up',
        description:
          'Every item needs tags — readable pills for visitors, recall terms for search. The naïve version sprawls into tech-tags vs. skill-tags vs. hidden recruiter terms as separate fields or collections, each with its own mechanism.',
        points: [
          'One collection, one immutable key, one three-value category (scope / craft / searchOnly). The same keyword renders as a pill or stays a hidden recall term based only on its category — there is no second mechanism.',
          'The old searchOnly boolean folded into the category enum, so "search-only" is just the third value rather than a parallel flag or a separate collection to keep in sync.',
          'key is the immutable machine identity; label is the freely editable display — so one term can serve multiple jobs without the field deciding whether it shows.',
        ],
      },
      {
        title: 'Keep recall terms disjoint',
        conclusion: 'up',
        description:
          'Hidden recall terms are meant to help search find a page. Spray synonyms across every item and search returns a wall of half-matches that reads as self-promotion. How do you stay findable without becoming noise?',
        points: [
          'searchOnly keywords surface a doc on curated recall terms kept deliberately disjoint from the visible scope/craft vocabulary — so a query lands one clean, high-salience hit instead of a per-term explosion.',
          "Disjointness is the actual feature, not a side effect: it's a discipline maintained by hand, not a mechanism the schema enforces.",
          'Two tempting extensions were rejected for reintroducing exactly that noise — crosslinking feature internals to content, and making individual graph nodes searchable — both trade one clean hit for many weak ones.',
        ],
      },
      {
        title: 'CSV stays authoritative both ways',
        conclusion: 'up',
        description:
          'Keywords entered only in a CMS live in a database — invisible to git, lost on a reseed, impossible to diff in a PR. But locking editing to the CSV throws away the nicer editor.',
        points: [
          'keywords.csv seeds the DB by upserting on key; the missing reverse — an export that rewrites the CSV from the DB, deterministically sorted for clean diffs — closes the drift a CMS edit would otherwise cause.',
          'Locking the CSV as the only entry point was rejected: the CMS is the better editor and the owner wants it, so a symmetric round-trip keeps both.',
          'Edit anywhere, export, commit: the CSV stays the committed record of record, so a wipe-and-reseed can never silently lose a keyword.',
        ],
      },
      {
        title: 'Section manifest lives in CMS',
        conclusion: 'up',
        description:
          "The landing's IA — what sections exist, their order, their nav labels, whether they're searchable — could be hardcoded. But then editing the IA means editing code.",
        points: [
          'Landing.sections[] is the IA backbone: each record drives its nav label, its anchor id (slugified from the label), and its own search section-doc, with validation rejecting duplicate slugs or keys.',
          'Render order stays fixed in a code switch while the manifest itself is editorial — so content can reshape the IA without a deploy, but the layout contract stays in code.',
          'Each section also carries its own searchKeywords and free-text aliases[], so searchability is owned per-record rather than wired globally.',
        ],
      },
      {
        title: 'Compute experience, keep copy editorial',
        conclusion: 'up',
        description:
          'Years-of-experience in prose goes stale the moment a date passes, but hardcoding the figure means a developer edits copy every year. Can the code supply only the number?',
        points: [
          'A {years} token resolves at render to a union-of-intervals calculation — overlapping roles count once rather than summing, open roles run to now, the result floored — and substitutes into the greeting and block prose.',
          'All surrounding copy stays in the CMS; code supplies only the figure, and the token is inert when absent, so an editor can move or remove it freely.',
          "This keeps the editorial voice in the editor's hands while the one fact that must stay accurate is computed, never typed.",
        ],
      },
    ],
    scope: ['platform', 'product-engineering', 'frontend'],
    craft: ['information-architecture', 'search', 'headless-cms', 'system-design', 'postgres'],
    spotlight: ['information-architecture', 'search', 'headless-cms', 'system-design', 'platform'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'seed-system',
    order: 4,
    eyebrow: 'Seed System',
    title: 'Idempotent, Round-Trippable Seeding',
    summary:
      'A shared tsx/CSV pipeline scaffold seeds content from version-controlled CSVs via the Payload Local API — idempotent, validated, and round-trippable — and the same scaffold bakes the 400-node graph offline without ever touching the database.',
    diagramKey: 'seed-pipeline',
    overview: [
      "A portfolio's data has to live somewhere reviewable. Hand-entering keywords in a CMS means they exist only in a database — invisible to git, lost on a reseed, impossible to diff in a PR. So the seed system makes CSVs the source of record: keywords.csv and the graph's nodes.csv / edges.csv are the SSOTs, and small tsx scripts parse, validate, and upsert them through Payload's Local API.",
      'The design problem underneath is idempotency and drift. A seed script you can only run once is a liability; this one upserts by an immutable key, so re-running is safe and never duplicates. And because the CMS is also a nice editor, a reverse export keeps the CSV authoritative — edit anywhere, commit the CSV, a wipe-and-reseed can’t lose anything.',
      'What ties it together is a single shared scaffold — one RFC-4180 parser, one tsx ESM bootstrap (forced by a Node 24 quirk), one validate-before-write discipline. The mental-graph builder reuses that scaffold functionally while deliberately not reusing the CMS — graph topology is miserable in a form UI, so it stays a committed static artifact.',
    ],
    keyDecisionsTitle: null,
    keyDecisions: [
      {
        title: 'CSVs as version-controlled source',
        conclusion: 'up',
        description:
          "A portfolio's data has to live somewhere reviewable. Hand-entering keywords in a CMS means they exist only in a database — invisible to git, undiffable in a PR, gone on a reseed.",
        points: [
          "keywords.csv and the graph's nodes.csv / edges.csv are the source of record: they live in git, diff cleanly in PRs, and are validated with line-numbered errors before anything is written.",
          'Missing key or label, a bad category enum, or a duplicate key all fail fast and loud — the seeder refuses to write garbage rather than half-applying it.',
          'CMS-only authoring (invisible to git) and committing only the derived JSON (no reviewable source) were both rejected for hiding the thing reviewers most need to see.',
        ],
      },
      {
        title: 'Idempotent upsert, never wipe',
        conclusion: 'up',
        description:
          'A seed script you can only run once is a liability. Re-running has to be safe, and identity has to be stable, or every run risks duplicating or mutating rows.',
        points: [
          'The seeder matches on an immutable key and updates label, category, and aliases, creating only genuinely new keys — so re-running is safe and never duplicates.',
          'Field-level update access on key is denied outright, so even a buggy run can’t mutate identity; this is also why later "renames" became new keys rather than edits.',
          'Wipe-and-reseed is explicitly flagged destructive because it would lose CMS-authored keywords — which is exactly the failure the reverse export exists to prevent.',
        ],
      },
      {
        title: 'Seed through the Local API',
        conclusion: 'up',
        description:
          'The seeder could write rows with raw SQL — fast, but it bypasses every validation and hook Payload would otherwise run, so seeded data can violate rules the app assumes.',
        points: [
          'The seeder runs getPayload() in-process and upserts via payload.find / create / update, so seeding passes through the same validation and hooks as a CMS edit.',
          'Going through the Local API also triggers a dev-push of any pending schema diff, keeping the database shape in step with the collections as data lands.',
          'Raw inserts were rejected for skipping all of that: seeded rows should be indistinguishable from hand-entered ones, not a privileged backdoor that quietly breaks invariants the rest of the app trusts.',
        ],
      },
      {
        title: 'One shared CSV parser',
        conclusion: 'up',
        description:
          'Every seed and build script needs to read CSVs. Re-inlining a parser per script means several slightly different parsers drifting apart — the classic copy-paste tax.',
        points: [
          'A single minimal RFC-4180-ish parser (double-quoted fields, "" escapes, CRLF/LF) lives in lib/csv.ts and is shared by every seed and build script.',
          "It's a rule-of-three extraction rather than copy-paste — consumed by both the keyword seeder and the mental-graph builder from one place.",
          "Every script also shares one node --import tsx/esm bootstrap, because Node 24 can't require() the lexical config — the stock Payload CLI breaks on that exact root cause, so one consistent workaround is reused everywhere.",
        ],
      },
      {
        title: 'Graph reuses scaffold, not CMS',
        conclusion: 'up',
        description:
          "The 400-node mental graph has the same data shape as the keyword data, so it's tempting to make it a Payload collection too. But graph topology is miserable to author in a form UI.",
        points: [
          'The graph pipeline borrows the tsx bootstrap, the shared parser, and the validate-before-write discipline — but the graph stays a committed static artifact, not a collection.',
          'Single author, topology that a form UI handles badly, and dodging the migration tax (it’s code, not content) all argue for a static file over a CMS table.',
          'd3-force lays out ~400 nodes at build time and bakes x/y into graph.json; it’s a build-only devDep, so the browser ships only xyflow and static JSON, with zero runtime layout cost.',
        ],
      },
    ],
    scope: ['platform', 'product-engineering'],
    craft: ['developer-tooling', 'headless-cms', 'postgres', 'typescript', 'system-design'],
    spotlight: ['developer-tooling', 'headless-cms', 'postgres', 'typescript', 'system-design'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'mental-map',
    order: 5,
    eyebrow: 'Mental Map',
    title: 'A Map of How I Think',
    summary:
      'An interactive ~400-node / ~660-edge graph of recurring concepts — laid out offline, painted by category, and kept jank-free with CSS-only interaction — that turns "more about me" into something you explore rather than read.',
    diagramKey: 'mental-graph-render',
    overview: [
      '"More about me" is usually a paragraph. I wanted it to be a map — the recurring ideas across my engineering, taste, and philosophy, and how they connect. The challenge is that an interesting map is a big one (~400 nodes), and big interactive graphs are where browsers fall over: layout cost, re-render storms on hover, scroll hijacking.',
      'Every decision here is about making scale feel effortless. The expensive force-directed layout runs offline at build time and ships as static JSON. Hover and focus are CSS-only where they can be, so panning 400 pills never triggers a React re-render. Categories carry their own 13-colour scale so the map reads at a glance, and the filter chips double as the legend.',
      'It deliberately uses a separate renderer from the per-feature system diagrams even though they share a data shape — the needs diverge enough (scale, theming, interaction) that forcing one component would be the wrong abstraction.',
    ],
    keyDecisionsTitle: null,
    keyDecisions: [
      {
        title: 'Lay out the graph offline',
        conclusion: 'up',
        description:
          '"More about me" should be a map, not a paragraph — but an interesting map is a big one (~400 nodes), and big interactive graphs are where browsers fall over on layout cost.',
        points: [
          'The expensive force-directed layout runs offline at build time; d3-force positions ~400 nodes / ~660 edges and the coordinates are baked into a committed graph.json.',
          'd3-force is a build-only devDep — the browser ships only xyflow and the static JSON, so there’s zero runtime layout cost no matter how large the map grows.',
          'The map ends up as something a visitor explores rather than reads, without paying the usual price of laying out a large graph in the client.',
        ],
      },
      {
        title: 'Per-category colour over brand hues',
        conclusion: 'up',
        description:
          'The brand only has three hues, but a map of recurring ideas reads at a glance only if each category is visually distinct. Three tiers can’t encode thirteen categories.',
        points: [
          'Thirteen categorical colours (Tailwind *-500, minus lime — reserved for --primary) each set a --node CSS var, so node fill, hover state, and the legend swatch all read one value.',
          'The three brand tiers are kept as grouping metadata, ordered work→culture→mind so the spectrum still loosely tracks them, but category becomes first-class.',
          'This is a deliberate, sanctioned exception to the design system’s "semantic utilities only" rule: a data-visualisation scale is something the three-tier brand can’t encode, so the map gets its own.',
        ],
      },
      {
        title: 'Hover and focus, no re-render',
        conclusion: 'up',
        description:
          'Panning and hovering across 400 pills can’t trigger React re-renders, or interaction janks. The challenge is making focus feel responsive while paying almost nothing per frame.',
        points: [
          'The hovered pill pops (solid fill, dark label, 1.2× scale, glow) and everything else dims, entirely via a :has() rule scoped to .mental-graph — so hovering 400 nodes costs no render.',
          'Press-to-focus isolates a node and its neighbours via prebuilt undirected adjacency; arrays stay referentially stable while nothing is focused, so only a discrete click pays a re-render.',
          'Focus composes with the category filter (visible = category ∩ focus), and both auto-fit the shown set — interaction stays smooth because the expensive paths are CSS, not state.',
        ],
      },
      {
        title: 'A separate renderer by design',
        conclusion: 'up',
        description:
          'The big map and the small per-feature system diagrams share a data shape, so forcing them through one component looks tidy. But their needs diverge — scale, theming, interaction.',
        points: [
          "MentalGraphClient is its own renderer, not the portfolio's GraphClient, because the 400-node map needs per-category theming and custom hover / press-to-focus the small diagrams don't.",
          'Sharing the GraphData contract is right; sharing the component would over-couple two different problems and violate the no-sideways-feature-import rule.',
          'The fullscreen view portals the single instance into an overlay rather than mounting a second graph, so filter, focus, and hover all survive expand and nothing renders twice.',
        ],
      },
    ],
    scope: ['frontend', 'conceptual-direction'],
    craft: ['data-visualization', 'react', 'performance', 'css', 'animation'],
    spotlight: ['data-visualization', 'react', 'performance', 'css', 'animation'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'system-diagrams',
    order: 6,
    eyebrow: 'System Design',
    title: 'Hand-Authored System Diagrams',
    summary:
      'Each portfolio piece renders a small, hand-laid {nodes, edges} diagram linked by a CMS key — node colour encodes role, the left-to-right layout tells the story, and the same data contract powers both these and the 400-node map.',
    diagramKey: 'diagram-registry',
    overview: [
      "Where the mental map is big and auto-laid-out, a system-design diagram is the opposite: small, deliberate, and explanatory. A good architecture sketch isn't force-directed noise — the position of each box and the colour of each node mean something. So these diagrams are hand-authored in the repo, with positions placed by hand to read left-to-right as a flow.",
      'The interesting tension is keeping a code-authored diagram editable-by-reference from the CMS without dragging the graph runtime into the admin bundle — solved with a string-only key contract and a registry that resolves it at render. The three brand hues are reused here as a semantic encoding (entry, processing, store), and the whole thing degrades gracefully if a key ever goes stale.',
    ],
    keyDecisionsTitle: null,
    keyDecisions: [
      {
        title: 'Hand-author diagrams, link by key',
        conclusion: 'up',
        description:
          'Each portfolio piece needs a small architecture diagram. Authoring graph topology in a CMS form is miserable, and storing the node data in the CMS would couple content to the render runtime.',
        points: [
          'A piece stores only a diagramKey string; the {nodes, edges} data lives in features/portfolio/graph/diagrams/<key>.ts, hand-authored in the repo where it can be reviewed like code.',
          'The keys module imports no @xyflow/react — it only feeds the Payload select, so it must never drag the graph runtime into the admin bundle; data modules import xyflow type-only.',
          'A registry resolves the key to data at render and returns null for an unknown or stale key, so a content typo degrades to "no diagram" rather than breaking the build.',
        ],
      },
      {
        title: 'Place positions by hand',
        conclusion: 'up',
        description:
          'The mental map is auto-laid-out because it’s huge. A small architecture diagram is the opposite: force-directed noise hides the meaning that node position and order are supposed to carry.',
        points: [
          'Nodes are positioned deliberately to read left-to-right as a flow, not auto-laid-out — for a small diagram the layout itself is the explanation.',
          'This is the exact inverse of the mental map’s offline force layout, and the contrast is intentional: scale decides the technique, not a blanket rule.',
          'Auto-layout was rejected here precisely because it would scramble the very thing the diagram exists to show — which box feeds which, in what order — turning an explanation back into noise.',
        ],
      },
      {
        title: 'Brand tiers as semantic encoding',
        conclusion: 'up',
        description:
          'A diagram’s colours can be decoration or they can carry meaning. Reusing the three brand hues as a fixed role encoding makes every diagram readable the same way without a legend.',
        points: [
          'Node tier means something: primary/lime marks entry and exit points, secondary/blue marks processing steps, tertiary/fuchsia marks data stores — authored per-node in the data.',
          'Edge labels carry the relationship verb ("requests", "looks up", "hydrates"), so the diagram reads as a sentence rather than a box-and-arrow sketch.',
          'A custom SystemNode pill, re-skinned controls and edges, and a hidden React Flow badge lift the diagram off stock chrome onto the brand.',
        ],
      },
      {
        title: 'One contract, two renderers',
        conclusion: 'up',
        description:
          'The hand-authored diagrams and the 400-node map produce the same {nodes, edges} shape. The question is how much to share — the data, the renderer, or both.',
        points: [
          'Both systems produce the same GraphData contract, so the data shape is shared while the source differs by scale: hand-authored TypeScript here, a CSV pipeline for the map.',
          'The renderer differs by need — these diagrams are small, deliberate, and explanatory; the map is large, themed, and interactive — so forcing one component would be the wrong abstraction.',
          'Sharing the contract but not the component keeps the two problems decoupled while still guaranteeing both speak the same data language.',
        ],
      },
    ],
    scope: ['frontend', 'product-engineering'],
    craft: ['data-visualization', 'system-design', 'react', 'component-libraries', 'typescript'],
    spotlight: ['data-visualization', 'system-design', 'react', 'component-libraries', 'frontend'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'agentic-workflow',
    order: 7,
    eyebrow: 'Agentic Workflow',
    title: 'Engineering the Guardrails',
    summary:
      'This site was built end-to-end with an AI coding agent — so the real engineering was the system that keeps an LLM from drifting the codebase: a thin resident contract, read-on-demand docs, codegen in lockstep with schema, and commit-time guards that make "I forgot to update the other copy" impossible to commit.',
    diagramKey: 'agent-guardrail-loop',
    overview: [
      'Every feature in this portfolio was built in collaboration with a coding agent (Claude Code). That changes what "good engineering" means. An agent has a finite attention budget and no memory between sessions, and it will confidently duplicate a fact, hand-edit a generated file, or drift a doc — unless the repository itself makes those mistakes impossible.',
      "So the architecture I'm most proud of isn't a feature, it's the operating contract: a tiny always-resident CLAUDE.md of guardrails plus pointers, the heavy detail pushed into docs the agent is instructed to read before risky work, and a layer of commit-time hooks that turn every fact-that-drifted into a fact-that-can't-be-committed. The proof is in the diffs — across a run of merges, the generated layers stayed perfect while the hand-maintained prose fell out of sync within days. The fix was to generate or guard everything that can drift.",
      'The other half is process discipline: branch-fresh gitflow, conventional commits, one PR per change, and every substantial PR carrying a "Decisions & alternatives considered" section — which is exactly why a content exercise like this one can reconstruct the why behind dozens of merges.',
    ],
    keyDecisionsTitle: null,
    keyDecisions: [
      {
        title: 'Thin resident contract, deep docs',
        conclusion: 'up',
        description:
          'An AI coding agent has a finite attention budget and no memory between sessions. A fat always-loaded rules file burns context every turn and invalidates cache; too little, and the agent drifts.',
        points: [
          'CLAUDE.md is trimmed to ~6 resident lines — stack, doc pointers, code-org, workflow norms, a DONOT list — because it auto-loads every turn and pointers cost nothing until needed.',
          'The heavy detail lives in ARCHITECTURE.md (the system map) and RUNBOOK.md (ops footguns), which the agent is told to read before architecture or database work.',
          'One big always-loaded doc was rejected: deliberate attention-budget management means resident rules stay tiny and descriptive detail is pulled in on demand.',
        ],
      },
      {
        title: 'Single-home every fact',
        conclusion: 'up',
        description:
          'The agent will confidently duplicate a fact, then update one copy and not the other. Observed directly: a doc listed --card as slate-800 after it moved to slate-700, while the generated layers never drifted.',
        points: [
          'The contract is that each fact has exactly one hand-written home; everything else points to it or is generated from it.',
          'Resident facts (stack, hosting, the DONOT list) live only in CLAUDE.md, and a pre-commit guard fails the commit if any of them reappears in another tracked doc, with pointer forms exempt.',
          'The principle is to generate or guard everything that can drift rather than trust an agent to remember to update the second copy — because it won’t.',
        ],
      },
      {
        title: 'Commit-time hooks enforce invariants',
        conclusion: 'up',
        description:
          "Some rules can't be expressed in CSS or a linter — a derived border width, a raw palette stop in the docs, a stale token catalog. Trusting the agent to honour them is exactly what fails.",
        points: [
          'Four invariants are commit blockers: no non-1px borders, no raw palette stops in the design-system doc, single-home resident facts, and a freshly regenerated token catalog.',
          'Each guard is "a fact we have actually watched drift" — a git-native rg check is the cheapest chokepoint for things CSS and lint can’t see.',
          'They’re wired via core.hooksPath from a dep-free prepare script — no Husky or lefthook introduced, and no CI invented where none existed yet.',
        ],
      },
      {
        title: 'Codegen in lockstep with schema',
        conclusion: 'up',
        description:
          'The token catalog, Payload types, and the admin import map all derive from source. If the agent forgets to regenerate after a schema or token edit, it commits a generated file that lies about the source.',
        points: [
          'All three regenerate automatically — predev on every dev run, a token watch, and a pre-commit hook that regenerates and stages a stale catalog before the commit lands.',
          'So the agent can’t commit an out-of-sync generated file even if it forgets to run codegen by hand; the generated files are build artifacts, never hand-edited.',
          'The stance is stack-wide: single source, generate the rest, and make the regeneration impossible to skip rather than something to remember.',
        ],
      },
      {
        title: 'PRs carry the why',
        conclusion: 'up',
        description:
          'A diff shows what changed, not why — and the next session, human or agent, has no memory of the trade-off. Across dozens of merges the reasoning would be unrecoverable if it weren’t written down.',
        points: [
          'Substantial PRs each include a "Decisions & alternatives considered" section that records the trade-offs and rejected paths at merge time, while the reasoning is still fresh rather than reconstructed months later.',
          'Paired with branch-fresh gitflow, conventional commits, and one PR per change, this keeps history legible across dozens of merges.',
          "It's durable reasoning the next session can rebuild from — and is exactly what makes a content exercise like reconstructing the why behind this build possible at all.",
        ],
      },
    ],
    scope: ['platform', 'product-engineering'],
    craft: [
      'ai-assisted-development',
      'developer-tooling',
      'system-design',
      'ci-cd',
      'technical-leadership',
    ],
    spotlight: [
      'ai-assisted-development',
      'developer-tooling',
      'system-design',
      'ci-cd',
      'technical-leadership',
    ],
    searchKeywords: ['e2e-ownership'],
  },

  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'design-system',
    order: 8,
    eyebrow: 'Design System',
    title: 'A Drift-Proof Design System',
    summary:
      'A three-tier token and type architecture authored once in globals.css — the class-merger, the docs, and the component layer all derive from that one file, so a value can never live in two places and silently drift.',
    diagramKey: 'design-system-ssot',
    overview: [
      'The brief was a set of brand boards designed in Figma — Colors, Fonts, Pressables. The risk in turning brand boards into a real system is drift: the moment a value lives in two places — the CSS and a docs table, the design and the code — they fall out of sync within days. This build proved it directly: the generated layers stayed perfect across a run of merges while every hand-maintained prose copy went stale.',
      'So the whole system is built around one contract: each fact has exactly one hand-written home, and everything else is generated from it or derives it. Colour and type values live in globals.css, named for the job they do rather than the hue they happen to be. The class-merger derives its role list from the same generated catalog. The docs name jobs, not values.',
      "On top of that foundation sits a small cva component layer where the colour token is global and the variant name is just the component's emphasis tier — and a mechanism/policy split that lets genuinely unique controls compose freely without polluting the system with one-member variants.",
    ],
    keyDecisionsTitle: null,
    keyDecisions: [
      {
        title: 'Design in Figma first',
        conclusion: 'up',
        description:
          'The brand began as Figma boards — Colors, Fonts, Pressables — not as code. The risk is treating those boards as throwaway reference and letting the implementation quietly diverge from the agreed visual language.',
        points: [
          'Visual decisions are made in Figma — palette, type ramp, the pill/pressable language — where they’re fast to iterate, then encoded once in globals.css rather than reinvented in code.',
          'Matching the boards is treated as a standing constraint, not a one-time port: the design refs stay the reference the tokens are checked against.',
          "Designing straight in code was rejected — exploration is faster and clearer in Figma, so code's job is faithful encoding, not ideation.",
        ],
      },
      {
        title: 'Stock palette as SSOT',
        conclusion: 'up',
        description:
          'Brand boards become a real system, and the first drift risk is redeclaring values Tailwind already ships. Where should the palette actually live?',
        points: [
          'The stock TW4 palette (slate / lime / fuchsia / blue) is the single source; @theme adds only what Tailwind lacks — the Roboto families, alpha tints via color-mix, a surface gradient, a 1px border default, a showcase animation.',
          "Semantic roles keep shadcn's variable names but point at the stock stops, so any net-new shadcn component drops in unchanged and the palette stays the one place a colour is defined.",
          'Redeclaring stops was rejected outright: duplicating values Tailwind already owns reintroduces the exact two-homes drift the system exists to prevent.',
        ],
      },
      {
        title: 'Tokens named by their job',
        conclusion: 'up',
        description:
          'A tier story (lime/blue/fuchsia = primary/secondary/tertiary) helps designers, but "is this lime or blue?" has no objective answer — so what name does a developer actually type?',
        points: [
          'Importance rank is subjective, and "secondary" already means a neutral grey surface in shadcn, so rank-naming was rejected as ambiguous and colliding.',
          'The tier stays the organising story, but tokens are named for what they do: lime is both --primary and --feedback; blue’s two jobs split into --selection (interaction) and --label (content hierarchy).',
          'Distinct names despite a shared blue-400 keep behaviour and hue independent, so a role can be re-pointed at a different stop later without renaming every call site.',
        ],
      },
      {
        title: 'Generate the catalog from CSS',
        conclusion: 'up',
        description:
          "A new token used to need registering in three places — the CSS, the catalog, and the class-merger's role list. Three hand-kept copies is three chances to drift.",
        points: [
          'Codegen scrapes @ds markers and @utility text-* names out of globals.css into a generated catalog — a build artifact like payload-types.ts — and the TypeScript side derives itself from it.',
          "A drift test was rejected for still typing the token twice; TS-first token tools (Style Dictionary, Panda, Vanilla Extract) were rejected for fighting Tailwind 4's CSS-first @theme model.",
          'The result: globals.css is the one hand-written home, and every downstream layer regenerates from it rather than restating it.',
        ],
      },
      {
        title: 'Split mechanism from brand policy',
        conclusion: 'up',
        description:
          'Button conflated the mechanism (icon/label layout, focus ring, asChild slot) with brand policy (emphasis tiers, pill skin, auto-chevron), so a genuine one-off couldn’t reuse the look without registering a variant it’d be the only member of.',
        points: [
          'Pressable is now the brand-free mechanism; Button is the design-system skin over it. The variant enum stays a closed set of emphasis tiers, and the escape hatch covers the open set of one-offs.',
          'The payoff: the search trigger composes a bespoke skin — tag border, recessed bg-sunken fill, lime glyph, no chevron — straight from Pressable, with no new variant added.',
          'Composing unique controls freely keeps one-member variants out of the system, so the tier enum stays meaningful instead of bloating into a catch-all.',
        ],
      },
    ],
    scope: ['design-systems', 'frontend', 'conceptual-direction'],
    craft: ['figma', 'visual-design', 'css', 'tailwind', 'component-libraries', 'developer-tooling'],
    spotlight: ['design-systems', 'tailwind', 'component-libraries', 'figma', 'visual-design'],
  },
]

# EKFM IA build — phase plan

> Roadmap + locked decisions for the EKFM portfolio build. **Not auto-loaded** into
> CC context (kept out of CLAUDE.md to stay token-lean) — read on request.
> Source of truth: the planning thread ("C") generates each phase's build prompt;
> CC builds + reviews. This file is the shared, version-controlled copy.

## Status / deltas (maintained by CC build threads)

_Last updated: 2026-06-17 (Phase 5 build session)._

**Working model change (2026-06-15):** the owner now drives planning directly; CC plans **and** builds each phase. C ("the planning thread") is consulted for discussion only, not for per-phase build prompts. The "Thread's role (C)" section below is retained for history.

**Phase 1/1b: MERGED into `development`** (commit `97f881a` on origin/development). The Phase 1/1b PR (`feature/information-architecture` → `development`) is landed. `phases.md` itself was missed in that merge and is being re-tracked on `feature/information-architecture-experience`.

Resolved since C's seed below:
- **Open #1 (Shape C): KEEP.** Built + **committed** (`156ef40`). UX verified informally; full test deferred (see #7).
- **Open #3 (Highlighting): CUT.** Owner decided not to build it; drop from Phase 6 scope.
- **Open #4 (Migration baseline): DECIDED — single baseline at go-live.** See Branch & deploy strategy.
- **Open #5 (Inline-create fix): DONE.** `allowCreate: false` + `admin.description` hints on `scope`/`craft`/`searchKeywords` (Experience + Portfolio).
- **Open #7 (Original keyword doubt): DEFERRED.** "UX feels better; real test is filling actual content," which happens after all phases. Final content-fill pass is the acceptance test for keyword authoring UX.

- **Open #2 (Nav re-architecture + 2a/2b): RESOLVED (Phase 5).** Ratified replacing searchOnly+target with sections-own-search. (2a) `Landing.sections[]` stays YAGNI — a flat CMS array `{ key, navLabel, aliases[] }`, **not** a block/page-builder. (2b) **Hybrid, not "absorbing into generic content":** per-band copy lives in structured groups on a single `Landing` global; the *navigable section list* is a CMS array (`sections[]`) that drives nav + anchor ids (`slugify(navLabel)`) + search `section` docs. Owner rejected a **code** manifest (same instinct as the subheaders→CMS refactor) — so the manifest is CMS data, the only code-bound piece being the `key` enum (a section type must bind to a renderer). See Phase 5 build log.

Resolved in Phase 6:
- **Open #4 (Migration baseline): CONFIRMED at-launch.** The `Keyword.slug` drop rode dev-push/raw-SQL on the empty shared DB (no prod served yet); no migration infra built this phase. Single baseline `0001` still authored once at launch against final schema (see Branch & deploy strategy).
- **Open #6 (Drop keyword from SearchDocument union): DONE.** `keyword` removed from the union + no longer emitted (had a dead `/portfolio?keyword=` href once the nav `target` mechanism was retired; recall already folds into the content docs the keyword tags). Union is now `portfolio | experience | section`.

### Branch & deploy strategy (LOCKED)
`main` is wired to **auto-deploy to prod** on Vercel → `main` is the *release* branch. `development` is the **staging trunk** (auth-locked on Vercel = password-protected deployed env). Therefore:
- **Branch flow:** `feature/<phase>` → PR into **`development`** (staging) → `/code-review` per phase. **Nothing merges to `main` until first go-live.** Prod stays empty until then.
- **Current action:** Phase 1/1b + Phase 2 (Experience) **merged** into `development`. Next feature branch = Phase 3 (Portfolio/Features). Nothing to `main` until launch.
- **Single DB across all envs (pre-launch).** One Railway Postgres backs local dev + Vercel Preview + `development` staging (all read/write the same `DATABASE_URL`, copied from `.env.local`). No env isolation yet — acceptable pre-launch (single author, no real users). Vercel Preview env vars set 2026-06-15 (`PAYLOAD_SECRET`, `DATABASE_URL` sensitive; `BLOB_READ_WRITE_TOKEN` All-Envs; `NEXT_PUBLIC_*`); needed because `/experience` + `/` prerender at build → Payload `init()` requires the secret + DB at build time.
- **Launch DB strategy (DECIDED 2026-06-15 — supersedes "empty prod" framing).** Two separate problems, two mechanisms:
  1. **Initial state (schema + content):** a freshly-created prod DB is empty and does NOT inherit the content authored during content-fill. So at launch **clone the staging DB → prod** (Railway fork / `pg_dump`+restore) — schema *and* data carry over exactly, no re-entry, no sync drift.
  2. **Forward changes (post-launch):** prod runs `NODE_ENV=production` → dev-push OFF → every schema change after launch needs a migration. **Snapshot the cloned schema as migration `0001`** to give future migrations a baseline — not to build schema (the clone already did), just to set the starting point. The `0001` snapshot MUST be generated from the exact cloned (dev-push-built) state so migrations don't diff against a phantom.
- **Why not incremental migrations now:** prod is unserved until launch, so the stacked destructive dev-push diffs (flat-keywords removed, `slug` drop, etc.) never need intermediate migrations for states nobody serves. The clone collapses initial schema+data into one copy; `0001` is authored once against the final pre-launch schema.
- **Staging preview** (`development`, auth-locked) gives deployed testing throughout without touching prod.
- At launch: finalize pre-launch schema on `development` → clone staging DB → prod → snapshot schema as `0001` (matching the clone) → `development` → `main` → first deploy.

---

## Thread's role (planning thread / C)
Generate each phase's build prompt for Claude Code (CC), and review CC's output. Builds happen in CC terminals. Stack constraints in CLAUDE.md.

## Goal
EKFM: Next 15 / Payload 3 / Postgres portfolio. The **search palette is the centerpiece** — every navigable piece of content (not descriptive copy) is indexed into it. Content is code-first Payload (SSOT); render/data via the Local API (never GraphQL on the hot path); Fuse client-side search; @xyflow/react for graphs; ISR.

## Phases (dependency-ordered)
1. **Foundations** — keyword taxonomy + Search contract. ✅ Sealed. aliases verified to flow (depth:1, no field-narrowing); scope/craft confirmed hasMany; schema-safe (no rows tagged).
   - **1b. Keyword Shape C** (searchOnly boolean → searchKeywords) — pulled forward from Phase 6. Built + committed; adoption test pending (Open #1).
2. **Experience** — detail page + landing projection. Structure locked (see decisions); build prompt not yet produced.
3. **Portfolio/Features** — detail (overview, Key Decisions slider, related content) + per-feature reactflow diagrams (direct JSON, diagramKey). ✅ Built + merged (PR #4).
4. **Visitors** — personalization data (expectations[], per-expectation relevantContent) + `/dear/[company]` cover letter + welcome banner + first Payload global. ✅ Built (PR pending).
5. **Composition** — landing aggregation (globals + projections + conditional Dear Company), /dear/[company], relational map (CSV→JSON→GraphClient). Also: the **Landing global + sections[]**, shared slugify helper, render-stamped anchor ids, afterChange revalidation. [CC grouped the Landing global into Phase 6; C placed the global + render here with Composition and left section *indexing* in Phase 6, per "compose then index". Flag if you prefer it whole in 6.]
6. **Search palette** — Fuse index over corpus + UI + visitor personalization. Re-scoped: alias weighting; Keyword.slug removal (destructive, gated on migration baseline); section search-docs (/#slug, emitted by dataset via shared slugify); SearchDocument contract pass; ~~term-highlighting~~ (CUT, Open #3). Keyword target mechanism dropped (superseded).

**Ordering rule:** build what everything references first → prove with one collection → replicate → compose → index.

## Locked decisions

### Keyword model — three shapes
- **A. Descriptor (scope/craft)** — attached + rendered. Two scoped hasMany relationship fields, filterOptions by category, hardened with `searchOnly: { not_equals: true }` so hidden tags can't leak into descriptor pickers. Display = attach order, drag-reorder, not sorted.
- **C. Hidden item-tag (searchKeywords)** — attached, not rendered. hasMany, `filterOptions: searchOnly === true`. Labels + aliases fold into the content doc's `aliases[]`, never `keywords[]`. (Built this session; adoption pending.)
- **B. Navigational** — superseded. Replaced by sections-own-their-search (see Landing).

**Keywords collection:** SSOT. `category` single-value (scope|craft), conditionally required — required for descriptors, hidden + optional when searchOnly. `aliases` text hasMany (recruiter synonyms; weighted Fuse key between title and keywords; inert until Phase 6 weighting). `slug` to be removed in Phase 6 (no URL identity needed; destructive diff, gated on migration baseline).

**searchOnly + target:** the searchOnly boolean is built (1b), powering Shape C only. The `target` half is **dropped** — navigation no longer rides on keywords.

### Landing / navigation (replaces target)
- New **Landing global**, `sections: [{ title, aliases[], content }]`, CMS-editable. [YAGNI-on-blocks boundary + relationship to existing Hero/TLDR/Contact globals = Open #2.]
- Anchor = `slugify(title)` at point-of-use; one shared slugify helper; landing render stamps the id, dataset emits a section doc with `href: /#${slug}`. No stored slug, registry, or codegen.
- ISR propagates renames (render id + search href) on revalidate. `afterChange` hook → `revalidatePath('/')` + palette dataset (same pattern as Visitors).
- Accepted tradeoff: a rename breaks external bookmarks to `/#old` (degrades to top-of-page); internal links self-heal at build. Escape hatch deferred: optional anchor-override field (empty → slugify, set → verbatim).
- Build-time `validate` flags duplicate slugified titles (collision → duplicate DOM ids).

**Highlighting (Phase 6): CUT** (Open #3 resolved). Was: scroll-to-text-fragment (#:~:text=) + ::target-text + JS fallback, keyed off the typed query. No-ops whenever the match came from an alias → garnish, not load-bearing. Owner dropped it.

### Experience (Phase 2)
Single inner `/experience` page renders all experiences, each in a `#slug` anchor target; landing experience section = quick-access links into those anchors; search href `/experience#${slug}` (retires the flat stub). Needs a `slug` field on Experience; `scroll-margin-top` on targets. **Structure is the owner's UX call — CC advises on tradeoffs/perf only, doesn't re-decide.** Plus companyLogo (image), showcase (single autoplay video), responsibilities[] ({text}), scope/craft. Section labels (Role Description/Scope/Craft) hardcoded. Sort by `-startDate`.

**Video:** clientUploads OFF (server uploads); reels lean by design; 4.5 MB cap. Bundle-shim neutralizes the client-upload handler leak, so flipping it later is a runtime-only flag-flip — documented in Media.ts (done Phase 1).

### Globals vs collections
Globals for narrative sections (Hero, TLDR, Contact {header, subheader, description, ctaLabel, ctaUrl}); collections for content. Aggregate landing = one RSC composing globals + collection projections + conditional Dear Company (Local API + Promise.all, tight depth/select), not a landing collection. YAGNI on blocks (re-check against the new Landing sections[] — Open #2).

### Portfolio
Per-feature diagrams = direct JSON → shared NoSSR GraphClient, linked by diagramKey, co-located in repo. Key Decisions = slider. Related content = relationship. Explicit `order` field (not date-driven).

### Visitors
`expectations[]` = {expectation, replyColumn1, replyColumn2} (char-capped, fixed two-column); `relevantContent` relationship. Feeds the Dear Company section + the visitor palette empty state.

**Route:** `/dear/[company]`, on-demand ISR — no generateStaticParams, dynamicParams default true, `notFound()` for unknowns, optional revalidatePath from a Visitors afterChange hook. `/visitor → /dear` rename done Phase 1 (collection name unchanged).

### Cross-cutting
- **Fuse corpus:** ship the whole thing (~400 B/doc; revisit near ~1k docs).
- **Primitives (frontend):** List (prose|word|tag), tag/pill, media renderers (image via next/image, video via `<video>`), slider, shared GraphClient. Built at first consumer, reused after.
- **Inline-create trap (scope/craft): DONE** (Open #5) — `allowCreate: false` + admin.description hints.
- **SearchDocument contract:** drifted this session (searchKeywords→aliases; searchOnly excluded from the standalone projection). Phase 6 adds a `section` variant and likely removes `keyword`. One deliberate pass in Phase 6 (Open #6).
- **Migration baseline:** dev push-mode fine now (no prod data), but destructive diffs are stacking (flat-keywords removed; slug to be dropped). Establish a prod-migration baseline + snapshot before Phase 6's slug drop. Owner + CC.
- **Codegen:** after any Payload field change run `pnpm generate:types && pnpm generate:importmap` (Node 24 / custom tsx scripts).

## Open / pending the owner's call
1. ~~Shape C — keep or back out.~~ **KEEP** (committed `156ef40`); test pending.
2. **Nav re-architecture** — ratify replacing the locked searchOnly+target; then (a) confirm Landing sections[] stays on the right side of YAGNI-on-blocks, (b) decide how Landing.sections relates to the Hero/TLDR/Contact globals (additional vs absorbing — pick one model).
3. ~~Highlighting — keep or cut.~~ **CUT.**
4. ~~Migration baseline — when to establish it.~~ **CONFIRMED at-launch** (Phase 6).
5. ~~Inline-create fix — confirm.~~ **DONE.**
6. ~~Standalone keyword search docs — drop from the corpus?~~ **DONE — dropped** (Phase 6).
7. **Original keyword-registration doubt** — still unstated; confirm whether the inline-create fix actually covers what testing surfaced.

## Current state
Phase 1/1b sealed + **merged into `development`** (`97f881a`). Phase 6 re-scoped around sections-own-search; keyword target dropped; highlighting cut.

**Phase 2 (Experience) MERGED into `development`** (Preview build green after Vercel Preview env vars were set; PR merged 2026-06-15). Field-shape question resolved by owner reference image: "Role Description" = `responsibilities[]` ({text}) rendered as a prose list (List `prose` variant w/ chevron marker); richText `description` **dropped**. Delivered:
- Schema: `slug` (unique, beforeValidate auto-from-role, editable, sidebar), `companyLogo` (optional Media), `showcase` (optional Media, video-filtered), `responsibilities[]` ({text} textarea); `description` removed. Schema pushed to staging DB (two-stage push to dodge the rename prompt — see below); existing test row's slug backfilled.
- `lib/slugify.ts` (shared helper, NFKD diacritic-fold → ASCII; reused by Landing in Phase 5).
- Primitives: `components/primitives/{Tag,List,MediaImage,MediaVideo}.tsx` (List has `prose`+`tag` variants).
- `/experience` page (RSC, Local API, sort `-startDate`, `<section id={slug}>` + `scroll-mt-24`, sections Role Description/Scope/Craft).
- `features/experience/{experience.ts,ExperienceSection.tsx,ExperienceLandingSection.tsx}`; landing projection wired into `/` stub (Phase 5 owns final composition).
- Search dataset href: `/experience` → `/experience#${slug}`.
- Verified: tsc clean, eslint clean, both pages render 200, anchor id + deep-link confirmed.

**Schema-push gotcha (recurs on every column drop):** dev push prompts interactively when a drop + add look like a rename, and again with a y/N data-loss confirm on any drop of a column that *exists* (fires even when null). Can't drive a raw-TTY prompt from a backgrounded process. Workaround used: split into two pushes — (1) add new fields with the old column still present (pure create, silent), (2) remove the old column alone (pure drop, only a y/N confirm, fed via FIFO). This previews the launch migration-baseline pain (Open #4).

CLAUDE.md cleaned up alongside Phase 2: keyword `target` mechanism marked DROPPED + Shape C (`searchKeywords`) documented (line was pre-Shape-C/pre-nav-rearchitecture); added experience route pattern, `components/primitives`, `lib/slugify`, and the col-drop schema-push gotcha.

**Phase 3 (Portfolio/Features) BUILT** on `feature/information-architecture-portfolio` (off freshly-pulled `development`; PR pending owner). The owner drove this via shared Figma-style mocks (portfolio detail + landing section + experience detail/landing) — that resolved the structure faster than Q&A; **integrate design-sharing into the workflow**. Net model: a portfolio piece is a "feature" with ONE persistent system-design diagram + persistent overview; the Key Decisions slider cycles N options/approaches.

Owner decisions:
- **Overview → prose array** (mirror Experience): dropped richText `content`; `summary` kept as lede + search description; `overview[]` ({text}) rendered via List `prose`.
- **Single diagram per piece** (not per-feature): `diagramKey` is a **top-level, required** Payload `select`. **Repo-authored, CMS links by key** — rejected reusing the Phase 5 CSV pipeline (that's for the ~300-node More-About-Me map): share the *render contract* (`GraphData {nodes, edges}`, edge `label` = relationship), not the *pipeline*; small layout-as-narrative diagrams want manual placement. Options come from a keys module importing no `@xyflow` (admin-bundle-safe). Unknown key → `getDiagram` returns null + dev warn, never throws.
- **Key Decisions** = top-level `keyDecisions[]` ({title, description, conclusion radio 👍/👎, points[] prose}), combined slider, `?decision=N` (1-based) URL-synced deep-link. Hardcoded "Key Decisions" heading + an editable persistent subtitle (`keyDecisionsTitle`, **falls back to `eyebrow`** when blank) that does NOT change as slides navigate.
- **Header**: `eyebrow` (green short feature name, required) + `title` (headline) + scope/craft tags as ONE combined row. **Tags stay homogeneous on scope/craft** — no bespoke "tech" category (owner: keep the taxonomy uniform site-wide; render varies per surface — portfolio = one pill row, experience = split Scope-list/Craft-pills per the mock).
- **`relatedContent`** = polymorphic `relationTo: ['portfolio','experience']`, hasMany ("Relevant content").
- **`/portfolio`** has no landing *page* (it's a landing *section*, Phase 5) → the route **redirects to the first piece** (lowest `order`).
- **Shared section subheaders** → `lib/labels.ts` `CONTENT_SUBHEADERS` (code consts, NOT a CMS global): UI chrome, zero schema surface, can't drift between items, nothing to migrate/drop. Refactored `ExperienceSection` onto it too.

Delivered:
- Schema (Portfolio): `title`, `eyebrow` (req), `slug` (auto-from-title, sidebar), `order` (sidebar), `thumbnail` (Media, sidebar — for the future nav/cards), `summary`, `overview[]`, `diagramKey` (top-level select, req), `keyDecisionsTitle`, `keyDecisions[]`, `relatedContent` (polymorphic), `scope`/`craft`/`searchKeywords`. Dropped `content` richText (Phase-3a) and the briefly-built `features[]` wrapper.
- **Schema-push lesson (NEW gotcha):** dropping a `select`/`radio` array field leaves **orphaned Postgres enums**; the next push then trips Drizzle's *rename-disambiguation TUI* ("is enum X created or renamed from Y?"). That prompt reads **`/dev/tty`, not stdin**, so `echo y |` / `</dev/null` / backgrounded pushes all **hang** (not just the y/N drop-confirm). Fix used: drop the dead tables AND their enums via raw SQL (`DROP TABLE/TYPE … CASCADE`; empty pre-launch DB = no data loss), then the config push is pure-additions and applies **silently** (verified via dev-server `/api/portfolio` 200, then `pg` introspection: correct cols/tables/enums, no `features` remnants). `scripts/push-schema.mts` only works for non-prompting (additive) pushes; destructive diffs need the SQL route or a real TTY.
- Graph: `features/portfolio/graph/{types.ts (GraphData), diagrams/{keys.ts,index.ts (getDiagram),context-aware-routes.ts}}`; NoSSR GraphClient reused (Graph.tsx now consumes GraphData).
- Primitive: `components/primitives/Slider.tsx` (controlled — consumer holds index; Prev/Next + dots). First consumer = Key Decisions.
- Feature: `features/portfolio/{portfolio.ts (decisionViews, keyDecisionsSubtitle, relatedItems),KeyDecisions.tsx (client, ?decision= URL-sync, subtitle prop),RelatedContent.tsx}`. Reused `keywordLabels` + List/Tag. (FeatureSection deleted with the features model.)
- Consts: `lib/labels.ts` (`CONTENT_SUBHEADERS`); `global.d.ts` (`declare module '*.css'` — clears the editor's `@xyflow` CSS side-effect-import TS2307; tsc/build were already clean).
- Routes: `/portfolio` → redirect to first item (○ Static, ISR 1h); `/portfolio/[slug]` detail rebuilt to the mock (header / Overview + System Design two-col / Key Decisions / Relevant content) — ƒ on-demand ISR, depth:1, notFound on miss. KeyDecisions in `<Suspense>` so `useSearchParams` keeps the route cacheable.
- Verified: `pnpm build` green (11/11, tsc + eslint clean); temp doc → redirect 307→first, detail 200 with all bands + graph skeleton, `?decision=2` resolved slide 2; temp doc + seed script removed (portfolio rows = 0).

**Deferred to their own future branches (NOT this IA branch):**
- **Shared aside/expanded-sub-item nav** (portfolio + experience, + mobile hamburger): the left nav listing items (thumbnail + eyebrow + title), per the mocks. Big, cross-collection — its own branch. Schema fields it needs are already in place (`thumbnail`, `eyebrow` on Portfolio; Experience uses `companyLogo` + `role`).
- **Landing-section globals** (Phase 5 / Composition): Portfolio landing ("…features, systems, and architectural decisions…" + Dive-into + cards) and Experience landing ("The story so far" + dive-into + Learn-more projection). Mocks captured; owner: "we'll declare this global."
- **Experience render refinement** (Phase 2 polish): mock shows Scope as a plain list (not pills). Small frontend tweak, logged.

Outstanding for owner: PR `feature/information-architecture-portfolio` → `development`; author real diagram files + portfolio content (eyebrow/thumbnail/overview/diagram/keyDecisions); decide whether `scripts/push-schema.mts` graduates to a package script. **This branch's purpose = lock the schemas + prove the UX so later churn ≈ 0; the search palette (Phase 6) is the real schema stress test.** Search dataset still emits portfolio docs (`/portfolio/${slug}`) — unchanged (could fold `eyebrow` in later; no schema change needed).

**Phase 4 (Visitors / Dear Company) BUILT** on `feature/information-architecture-visitors` (off freshly-pulled `development` after Phase 3 merged as PR #4 `3224929`; PR pending owner). Owner drove via three shared mocks (Visitor Welcome / Cover Letter / Custom Search) — design-sharing again resolved structure fast. Net model: a published Visitor = a per-company cover letter at `/dear/[company]`; the author picks N job-post expectations, writes one reply per expectation, and attaches supporting site content **per expectation**.

Owner decisions (this session):
- **Scope folded:** owner pulled the "Dear Company landing composition" into Phase 4 (welcome banner + Dear Company section built now as reusable RSCs; Phase 5 slots them into the assembled landing). Full landing chrome (Hero/TLDR/Craft/Experience/Portfolio) stays Phase 5; personalized search-palette empty state stays Phase 6 (this branch supplies the fields it reads).
- **relevantContent is per-expectation** for visitors (each `expectations[]` row owns its supporting items) — distinct from Portfolio's doc-level `relatedContent`. Polymorphic `relationTo:['portfolio','experience']`, hasMany.
- **Reply = single `textarea`** (not the roadmap's `replyColumn1/2`, not a prose array): owner wants any-length prose auto-balanced into two columns to cap card height (keeps slide + nav in one viewport). Rendered `sm:columns-2` **without** `break-inside-avoid` so a single body splits/balances. Plain prose only (no richText — confirmed cheap pre-launch refactor if ever needed; supporting content is the structured `relevantContent`, not inline links).
- **Fixed visitor copy → a Payload Global** (`VisitorContent`), the **first global in the project** (`globals: []` was empty). Single source of truth; the existing `CONTENT_SUBHEADERS` const→global refactor is **deferred to Phase 5** (global-doc work). Owner renamed the label group → `constants`.
- **Card contract = `title` + `metadata`** (for the future shared Card): in relevant-content cards `title` = content category ("Experience"/"Feature"), `metadata` = the surfaced item's name (portfolio eyebrow / experience company).
- **Slider atomized:** `Slider` → `SliderControls` (nav-only atom: Prev/dots/Next); consumers own their slide container. KeyDecisions recomposed (no visual change). First reuse = visitor Expectations.

Delivered:
- Schema (Visitors): dropped `headline` + `notes` (richText); added `role` (req), `jobPostUrl` (req), slug `beforeValidate` auto-from-`company` (mirrors Experience/Portfolio), `expectations[]` (req, minRows 1) → `{ expectation (textarea 280), reply (textarea 1500), relevantContent (polymorphic hasMany) }`. `afterChange` → `revalidatePath('/dear/{slug}')` (+ old slug on rename), wrapped in `try/catch` so programmatic writes (seed/migration) outside a Next request scope don't throw.
- Global `VisitorContent` (`payload/globals/VisitorContent.ts`, `slug: visitor-content`): `welcomeGreeting`, `intro[]` ({text}), `highlightPhrase`, `constants` group (`expectations`/`reply`/`relevantContent`/`jobPost`, defaulted). Wired `globals: [VisitorContent]`.
- Frontend (`features/visitor/`): `visitor.ts` (`resolveRelevantContent` → title/metadata/href/thumbnail; `expectationViews` splits the reply textarea on blank lines), `WelcomeBanner.tsx`, `DearCompanySection.tsx` (RSC: `Dear {company}`, intro via `List` with a highlighted `<span>`, Job Post link, `<Suspense>` slider), `Expectations.tsx` (client: `?expectation=N` URL-sync, reply `columns-2` balanced, title/metadata cards, `SliderControls`).
- Primitives: `Slider`→`SliderControls` atom; `List` prose widened to `React.ReactNode[]` (carries the highlight span, one chevron-marker source).
- Route: `/dear/[company]` rebuilt from stub — on-demand ISR (revalidate 3600, no generateStaticParams), Local API `find` depth:2 + `findGlobal`, `notFound()` on miss, own container (no portfolio sidebar layout).
- **Schema-push note (lingering-dev-server gotcha, NEW):** a backgrounded `next dev` that survives a `pkill` keeps **hot-pushing on every config save**. That silently applied the additive/empty-table diffs (reply array→textarea: empty `visitors_expectations_reply` dropped silently) but **stalled on the `labels→constants` rename TUI** (reads `/dev/tty`), leaving the DB half-migrated. Fix: `kill` the dev PIDs, raw-SQL the destructive parts (`DROP TABLE … CASCADE` + `ALTER TABLE … DROP COLUMN labels_*`), then a clean foreground `push-schema.mts` for the pure additions. Lesson: kill dev by PID (verify `ps`) before any destructive schema change; `pkill -f "next dev"` missed the pnpm-wrapped child. `pg` isn't hoisted under pnpm — introspect via the explicit `.pnpm/pg@8.20.0/...` path.
- Verified: `pnpm build` green (11/11, `/dear/[company]` is ƒ; tsc + eslint clean); seeded temp visitor → 200 with all bands, `?expectation=2` selects slide 2 server-side, per-expectation relevant content differs, single long reply balances across `columns-2`, constants resolve, unknown slug → 404; temp visitor removed + global reset (visitors rows = 0), temp scripts deleted. pg introspection confirmed final schema (`constants_*`, `reply` column, no `labels_*`/reply sub-table/`notes`/`headline`).

Outstanding for owner: PR `feature/information-architecture-visitors` → `development`; author real visitor content + the `VisitorContent` global copy (welcomeGreeting/intro/highlightPhrase/constants). Open question to confirm at review: the relevant-content card `title` is a literal collection category ("Feature"/"Experience") — if you want a content-driven category later it's a Portfolio schema field (flag before Phase 6).

**Phase 5 (Composition) BUILT** on `feature/information-architecture-composition` (off freshly-pulled `development` after Phase 4 merged as PR #5 `bf79c4e`; PR pending owner). Owner drove via the single `Landing.jpg` mock + a four-round design dialogue that resolved Open #2 and the visitor-composition model before any code.

Owner decisions (this session):
- **Visitor composition (Open #2a model):** one shared visitor-aware `Landing` RSC. `/` renders it plain; `/dear/[company]` passes a `visitor` (+ VisitorContent global) which mounts the `WelcomeBanner` and weaves the Dear Company band in after the hero. **No content duplication** — same SSOT/component; the per-company HTML is just ISR cache (PPR noted as a future escape hatch, YAGNI now). `/dear/[company]` graduated from the Phase-4 standalone page to the full assembled landing.
- **Section model (Open #2b):** rejected both a code manifest *and* a generic-content-blocks global. Landed on structured copy groups + a CMS `sections[]` array (the manifest, in CMS). Nav, band anchor ids, and search docs all derive from `sections[]` via shared `slugify(navLabel)` so they can't drift; build-/save-time `validate` rejects duplicate slugified navLabels + repeated keys. `afterChange → revalidatePath('/')`.
- **Hero vs TLDR are two entries:** `Hero` = top band ("PRODUCT ENGINEERING" + Drive prose + Craft ordered-keyword relationship), un-anchored (nav hidden over it, so NOT a `sections` entry). `TLDR` = the "Hi there I'm Edu" band (greeting + array of `{ title, body[] }` blocks; bio "Background" is the first block) — the nav's TLDR anchor.
- **Drive = prose; Craft = ordered craft-keyword relationship** (descriptor pattern: `category=craft` + `searchOnly != true`, attach-order, `allowCreate:false`).
- **Experience & Portfolio landing bands = identical card layout** (owner: the sidebar in the mock is the `/experience` *inner* page, not the landing). One shared `LandingCard` + `LandingSectionBand`; each band = `{ heading, subheader, diveInto: { subheader, items[] } }` (the "Dive into" label + list) with cards projected from the collection (portfolio by `order`, experience by `-startDate`). Old quick-links `ExperienceLandingSection` deleted.
- **More About Me:** the relational-map *feature* (CSV→JSON pipeline + GraphClient interactions) is its **own branch**, but its **global lands now** (`moreAboutMe` group: heading, subheader, `teaser{ eyebrow,title,description,items[],ctaLabel }`). Band renders the teaser card + a placeholder where the graph will mount. No map data/CSV in this branch.
- **`CONTENT_SUBHEADERS` → CMS (Open Q resolved):** the owner's "pull subheaders into CMS" instinct is the same one that killed the code manifest, so the refactor is ON. New `Labels` global with a `constants` group (admin section "Constants", matching `VisitorContent.constants`). `lib/labels.ts` now exposes `getSubheaders()` (findGlobal + merge over typed defaults as fallback) read once per detail-page RSC and threaded down as props (client `KeyDecisions` receives them as props).
- **All editorial copy is CMS** (owner principle, audited + fixed pre-handoff): card CTA labels are `experience.ctaLabel`/`portfolio.ctaLabel` on the Landing global ("View Role"/"Feature Details" defaults); hero column labels are `hero.driveLabel`/`craftLabel`; the visitor nav label is `VisitorContent.constants.dearCompanyNav`. Only the **EKFM wordmark** (brand) and the nav **Search** affordance (Phase-6 palette trigger placeholder) remain literals — not editorial copy.

Delivered:
- Globals: `payload/globals/Landing.ts` (slug `landing`; sections[] + hero/tldr/experience/portfolio/moreAboutMe/contact groups; defaults match the mock so a fresh global renders meaningfully — verified the 5 default sections + hero/portfolio/contact copy populate on an unsaved global). `payload/globals/Labels.ts` (slug `labels`; `constants` group). Both registered in `payload.config.ts` (`globals: [VisitorContent, Landing, Labels]`).
- Render: `features/landing/{Landing.tsx (orchestrator, visitor-aware), LandingNav.tsx (sticky; reads sections[]; Search placeholder + reveal-animation deferred), bands.tsx (Hero/Tldr/LandingSection/MoreAboutMe/Contact), LandingCard.tsx, projections.ts (portfolioCards/experienceCards/proseLines)}`. **Filename note:** helpers are `projections.ts`, NOT `landing.ts` — `Landing.tsx`/`landing.ts` collide on case-insensitive macOS (TS2305/TS1149).
- Routes: `/` → `<Landing />` (○ Static, ISR 1h); `/dear/[company]` → `<Landing visitor … />` (ƒ on-demand ISR, depth:2 visitor + findGlobal). 
- Refactor: `lib/labels.ts` (`getSubheaders()` + `SUBHEADER_DEFAULTS`, now `server-only`); consumers updated (`experience/page.tsx`, `ExperienceSection`, `portfolio/[slug]/page.tsx`, `KeyDecisions`, `RelatedContent`) to receive subheaders as props.
- Search: `SearchDocument` union gains `'section'`; `buildSearchDataset` emits one section doc per `Landing.sections[]` entry (`title=navLabel`, `aliases`, `href:/#${slugify(navLabel)}`). Emission only — palette UI stays Phase 6.
- Schema push: globals are additive (new tables `landing*`, `labels`) → applied **silently** via `scripts/push-schema.mts` (no dev server running; `--env-file=.env.local` needed since the script doesn't load dotenv). `pg` introspection confirmed all tables (`landing_rels` for craft, `landing_texts` for aliases hasMany, the array tables). No destructive DDL this phase.
- Verified: `pnpm build` green (11/11; `/` ○ Static, `/dear/[company]` ƒ; tsc + eslint clean). Ran prod server: `/` 200 with nav anchors == band ids (`#tldr/#experience/#portfolio/#more-about-me/#contact`, hero correctly un-anchored); seeded a temp visitor → `/dear/acme-test-co` 200 with WelcomeBanner ("Welcome Acme Test Co"), `#dear-company` band + nav item, reply paragraphs split on blank lines; `/` has zero `dear-company`; unknown slug → 404. Temp visitor deleted (visitors=0), temp scripts removed.

**Deferred / flagged for owner (NOT this branch):**
- **Relational map feature** — CSV→JSON pipeline + GraphClient wiring + interactions on its own branch (owner has the CSVs). Shares only the `GraphData` render contract. The `moreAboutMe` global + teaser placeholder are already in place.
- **Vestigial `/tldr` + `/contact` routes** render blank `<main />` (first-commit scaffolding) and `features/menu/PortfolioNav.tsx` (live in the portfolio layout sidebar) still links to them. The landing now owns TLDR/Contact as anchors (`/#tldr`, `/#contact`). Left intact this phase (the portfolio sidebar is the **deferred shared-aside-nav branch's** territory); that branch should retire the blank routes + repoint PortfolioNav to the landing anchors.

Outstanding for owner: PR `feature/information-architecture-composition` → `development`; author real `Landing` + `Labels` global copy (hero Drive/Craft, TLDR blocks, dive-into lists, contact CTA url, section aliases for search recall). Confirm the WelcomeBanner placement (slim ribbon above the nav) matches the "Visitor: Welcome" mock — adjust in review if not.

Next (after merge): **Phase 6 (Search palette)** — Fuse index over the corpus (now incl. `section` docs) + palette UI + visitor personalization empty state; `Keyword.slug` removal (destructive, gated on migration baseline — Open #4); `SearchDocument` contract pass + drop `keyword` (Open #6).

**Phase 6 (Search palette) BUILT** on `feature/information-architecture-search` (off freshly-pulled `development` after Phase 5 merged as PR #6 `8966524`; PR pending owner). Owner drove via two shared mocks (Search Palette + Visitor: Custom Search), each at mobile/tablet/desktop folds plus a 6-frame invoke animation. **This is the last IA branch — the search palette is the schema stress test, so the SearchDocument contract was locked here.**

Owner decisions (this session):
- **Open #6 — drop `keyword` docs (DONE).** The union is now `portfolio | experience | section`; keyword docs no longer emit. Their href (`/portfolio?keyword=…`) had no route once the nav `target` mechanism was retired, and keyword recall already folds into the content docs they tag (descriptor labels → `keywords[]`; descriptor + `searchKeywords` synonyms → `aliases[]`). Searching "React" still surfaces the tagged Feature/Experience.
- **Open #4 — migration baseline stays at-launch.** The `Keyword.slug` drop rode the empty shared DB (raw SQL); no migration infra built. Baseline `0001` authored once at launch.
- **Filter chips = dynamic by doc type.** `All` + one chip per type present in the corpus (`Experience` / `Features` / `Sections`). The mock's "TLDR/Content/Portfolio Details Page" chip names were illustrative. Visitors get a leading `Company: {role}` facet that scopes results to the union of the visitor's relevant-content hrefs.
- **Mobile hamburger menu = NOT this branch.** Frame-1's section-list-with-portfolio-sub-items + SEARCH button is the deferred shared-aside-nav branch's territory. This branch ships the palette + a Search trigger in the existing `LandingNav` (mobile included); the mobile overlay's back-arrow just closes (no menu to return to yet).
- **Recent Searches = localStorage, per-device.** Last 5, de-duped case-insensitively, tap re-runs, Clear wipes. Client-only.
- **Highlighting stays CUT** (Open #3) — no scroll-to-text-fragment built.

Delivered:
- **SearchDocument contract (LOCKED):** union `portfolio | experience | section`. Enriched with display fields so result rows render the mock's card contract without re-deriving on the client: `label` (category eyebrow — "Feature"/"Experience"/"Section"), `name` (bold line — portfolio eyebrow / experience company / section navLabel), `thumbnail` (resolved Blob URL). `title` stays the Fuse-searchable primary (experience = "role · company", so "IC5" matches a row that displays only "Meta"). Fuse keys reweighted: title .5 / name .4 / keywords .3 / aliases .25 / description .1, `minMatchCharLength: 2`. `aliases` weighting is no longer inert.
- **`lib/search/dataset.ts`:** dropped the keywords query + keyword docs; added `mediaUrl()` resolver; emits `label`/`name`/`thumbnail`. Section docs now ship a **bare `#slug` fragment** (not `/#slug`) so the palette resolves them against the current route — selecting a section on `/dear/[company]` scrolls within the visitor page instead of bouncing to `/` (owner call; `SearchPalette` prefixes `usePathname()`).
- **`features/search-palette/`:** `SearchPalette.tsx` (client: trigger + portaled overlay — portaled to body because the nav's `backdrop-blur` would otherwise contain a fixed overlay; Cmd/Ctrl+K toggle, Esc close, ↑/↓/Enter over results, body-scroll lock; desktop = anchored top-right panel, mobile = top sheet with back/X; debounced `SearchPerformed` + `SearchResultSelected` analytics), `SearchResultRow.tsx` (thumbnail/placeholder + eyebrow + name, reused by results AND the visitor empty state), `facets.ts` (`buildFacets` dynamic-by-type + `applyFacet`), `useRecentSearches.ts` (localStorage), `visitorContext.ts` (server: builds the per-expectation empty state + `Company: {role}` chip from a depth≥2 Visitor), `types.ts`. Reused the existing `useSearchIndex.ts` + `lib/fuse`.
- **Wiring:** `Landing.tsx` adds `buildSearchDataset()` to its `Promise.all` and builds `visitorSearch` when a visitor is present; `LandingNav.tsx` now takes `documents` + `visitorSearch` and mounts `<SearchPalette>` in place of the old static "Search" pill. Corpus ships as a prop (built at ISR), Fuse index built client-side.
- **Schema:** `Keyword.slug` removed (no URL identity needed). Codegen ran (`payload-types.ts` regenerated); column dropped via raw SQL on the empty DB (`ALTER TABLE keywords DROP COLUMN slug CASCADE` — table was 0 rows; `keywords_slug_idx` dropped by CASCADE) after confirming no background `next dev` (the lingering-server trap). Config ↔ DB back in sync (verified: a later Local-API init pulled schema with no destructive prompt).
- Verified: `pnpm build` green (11/11; `/` ○ Static, `/dear/[company]` ƒ; tsc + eslint clean). Seeded a temp portfolio + experience + visitor → ran prod server → fetched `/dear/{slug}` (dynamic, so it reflects fresh content unlike the prerendered `/`): serialized corpus showed **0** `keyword` docs, **0** `/portfolio?keyword=` hrefs, 5 `section` docs, correct `label`/`name`/`thumbnail` shape, and the visitor personalization (`Company: Senior Product Engineer` chip + `Expectation 1/1` group). Palette trigger (`aria-label="Open search"`) present in nav. Temp docs deleted (portfolio/visitors/keywords = 0); temp scripts removed.

**Deferred / flagged for owner (NOT this branch):**
- **Mobile hamburger menu + reveal-on-scroll nav animation** — still the deferred shared-aside-nav branch's territory (frame-1 menu, the invoke animation polish).
- **Empty-content corpus:** with real content unauthored, the live corpus is just the 5 section docs + whatever's seeded. Recall/weighting tuning (aliases) is best re-checked during the content-fill pass (also the keyword-authoring UX acceptance test, Open #7).

Outstanding for owner: PR `feature/information-architecture-search` → `development`; author section `aliases` (recruiter synonyms) on the Landing global for search recall; confirm the palette visuals against the mocks (desktop anchored panel vs. mobile sheet, chip styling) and adjust in review. With Phase 6 merged, all IA phases are complete — next is launch prep (clone staging→prod, snapshot `0001`) + the deferred feature branches (relational map, shared-aside nav).

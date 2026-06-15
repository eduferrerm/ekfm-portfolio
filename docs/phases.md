# EKFM IA build — phase plan

> Roadmap + locked decisions for the EKFM portfolio build. **Not auto-loaded** into
> CC context (kept out of CLAUDE.md to stay token-lean) — read on request.
> Source of truth: the planning thread ("C") generates each phase's build prompt;
> CC builds + reviews. This file is the shared, version-controlled copy.

## Status / deltas (maintained by CC build threads)

_Last updated: 2026-06-15 (Phase 2 kickoff session)._

**Working model change (2026-06-15):** the owner now drives planning directly; CC plans **and** builds each phase. C ("the planning thread") is consulted for discussion only, not for per-phase build prompts. The "Thread's role (C)" section below is retained for history.

**Phase 1/1b: MERGED into `development`** (commit `97f881a` on origin/development). The Phase 1/1b PR (`feature/information-architecture` → `development`) is landed. `phases.md` itself was missed in that merge and is being re-tracked on `feature/information-architecture-experience`.

Resolved since C's seed below:
- **Open #1 (Shape C): KEEP.** Built + **committed** (`156ef40`). UX verified informally; full test deferred (see #7).
- **Open #3 (Highlighting): CUT.** Owner decided not to build it; drop from Phase 6 scope.
- **Open #4 (Migration baseline): DECIDED — single baseline at go-live.** See Branch & deploy strategy.
- **Open #5 (Inline-create fix): DONE.** `allowCreate: false` + `admin.description` hints on `scope`/`craft`/`searchKeywords` (Experience + Portfolio).
- **Open #7 (Original keyword doubt): DEFERRED.** "UX feels better; real test is filling actual content," which happens after all phases. Final content-fill pass is the acceptance test for keyword authoring UX.

Still open: **#2** (nav re-architecture ratify + 2a/2b — Phase 5/6), **#6** (drop `keyword` from SearchDocument union — Phase 6).

### Branch & deploy strategy (LOCKED)
`main` is wired to **auto-deploy to prod** on Vercel → `main` is the *release* branch. `development` is the **staging trunk** (auth-locked on Vercel = password-protected deployed env). Therefore:
- **Branch flow:** `feature/<phase>` → PR into **`development`** (staging) → `/code-review` per phase. **Nothing merges to `main` until first go-live.** Prod stays empty until then.
- **Current action:** Phase 1/1b **merged** into `development` (`97f881a`). Active branch: `feature/information-architecture-experience` (Phase 2 = Experience) → will PR into `development`. *Not* main.
- **Migrations: one baseline event at launch.** Because prod is empty until the first deploy, no intermediate schema state is ever served, so the stacked destructive dev-push diffs (flat-keywords removed, `slug` drop, etc.) collapse into a **single** baseline migration authored against the *final* schema and applied to an empty prod DB. Merging incrementally would instead force a migration per destructive change for states nobody serves — pure waste. Deferring largely *eliminates* the work, not just postpones it.
- **Staging preview** (`development`, auth-locked) gives deployed testing throughout without touching prod.
- At launch: build migration baseline → snapshot final schema as `0001` → apply to empty prod → `development` → `main` → first deploy.

---

## Thread's role (planning thread / C)
Generate each phase's build prompt for Claude Code (CC), and review CC's output. Builds happen in CC terminals. Stack constraints in CLAUDE.md.

## Goal
EKFM: Next 15 / Payload 3 / Postgres portfolio. The **search palette is the centerpiece** — every navigable piece of content (not descriptive copy) is indexed into it. Content is code-first Payload (SSOT); render/data via the Local API (never GraphQL on the hot path); Fuse client-side search; @xyflow/react for graphs; ISR.

## Phases (dependency-ordered)
1. **Foundations** — keyword taxonomy + Search contract. ✅ Sealed. aliases verified to flow (depth:1, no field-narrowing); scope/craft confirmed hasMany; schema-safe (no rows tagged).
   - **1b. Keyword Shape C** (searchOnly boolean → searchKeywords) — pulled forward from Phase 6. Built + committed; adoption test pending (Open #1).
2. **Experience** — detail page + landing projection. Structure locked (see decisions); build prompt not yet produced.
3. **Portfolio/Features** — detail (overview, Key Decisions slider, related content) + per-feature reactflow diagrams (direct JSON, diagramKey).
4. **Visitors** — personalization data (expectations[], relevantContent).
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
4. **Migration baseline** — when to establish it.
5. ~~Inline-create fix — confirm.~~ **DONE.**
6. **Standalone keyword search docs** — once slug/keyword-nav is gone, do keyword-type docs drop from the corpus entirely (→ remove `keyword` from the SearchDocument union)?
7. **Original keyword-registration doubt** — still unstated; confirm whether the inline-create fix actually covers what testing surfaced.

## Current state
Phase 1/1b sealed + **merged into `development`** (`97f881a`). Phase 6 re-scoped around sections-own-search; keyword target dropped; highlighting cut.

**Phase 2 (Experience) COMMITTED** on `feature/information-architecture-experience` (owner committed; PR into `development` pending). Field-shape question resolved by owner reference image: "Role Description" = `responsibilities[]` ({text}) rendered as a prose list (List `prose` variant w/ chevron marker); richText `description` **dropped**. Delivered:
- Schema: `slug` (unique, beforeValidate auto-from-role, editable, sidebar), `companyLogo` (optional Media), `showcase` (optional Media, video-filtered), `responsibilities[]` ({text} textarea); `description` removed. Schema pushed to staging DB (two-stage push to dodge the rename prompt — see below); existing test row's slug backfilled.
- `lib/slugify.ts` (shared helper, NFKD diacritic-fold → ASCII; reused by Landing in Phase 5).
- Primitives: `components/primitives/{Tag,List,MediaImage,MediaVideo}.tsx` (List has `prose`+`tag` variants).
- `/experience` page (RSC, Local API, sort `-startDate`, `<section id={slug}>` + `scroll-mt-24`, sections Role Description/Scope/Craft).
- `features/experience/{experience.ts,ExperienceSection.tsx,ExperienceLandingSection.tsx}`; landing projection wired into `/` stub (Phase 5 owns final composition).
- Search dataset href: `/experience` → `/experience#${slug}`.
- Verified: tsc clean, eslint clean, both pages render 200, anchor id + deep-link confirmed.

**Schema-push gotcha (recurs on every column drop):** dev push prompts interactively when a drop + add look like a rename, and again with a y/N data-loss confirm on any drop of a column that *exists* (fires even when null). Can't drive a raw-TTY prompt from a backgrounded process. Workaround used: split into two pushes — (1) add new fields with the old column still present (pure create, silent), (2) remove the old column alone (pure drop, only a y/N confirm, fed via FIFO). This previews the launch migration-baseline pain (Open #4).

CLAUDE.md cleaned up alongside Phase 2: keyword `target` mechanism marked DROPPED + Shape C (`searchKeywords`) documented (line was pre-Shape-C/pre-nav-rearchitecture); added experience route pattern, `components/primitives`, `lib/slugify`, and the col-drop schema-push gotcha.

Next: owner PRs Phase 2 → `development`. Then **Phase 3 (Portfolio/Features)** — see §Portfolio: detail page (overview, Key Decisions slider, related-content relationship, explicit `order` field) + per-feature @xyflow diagrams (direct JSON, `diagramKey`, shared NoSSR GraphClient). Reuse Phase 2 primitives (List/Tag/MediaImage/MediaVideo); add a slider primitive at first consumer.

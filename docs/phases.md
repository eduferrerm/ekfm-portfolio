# EKFM IA build — phase plan

> Roadmap + locked decisions for the EKFM portfolio build. **Not auto-loaded** into
> CC context (kept out of CLAUDE.md to stay token-lean) — read on request before phase work.
> **Scope of this file:** only phases that still need live documentation. Completed phases are
> pruned (their build logs live in git history; architecture lives in CLAUDE.md). When all IA
> refinement lands, this file gets cleared.

## Status

_Last updated: 2026-06-18 (IA refinement kickoff)._

**Phases 1–6 (Foundations → Search palette): COMPLETE.** All merged to `development`
(latest: PR #7 search). Build logs pruned 2026-06-18 — see git history + CLAUDE.md for the
sealed architecture. The search palette was the schema stress test; the `SearchDocument`
contract is locked (`portfolio | experience | section`).

**Now: IA refinement** on `feature/information-architecture-refinement` (off `development`).
A grab-bag of post-phase polish + gap-closing surfaced during review. Phased to keep each
slice scoped + independently reviewable (one schema migration per slice, never tangled).

---

## Branch & deploy strategy (LOCKED — not yet executed)
`main` auto-deploys to prod on Vercel → `main` = *release* branch. `development` = staging
trunk (auth-locked / password-protected deployed env).
- **Branch flow:** `feature/<slice>` → PR into **`development`** → `/code-review`. **Nothing
  merges to `main` until first go-live.** Prod stays empty until then.
- **Single DB across all envs (pre-launch).** One Railway Postgres backs local + Preview +
  staging (same `DATABASE_URL`). No env isolation yet — acceptable pre-launch (single author,
  no real users).
- **Launch DB strategy:** two problems, two mechanisms —
  1. *Initial state:* clone the staging DB → prod (Railway fork / `pg_dump`+restore) so schema
     **and** content carry over exactly (a fresh prod DB inherits nothing from content-fill).
  2. *Forward changes:* prod runs `NODE_ENV=production` → dev-push OFF → every post-launch
     schema change needs a migration. **Snapshot the cloned schema as migration `0001`** from
     the exact cloned (dev-push-built) state to give future migrations a baseline.
- **Why no incremental migrations now:** prod is unserved until launch, so stacked destructive
  dev-push diffs never need intermediate migrations for states nobody serves. Migration infra
  is PARKED until launch prep.
- At launch: finalize schema on `development` → clone staging → prod → snapshot `0001` →
  `development` → `main` → first deploy.

---

## IA refinement — phases (independent unless noted)

Source list "Item N" = the owner's review-notes numbering. Each slice = its own feature branch
off `development` → PR → `/code-review`.

### Slice B — Experience detail rebuild (Items 1, 4) — IN PROGRESS
New full-detail design (mock: `Experience_ Desktop Full.jpg`). Closes the showcase-media gap.

**LOCKED — Experience mirrors Portfolio (owner, 2026-06-18):**
- **Landing section = cards.** Already shipped in Phase 5 (shared `LandingCard` + identical band
  layout to portfolio). No work here.
- **Details page = same UX as the Portfolio details page.** Adopt the portfolio pattern 1:1:
  - `app/(frontend)/experience/layout.tsx` — persistent `<aside>` sidebar + `<main>` slot, soft-
    nav (mirror `portfolio/layout.tsx`; sidebar survives soft-navs = SPA feel).
  - `app/(frontend)/experience/page.tsx` — index **redirects to the first role** (sort
    `-startDate`), mirroring `portfolio/page.tsx`'s redirect-to-lowest-`order`.
  - `app/(frontend)/experience/[slug]/page.tsx` — **per-role route**, Local API depth:1, ISR
    3600, `notFound()` on miss. Replaces the old single stacked `/experience#slug` page.
  - Sidebar = mirror `PortfolioNav` (section-level nav, active-by-pathname-prefix). The
    **role/item sub-nav** (thumbnail + eyebrow + title sub-items in the mock) stays on the
    deferred **shared-aside-nav** branch — same branch that owns portfolio's item sub-nav +
    mobile hamburger. Roles are reached via landing cards + search + redirect-to-first (exactly
    how portfolio items are reached today).

**Decided (content/schema):**
- `showcase`: single video → **array `{ image: Media, url?: text, label?: text }`** (gallery:
  main image + thumbnails; `url` = "Visit site"). Destructive schema change — confirm before
  data-loss push.
- "Role Description" label → **"Responsibilities"** (copy only; field stays `responsibilities[]`).
- Scope renders as a **plain list** (not pills); Craft stays pills.
- **Deep Dive** = experience's analogue of Portfolio's Key Decisions slider: `deepDive[]`
  ({ team: textarea, details: array {text} }), `SliderControls` atom + `?dive=N` URL-sync
  (mirror `KeyDecisions.tsx`). Heading "Deep Dive" + eyebrow "{role} at {company}".
  *(Schema shape provisional — refine if C's implementation notes land.)*
- **Item 4 (level/seniority): DROPPED.** No field exists, mock surfaces none, seniority already
  lives in the `role` string ("Senior …", "IC5 …").

**Knock-on (must update with the routing change):**
- Search href contract: `/experience#slug` → **`/experience/[slug]`** (`lib/search/dataset.ts`
  experience emission). Update CLAUDE.md ROUTING + SEARCH blocks accordingly.

### Slice A — Keyword model refactor + seeder — CODE-READY, seed gated on CSV
**Decided (do not re-litigate):**
- `category` → **required 3-value select** (`scope | craft | searchOnly`). **DROP the
  `searchOnly` boolean.** searchOnly = recall-only, never rendered, attaches via `searchKeywords`
  only (its `filterOptions` switches `searchOnly: { equals: true }` → `category: { equals:
  'searchOnly' }`; scope/craft pickers switch the `not_equals` guard likewise).
- Add **`key`** field = immutable machine identity / seeder upsert key (`Keyword.slug` already
  dropped). `label` = editable human display. Idempotency matches on `key`.
- **"SO:" prefix** for searchOnly rows = custom **list-view Cell** component, NOT a virtual
  `useAsTitle` (useAsTitle drives the relationship picker's server-side typeahead; a non-stored
  field would break it). Picker already segregates searchOnly via `filterOptions`.
- Palette groups by `SearchDocument.type`, NOT `keyword.category` — keywords emit no palette
  docs, so the 3rd enum value needs **zero palette work**.
- **Seeder** = tsx Local-API script `scripts/seed-keywords.mts`, upserts by `key` + validation.
  Single CSV `scripts/seed/keywords.csv` (cols `key,label,category,aliases`; aliases
  pipe-delimited). No item→keyword mapping file — keywords are hand-attached in admin.

**Build bundle (when CSV ready):** category 3-value select + `key` field + list Cell +
`seed-keywords.mts`. Destructive schema via `scripts/push-schema.mts` (or raw SQL for prompting
diffs) — **confirm before any data-loss push**.
**Gated on:** CSV authoring (owner + C, in progress).
**CLAUDE.md folds pending:** drop `keyword` from `SearchDocument.type` doc; rewrite KEYWORDS
block for 3-value `category` + `key` (no `searchOnly` boolean).

### Slice C — Landing YoE (Item 3) — no schema change
Years-of-experience computed in RSC as a **union of date intervals (NOT a sum)** — overlapping
roles count once. Uses existing `startDate` + nullable `endDate` + `current`.
**Open:** render placement (hero vs TLDR); display format ("8 years" vs "8+ years").

### Slice D — bands → section rename (Item 6) — DECISION OPEN
Pure rename of `features/landing/bands.tsx`. **Lean: don't.** "bands" (layout term) vs "section"
(load-bearing `Landing.sections[]` manifest) is a useful distinction; renaming risks semantic
collision for cosmetic gain. Do last + isolated if pursued at all.

---

## Schema-push gotchas (recurring — apply on every destructive diff)
- Dev push prompts on `/dev/tty` (not stdin) for: rename-disambiguation (drop+add looks like a
  rename), y/N data-loss confirm (any drop of an *existing* column, even if null), and orphaned-
  enum rename TUI (dropping a `select`/`radio` array leaves a dead Postgres enum). `echo y |` /
  `</dev/null` / backgrounded pushes all **hang**.
- **Workarounds:** split a drop+add into two pushes (add first = silent, drop second = lone y/N
  via FIFO); OR raw-SQL the destructive part (`DROP TABLE/TYPE … CASCADE`, `ALTER … DROP COLUMN`)
  on the empty pre-launch DB, then the config push is pure-additive + silent.
- **Kill `next dev` by PID first** (verify `ps`) — a lingering pnpm-wrapped child survives
  `pkill -f "next dev"` and hot-pushes on every save, half-migrating on rename TUIs.
- `pg` isn't hoisted under pnpm → introspect via the explicit `.pnpm/pg@<ver>/…` path.
- After any field change: `pnpm generate:types && pnpm generate:importmap` (Node 24 / tsx scripts).
- `scripts/push-schema.mts` only handles non-prompting (additive) pushes; needs `--env-file=.env.local`.

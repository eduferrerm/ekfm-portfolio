# EKFM IA build — phase plan

> Roadmap + locked decisions for the EKFM portfolio build. **Not auto-loaded** into
> CC context (kept out of CLAUDE.md to stay token-lean) — read on request before phase work.
> **Scope of this file:** only phases that still need live documentation. Completed phases are
> pruned (their build logs live in git history; architecture lives in CLAUDE.md). When all IA
> refinement lands, this file gets cleared.

## Status

_Last updated: 2026-06-18 (IA refinement complete — all four slices resolved)._

**Phases 1–6 (Foundations → Search palette): COMPLETE.** All merged to `development`
(latest: PR #7 search). Build logs pruned 2026-06-18 — see git history + CLAUDE.md for the
sealed architecture. The search palette was the schema stress test; the `SearchDocument`
contract is locked (`portfolio | experience | section`).

**IA refinement: COMPLETE.** A grab-bag of post-phase polish + gap-closing, phased to keep each
slice scoped + independently reviewable (one schema migration per slice, never tangled). Final
state of the four slices:
- **B (Experience detail rebuild) — MERGED** (PR #8).
- **C (Landing YoE) — MERGED** (PR #9).
- **A (Keyword model + seeder) — BUILT, schema pushed + seeded, PR open** (`feature/
  information-architecture-keywords`).
- **D (bands→section rename) — CLOSED, skip** (owner, 2026-06-18).

**Remaining to fully close:** merge the Slice A PR, then re-attach El País's keyword tags in
admin (the keyword reseed cleared its 2 links; its old scope tag "Conceptual Direction" is not
in the new taxonomy — pick a real scope keyword, re-pick React for craft). Once merged, this
file can be cleared.

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

### Slice B — Experience detail rebuild (Items 1, 4) — MERGED (PR #8)
Full-detail experience page mirroring the Portfolio details UX: per-role route
`/experience/[slug]` (ISR, `notFound` on miss) under a persistent-sidebar layout; index
redirects to the newest role. `showcase` → image-array gallery `{ image, url?, label? }`;
"Role Description" → "Responsibilities"; Scope = plain list, Craft = pills; **Deep Dive**
slider (`deepDive[]{team,details[]}`, `?dive=N`, mirrors Key Decisions). Search href contract
moved `/experience#slug` → `/experience/[slug]`. Item 4 (seniority) dropped — lives in the
`role` string. Architecture sealed in CLAUDE.md (ROUTING/SEARCH); build logs in git history.

### Slice A — Keyword model refactor + seeder — BUILT + SEEDED, PR open
Branch `feature/information-architecture-keywords` (off `development`). Shipped exactly as
decided:
- `category` → **required 3-value select** (`scope | craft | searchOnly`); the `searchOnly`
  boolean is **gone** (folded into the 3rd category value). filterOptions are category-based:
  scope/craft pickers `category equals scope|craft`; `searchKeywords` picker `category equals
  searchOnly`.
- **`key`** = immutable (`access.update:()=>false`) unique machine id = the seeder's upsert
  identity; `label` stays the editable display.
- **"SO:" prefix** on search-only rows = list-view Cell `payload/components/KeywordLabelCell`
  (not `useAsTitle`, which drives the picker typeahead).
- **Seeder** `scripts/seed-keywords.mts` (`pnpm seed:keywords`, `--env-file`), upsert-by-`key`
  from `scripts/seed/keywords.csv` (`key,label,category,aliases` pipe-delim) = keyword SSOT.
- **Schema push (done):** wipe+reseed path (Option 2). DB had 2 rows (0 search-only). Hit the
  ambiguous-rename TUI (`key` add vs `search_only`→`key` rename) → raw-SQL dropped `search_only`
  first, leaving a silent additive push. Then `pnpm seed:keywords` → **31 keywords** (4 scope /
  16 craft / 11 searchOnly) + aliases. Verified: build 11/11, tsc + eslint clean.
- CLAUDE.md KEYWORDS block folded. **To close:** merge PR + re-attach El País's tags in admin.

### Slice C — Landing YoE (Item 3) — MERGED (PR #9)
Years-of-experience as a **union of date intervals (not a sum)** computed in the landing RSC
(`lib/yoe.ts`, pure + testable; `projections.experienceYearsLabel()`). Placement = **TL;DR**,
format = **"N+ years"** (owner-locked). Rendered via a **`{years}` token** the author drops into
the TL;DR copy — all words stay in the CMS, code injects only the figure (inert if the token is
absent). No schema change. Documented on the `tldr` group in CLAUDE.md.

### Slice D — bands → section rename (Item 6) — CLOSED (skip, owner 2026-06-18)
Decided **not** to rename `features/landing/bands.tsx`. "bands" (layout term) vs "section"
(load-bearing `Landing.sections[]` manifest) is a useful distinction; renaming was cosmetic and
risked semantic collision. No code change.

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

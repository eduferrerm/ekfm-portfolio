# EKFM IA build — phase plan

> Roadmap + locked decisions for the EKFM portfolio build. **Not auto-loaded** into
> CC context (kept out of CLAUDE.md to stay token-lean) — read on request before phase work.
> **Scope of this file:** only phases that still need live documentation. Completed phases are
> pruned (their build logs live in git history; architecture lives in CLAUDE.md). IA refinement
> has now landed (slice records kept as decision history); what stays live is the **launch
> branch/DB strategy + schema-push gotchas** below — both un-executed until go-live.

## Status

_Last updated: 2026-06-26 (IA refinement complete — all four slices landed)._

**Phases 1–6 (Foundations → Search palette): COMPLETE.** All merged to `development`
(latest: PR #7 search). Build logs pruned 2026-06-18 — see git history + CLAUDE.md for the
sealed architecture. The search palette was the schema stress test; the `SearchDocument`
contract is locked (`portfolio | experience | section`).

**IA refinement: COMPLETE.** A grab-bag of post-phase polish + gap-closing, phased to keep each
slice scoped + independently reviewable (one schema migration per slice, never tangled). Final
state of the four slices:

- **B (Experience detail rebuild) — MERGED** (PR #8).
- **C (Landing YoE) — MERGED** (PR #9).
- **A (Keyword model + seeder) — MERGED** (PR #10).
- **D (bands→section rename) — CLOSED, skip** (owner, 2026-06-18).

**Keyword follow-ups (post-Slice-A):** corpus expanded 31→60 (PR #25); seed round-trip closed
with a DB→CSV `export:keywords` + auto-`key`-from-label so CMS edits can't drift out of the CSV
SSOT (PR #27). Keyword model + round-trip sealed in ARCHITECTURE/RUNBOOK.

**Content note:** the original keyword reseed cleared El País's keyword links — confirm they're
re-attached in admin (its scope tag "Conceptual Direction" now exists in the taxonomy, PR #25).

---

## Branch & deploy strategy (LOCKED — not yet executed)

`main` auto-deploys to prod on Vercel → `main` = _release_ branch. `development` = staging
trunk (auth-locked / password-protected deployed env).

- **Branch flow:** `feature/<slice>` → PR into **`development`** → `/code-review`. **Nothing
  merges to `main` until first go-live.** Prod stays empty until then.
- **Single DB across all envs (pre-launch).** One Railway Postgres backs local + Preview +
  staging (same `DATABASE_URL`). No env isolation yet — acceptable pre-launch (single author,
  no real users).
- **Launch DB strategy:** two problems, two mechanisms —
  1. _Initial state:_ clone the staging DB → prod (Railway fork / `pg_dump`+restore) so schema
     **and** content carry over exactly (a fresh prod DB inherits nothing from content-fill).
  2. _Forward changes:_ prod runs `NODE_ENV=production` → dev-push OFF → every post-launch
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

### Slice A — Keyword model refactor + seeder — MERGED (PR #10)

Branch `feature/information-architecture-keywords` (off `development`). Shipped as decided:

- `category` → **required 3-value select** (`scope | craft | searchOnly`); the `searchOnly`
  boolean is **gone** (folded into the 3rd category value). filterOptions are category-based:
  scope/craft pickers `category equals scope|craft`; `searchKeywords` picker `category equals
searchOnly`.
- **`key`** = immutable (`access.update:()=>false`) unique machine id = the seed/export upsert
  identity (auto-fills from `label` when blank, PR #27); `label` stays the editable display.
- **"SO:" prefix** on search-only rows = list-view Cell `payload/components/KeywordLabelCell`
  (not `useAsTitle`, which drives the picker typeahead).
- **Seed/export round-trip** (`pnpm seed:keywords` CSV→DB / `pnpm export:keywords` DB→CSV,
  `--env-file`), upsert-by-`key` against `scripts/seed/keywords.csv` (`key,label,category,aliases`
  pipe-delim) = keyword SSOT. Model + procedure sealed in CLAUDE.md/ARCHITECTURE + RUNBOOK.

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
  rename), y/N data-loss confirm (any drop of an _existing_ column, even if null), and orphaned-
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

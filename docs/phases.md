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

## Launch checklist (live — execute top-to-bottom)

> Ordered so the one blocker and all prerequisites land before the irreversible steps.
> Dependency chain that matters: **migrate wrapper → test it → snapshot `0001`**. The wrapper
> and its test are now DONE; only the `0001` snapshot remains (authored at launch from the
> cloned prod schema). Everything in "Provision prod" except `0001` is independent of the wrapper.

### Pre-launch prep (safe while the single shared DB makes everything low-stakes)

- [x] **Build the migrate wrapper** — DONE. `scripts/migrate.mts` (tsx-ESM, same pattern as
      `scripts/generate-types.mts`) replicates Payload's `bin/migrate` dispatcher (not in package
      exports) over the public adapter API; runs under Node 24 (stock CLI dies on
      `ERR_REQUIRE_ASYNC_MODULE`). Wired: `pnpm migrate` / `migrate:create` / `migrate:status` /
      `migrate:down` / `migrate:refresh` / `migrate:reset` / `migrate:fresh`.
- [x] **Test the wrapper** — DONE. Verified under Node 24: `migrate:create` emits a migration +
      snapshot, `migrate:status` connects read-only and lists it pending. (Did **not** run
      `migrate` apply against the shared dev-push DB — would fight the pushed schema; throwaway
      test migration removed.)
- [ ] **Finish content fill** — all collections populated in admin.
- [ ] **Assign keywords** — incl. re-attaching El País links ("Conceptual Direction" scope tag exists).
- [ ] **Export keywords → CSV** — `pnpm export:keywords` + commit (keep CSV the SSOT).
- [ ] **Landing cards** — slider behaviour + active feedback state.
- [ ] **Dear/Ashby expectations reply** — complete the content.
- [ ] **PostHog ops** — verify the full usage event set fires in PostHog live events (PR #72):
      `$pageview`, `section_viewed`, `portfolio_item_opened`, `graph_node_clicked`,
      `visitor_page_viewed`, `search_performed`/`search_result_selected`. Posture is **cookieless**
      (no consent banner needed) — also confirm DevTools shows **no `ph_` cookie** + the anon id is
      in localStorage. Needs both `NEXT_PUBLIC_POSTHOG_*` vars (see prod env-vars below); missing
      either = **silent no-op** (RUNBOOK: ANALYTICS-ENV).
- [ ] **Finalize schema on `development`** — no more field/collection changes after this point.
- [ ] **Run codegen** — `pnpm generate:types && pnpm generate:importmap` after the last change.

### Launch decisions to settle

- [ ] **Clone mechanism** — Railway fork vs `pg_dump`+restore.
- [ ] **Blob store** — confirm prod _reuses_ staging's store (else baked-in
      `*.blob.vercel-storage.com` URLs in cloned DB rows 404).
- [ ] **`PAYLOAD_SECRET`** — keep-consistent vs. fresh (fresh just invalidates sessions, fine
      unless encrypted fields exist).

### Provision prod

- [ ] **Create prod Railway Postgres** + grab the **pooled/PgBouncer** `DATABASE_URL` (not the TCP proxy).
- [ ] **Co-locate regions** — Vercel function region ⟷ Railway region.
- [ ] **Clone staging DB → prod** (chosen mechanism) — carries schema + content.
- [ ] **Snapshot `0001` baseline** — `pnpm migrate:create` against the cloned (dev-push-built)
      prod schema, then `pnpm migrate:status` to confirm. Wrapper is ready (see Pre-launch prep);
      this is the only remaining migration step. Do **not** snapshot pre-clone.
- [ ] **Purchase domain in Vercel.**

### Wire prod env vars on `main` (currently empty by design)

- [ ] `PAYLOAD_SECRET`
- [ ] `DATABASE_URL` (pooled/PgBouncer)
- [ ] `BLOB_READ_WRITE_TOKEN` (shared store)
- [ ] `NEXT_PUBLIC_PAYLOAD_URL` (real domain)
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST`

### Dry run (before DNS flips)

- [ ] **Wake prod Railway DB** (avoid `57P03 database is starting up` build failure).
- [ ] **Prod-config build against cloned prod DB** — retry once if DB was cold.
- [ ] **Smoke test** — admin login, media loads, search works, `/dear/[company]` scoped routes +
      unknown-company redirect.

### Go live

- [ ] **Merge `development` → `main`** → first prod deploy.
- [ ] **Assign domain** to the prod deployment + confirm `NEXT_PUBLIC_PAYLOAD_URL` matches.
- [ ] **Post-deploy verification** — public site, a real `/dear/[company]` link, search, PostHog
      receiving prod events.
- [ ] **Update docs** — flip the migration-gap "PARKED" notes in RUNBOOK + this file once the
      wrapper + `0001` exist.

---

## Launch risk register

> Ranked by **blast radius × hard-to-undo × fails-silently**. The mental model: the **loud**
> failures (build errors, DNS) are the safe ones; the dangerous ones are **silent** (broken
> media, dead analytics) or **delayed** (a bad `0001` that detonates on the first real migration
> weeks later). The dry-run smoke test before the DNS flip is the one chance to catch the silent
> ones while you can still back out.

### Tier 1 — can lose data or poison the foundation

- **Destructive dev-push against the shared DB (during prep, not launch day).** One Railway DB
  backs local + preview + staging — including the content being filled. A destructive diff (col
  drop, or drop+add read as a rename TUI) hits **all envs at once**, and a lingering `next dev`
  can _half_-migrate on the rename prompt → the most likely way to actually lose content.
  _Mitigation (RUNBOOK DB-PUSH/DB-LINGERING-DEV):_ kill `next dev` by PID first, split drop+add
  into two pushes, feed the lone y/N via FIFO.
- **Clone → `0001` baseline snapshot.** Prod is `NODE_ENV=production` → **dev-push OFF → no
  safety net**. A wrong migrate wrapper or a `0001` that doesn't exactly match the cloned schema
  fails _delayed_: launch looks fine, then the **first post-launch schema change fails or applies
  a wrong diff to prod**; a bad baseline poisons every future migration.
  _Mitigation:_ build + **prove** the wrapper on the shared DB before touching prod.

### Tier 2 — silently wrong in prod (no crash, no error, just broken)

- **Blob store mismatch.** Media URLs are absolute and **baked into cloned DB rows** → pointing
  prod at a different store 404s every asset while the build stays green. _Prod must reuse
  staging's blob store._
- **Silent env-var no-ops.** PostHog needs **both** `NEXT_PUBLIC_POSTHOG_KEY` _and_ `_HOST`
  (miss either = collects nothing, no error); `NEXT_PUBLIC_PAYLOAD_URL` wrong → `warmVisitor`
  + absolute OG/favicon URLs point at the wrong host.
- **`PAYLOAD_SECRET` vs encrypted fields.** A different secret makes any encrypted cloned data
  unreadable. Likely none here — **verify, don't assume.**
- **Secret leakage.** Never put `DATABASE_URL` / `PAYLOAD_SECRET` / blob token behind a
  `NEXT_PUBLIC_` prefix (ships to the browser) or into git/logs. Low odds, Tier-1 severity.

### Tier 3 — looks alarming, actually fine

- **First prod build fails `57P03 database is starting up`** — expected; retry once Railway is awake.
- **DNS / domain flip** — reversible; only cost is propagation delay.

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

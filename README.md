# EKFM Portfolio

A Next + Payload portfolio: content in Payload (PostgreSQL on Railway), analytics
in PostHog, hosted on Vercel.

## Documentation

The `docs/` are the source of truth — read the relevant one before non-trivial work:

- **`docs/ARCHITECTURE.md`** — system map (stack + hosting topology, routing, search,
  keywords, visitors, data-fetch, components, env vars, code organization).
- **`docs/RUNBOOK.md`** — operational footguns (DB push/migrations, Node-24 codegen,
  the blob-leak shim, seeding, build coupling).
- **`docs/design-system.md`** — colour-token tiers + the semantic type scale.
- **`docs/phases.md`** — roadmap + locked decisions.

Exact dependency versions live in `package.json`; the full env-var list in `.env.example`.

## Local development

```bash
pnpm install
cp .env.example .env.local   # then fill in values
pnpm dev
```

Open http://localhost:3000 (frontend) and http://localhost:3000/admin (Payload). On
first load against an empty DB, Payload lets you create the first admin user; after
that, user creation is locked to authenticated admins.

After changing collections/fields, regenerate types + import map (the scripts are
Node-24 safe — see `docs/RUNBOOK.md` for the why):

```bash
pnpm generate:types
pnpm generate:importmap
```

## Manual infrastructure setup

Code and config are wired; provision these in the respective dashboards. DB
connection specifics (pooling, the Railway proxy, the `DATABASE_PUBLIC_URL` caveat)
are authoritative in `docs/RUNBOOK.md`.

- **Railway** — create a PostgreSQL instance; use a pooled connection string for the
  serverless runtime.
- **Vercel** — link the repo; create + link a Blob store (`BLOB_READ_WRITE_TOKEN` is
  auto-injected); add the env vars from `.env.example` (production + preview).
- **PostHog** — create the project; copy the key + host into env. The `/ingest`
  reverse proxy is already configured in `next.config.ts`.

# EKFM Portfolio

Next 15 + Payload 3.85 portfolio. Content lives in Payload (PostgreSQL on
Railway), behavioral/ops/search analytics in PostHog, and the app runs on
Vercel.

## Stack

- **App**: Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, ShadCN
- **CMS**: Payload 3.85 (code-first collections, built-in GraphQL at `/api/graphql`)
- **DB**: PostgreSQL on Railway (`@payloadcms/db-postgres`)
- **Storage**: Vercel Blob (`@payloadcms/storage-vercel-blob`, `Media` collection)
- **Analytics**: PostHog (`posthog-js` client + `posthog-node` server)
- **Search**: Fuse.js, client-side
- **Graph**: `@xyflow/react`, client-only (`ssr:false`)

## Local development

```bash
pnpm install
cp .env.example .env.local   # then fill in values
pnpm dev
```

Open http://localhost:3000 (frontend) and http://localhost:3000/admin (Payload).
The first time you load `/admin` against an empty DB, Payload lets you create the
first admin user; after that, user creation is locked to authenticated admins.

### Environment variables

| Var | Purpose |
| --- | --- |
| `PAYLOAD_SECRET` | Payload encryption secret (`openssl rand -hex 32`) |
| `DATABASE_URL` | Postgres connection — **pooled** in production (see below) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store token (auto-injected on Vercel) |
| `NEXT_PUBLIC_PAYLOAD_URL` | Public base URL (used for the GraphQL endpoint) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingestion host (e.g. `https://eu.i.posthog.com`) |

> Naming note: the codebase uses `DATABASE_URL` and `NEXT_PUBLIC_PAYLOAD_URL`
> consistently (config, lib, and env files). PostHog ingestion is reverse-proxied
> through `/ingest` (see `next.config.ts`) to reduce adblock loss.

## Codegen (Node 24 safe)

`payload generate:*` CLI commands fail on Node 24 (`ERR_REQUIRE_ASYNC_MODULE`
from `@payloadcms/richtext-lexical`'s top-level await under `require()`). The
project sidesteps this with tsx ESM-loader scripts:

```bash
pnpm generate:types       # → payload-types.ts  (scripts/generate-types.mts)
pnpm generate:importmap   # → app/(payload)/admin/importMap.js
```

Run these after changing collections/fields.

## Manual infrastructure setup

Code and config are wired; these provisioning steps must be done in the
respective dashboards.

### Railway (PostgreSQL)

1. Create a PostgreSQL instance.
2. Use a **pooled** connection string for the serverless runtime (PgBouncer-style).
   Set it as `DATABASE_URL` in Vercel.
3. Keep the **direct (unpooled)** URL available for migrations if needed.
4. Local dev uses the external `DATABASE_PUBLIC_URL` (TCP proxy).

### Vercel (App + Blob)

1. Create the project and link this repo.
2. Create a **Blob store** and link it — `BLOB_READ_WRITE_TOKEN` is auto-injected.
3. Add all env vars from the table above (production + preview).
4. Confirm the project's Node version is set (Node 20+; codegen scripts handle 24).
5. Verify the first build + deploy succeeds.
6. Visit `/admin` on the deployed URL and create the first admin user.

### PostHog

1. Create the project; copy the key + host into env.
2. Optional: the `/ingest` reverse proxy is already configured in `next.config.ts`.

## Project layout

- `app/(frontend)` — visitor/landing + portfolio routes (ISR; portfolio uses a
  shared sidebar layout with server-rendered detail routes)
- `app/(payload)` — Payload admin + REST/GraphQL handlers
- `payload/` — collections + access control
- `features/` — feature-based component folders (graph, search-palette, menu, …)
- `lib/` — cross-cutting utilities (posthog, fuse, search dataset, graphql)

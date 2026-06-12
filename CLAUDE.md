STACK:Next15.5.19,React19.1,TS5,Tailwind4,ShadCN(excl:menu,search-palette),Payload3.85.1(+db-postgres,next,richtext-lexical,storage-vercel-blob),PostgreSQL,@xyflow/react@12,PostHog(js+node),Fuse.js
HOSTING:Vercel(Next+Payload,serverless),Railway(PostgreSQL,stateful),VercelBlob(media)
DOMAINS:content=Payload(on-Vercel)+Postgres(on-Railway);analytics=PostHog;application=Vercel — logical-isolation,not-host-based
CONTENT:Payload-collections(code-first,SSOT);richtext=Lexical
GRAPHQL:Payload-built-in(/api/graphql),custom-resolvers-via-payload-config,no-yoga,endpoint-enabled-as-skill-signal-surface-ONLY
DATAFETCH:page-render(RSC/ISR/details)=Payload-Local-API(in-process,no-http-hop);GraphQL=external/demo-only,NEVER-render-hot-path
ANALYTICS:PostHog;client=posthog-js(lib/posthog/client.ts);server=posthog-node(lib/posthog/server.ts,flushAt:1-serverless);typed-events(lib/posthog/events.ts:behavioral|ops|search);ingestion-reverse-proxied(/ingest,next.config.ts)
ADMIN:Payload-UI(app/(payload),own-route-group+isolated-layout-imports-payload-scss);auth-locked(Users auth:true+authenticated-on-all-ops+first-user-bootstrap)
MEDIA:Media-collection→@payloadcms/storage-vercel-blob@3.85.1;disableLocalStorage=auto;clientUploads=off(server-uploads,assets<4.5MB);env=BLOB_READ_WRITE_TOKEN. client-bundle-shim(lib/stubs/resolveSignedURLKey)+webpack-redirect(next.config.ts) REQUIRED: storage-vercel-blob@3.85.1 registers VercelBlobClientUploadHandler in the admin import map unconditionally → leaks payload/internal→undici→node:* into the browser. Independent of clientUploads. Revisit on adapter upgrade / when withPayload allows Turbopack(Next>=16.1)
STYLE:app=tailwind-only,no-inline-styles,no-css-modules;payload-admin=own-scss(sass-dep-REQUIRED,do-not-remove)
COMPONENTS:feature-based-folders(features/),colocate-tests
FORMS:no-html-form-tags,controlled-inputs-only
ROUTING:visitor+landing=ISR(revalidate=3600);portfolio-details=app-router-per-route+shared-section-layout(persistent-sidebar,features/menu/PortfolioNav.tsx)+soft-nav(NOT-bespoke-SPA);detail-data=server-fetched-via-Local-API
STATE:url-first(?tab=&decision=),useState-default,zustand=last-resort
NOSSR:@xyflow/react→features/portfolio/graph/GraphClient.tsx('use client'+next/dynamic ssr:false)+GraphSkeleton.tsx-placeholder
SHADCN:install-dont-eject,extend-dont-override,use-shadcn-add;radix-primitives-appear-as-interactive-components-added
IMG:next/image-only(rendering);next.config-remotePatterns=_.public.blob.vercel-storage.com;bytes-live-in-VercelBlob
SEARCH:Fuse.js,client-side,no-algolia;corpus-built-at-build/ISR-via-Local-API(lib/search/dataset.ts);flat-SearchDocument+weighted-config(lib/search/types.ts);client-index(features/search-palette/useSearchIndex.ts)
PKGMGR:pnpm@11.5.2(exact-pin-in-packageJson)
ENV:all-from-process.env,never-hardcode,never-generate-secrets. Canonical:PAYLOAD_SECRET,DATABASE_URL(prod=pooled/PgBouncer),BLOB_READ_WRITE_TOKEN,NEXT_PUBLIC_PAYLOAD_URL,NEXT_PUBLIC_POSTHOG_KEY,NEXT_PUBLIC_POSTHOG_HOST;local-dev-DB=DATABASE_PUBLIC_URL(Railway-TCP-proxy)
COMMITS:conventional(feat/fix/chore)
NODE:runtime=node24-OK;codegen=node24-via-tsx-ESM-loader-scripts(scripts/generate-types.mts,scripts/generate-importmap.mts),NOT-stock-payload-CLI(stock-fails-node24:ERR_REQUIRE_ASYNC_MODULE from richtext-lexical-top-level-await-under-require);run-pnpm-generate:types|generate:importmap-after-collection/field-changes
LAYOUT:app/(frontend)=visitor+portfolio-routes;app/(payload)=admin+REST/GraphQL;payload/=collections+access-control;features/=feature-folders;lib/=cross-cutting(posthog,fuse,search-dataset,graphql,stubs)
DONOT:axios,moment,lodash,css-modules(app),page-router,prisma(Payload-uses-Drizzle-internally),strapi,graphql-yoga,reactflow(legacy),GraphQL-on-render-hot-path,local-disk-uploads(breaks-serverless),remove client-bundle-shim while on storage-vercel-blob@3.85.1,revert-codegen-to-stock-payload-CLI(breaks-node24)

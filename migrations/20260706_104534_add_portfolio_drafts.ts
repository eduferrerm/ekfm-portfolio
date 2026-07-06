import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_portfolio_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__portfolio_v_version_key_decisions_conclusion" AS ENUM('up', 'down', 'none');
  CREATE TYPE "public"."enum__portfolio_v_version_diagram_key" AS ENUM('context-aware-routes', 'design-system-ssot', 'keyword-recall-lanes', 'seed-pipeline', 'mental-graph-render', 'diagram-registry', 'search-corpus', 'agent-guardrail-loop', 'website-stack');
  CREATE TYPE "public"."enum__portfolio_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_portfolio_v_version_overview" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_portfolio_v_version_key_decisions_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_portfolio_v_version_key_decisions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"conclusion" "enum__portfolio_v_version_key_decisions_conclusion" DEFAULT 'up',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_portfolio_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_eyebrow" varchar,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_thumbnail_id" integer,
  	"version_summary" varchar,
  	"version_diagram_key" "enum__portfolio_v_version_diagram_key",
  	"version_key_decisions_title" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__portfolio_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_portfolio_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"portfolio_id" integer,
  	"experience_id" integer,
  	"keywords_id" integer
  );
  
  ALTER TABLE "portfolio_overview" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "portfolio_key_decisions_points" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "portfolio_key_decisions" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "portfolio_key_decisions" ALTER COLUMN "conclusion" DROP NOT NULL;
  ALTER TABLE "portfolio" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "portfolio" ALTER COLUMN "eyebrow" DROP NOT NULL;
  ALTER TABLE "portfolio" ALTER COLUMN "diagram_key" DROP NOT NULL;
  ALTER TABLE "portfolio" ADD COLUMN "_status" "enum_portfolio_status" DEFAULT 'draft';
  ALTER TABLE "_portfolio_v_version_overview" ADD CONSTRAINT "_portfolio_v_version_overview_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_portfolio_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_portfolio_v_version_key_decisions_points" ADD CONSTRAINT "_portfolio_v_version_key_decisions_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_portfolio_v_version_key_decisions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_portfolio_v_version_key_decisions" ADD CONSTRAINT "_portfolio_v_version_key_decisions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_portfolio_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_portfolio_v" ADD CONSTRAINT "_portfolio_v_parent_id_portfolio_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."portfolio"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_portfolio_v" ADD CONSTRAINT "_portfolio_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_portfolio_v_rels" ADD CONSTRAINT "_portfolio_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_portfolio_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_portfolio_v_rels" ADD CONSTRAINT "_portfolio_v_rels_portfolio_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_portfolio_v_rels" ADD CONSTRAINT "_portfolio_v_rels_experience_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_portfolio_v_rels" ADD CONSTRAINT "_portfolio_v_rels_keywords_fk" FOREIGN KEY ("keywords_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_portfolio_v_version_overview_order_idx" ON "_portfolio_v_version_overview" USING btree ("_order");
  CREATE INDEX "_portfolio_v_version_overview_parent_id_idx" ON "_portfolio_v_version_overview" USING btree ("_parent_id");
  CREATE INDEX "_portfolio_v_version_key_decisions_points_order_idx" ON "_portfolio_v_version_key_decisions_points" USING btree ("_order");
  CREATE INDEX "_portfolio_v_version_key_decisions_points_parent_id_idx" ON "_portfolio_v_version_key_decisions_points" USING btree ("_parent_id");
  CREATE INDEX "_portfolio_v_version_key_decisions_order_idx" ON "_portfolio_v_version_key_decisions" USING btree ("_order");
  CREATE INDEX "_portfolio_v_version_key_decisions_parent_id_idx" ON "_portfolio_v_version_key_decisions" USING btree ("_parent_id");
  CREATE INDEX "_portfolio_v_parent_idx" ON "_portfolio_v" USING btree ("parent_id");
  CREATE INDEX "_portfolio_v_version_version_slug_idx" ON "_portfolio_v" USING btree ("version_slug");
  CREATE INDEX "_portfolio_v_version_version_thumbnail_idx" ON "_portfolio_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_portfolio_v_version_version_updated_at_idx" ON "_portfolio_v" USING btree ("version_updated_at");
  CREATE INDEX "_portfolio_v_version_version_created_at_idx" ON "_portfolio_v" USING btree ("version_created_at");
  CREATE INDEX "_portfolio_v_version_version__status_idx" ON "_portfolio_v" USING btree ("version__status");
  CREATE INDEX "_portfolio_v_created_at_idx" ON "_portfolio_v" USING btree ("created_at");
  CREATE INDEX "_portfolio_v_updated_at_idx" ON "_portfolio_v" USING btree ("updated_at");
  CREATE INDEX "_portfolio_v_latest_idx" ON "_portfolio_v" USING btree ("latest");
  CREATE INDEX "_portfolio_v_rels_order_idx" ON "_portfolio_v_rels" USING btree ("order");
  CREATE INDEX "_portfolio_v_rels_parent_idx" ON "_portfolio_v_rels" USING btree ("parent_id");
  CREATE INDEX "_portfolio_v_rels_path_idx" ON "_portfolio_v_rels" USING btree ("path");
  CREATE INDEX "_portfolio_v_rels_portfolio_id_idx" ON "_portfolio_v_rels" USING btree ("portfolio_id");
  CREATE INDEX "_portfolio_v_rels_experience_id_idx" ON "_portfolio_v_rels" USING btree ("experience_id");
  CREATE INDEX "_portfolio_v_rels_keywords_id_idx" ON "_portfolio_v_rels" USING btree ("keywords_id");
  CREATE INDEX "portfolio__status_idx" ON "portfolio" USING btree ("_status");
  UPDATE "portfolio" SET "_status" = 'published';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_portfolio_v_version_overview" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_portfolio_v_version_key_decisions_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_portfolio_v_version_key_decisions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_portfolio_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_portfolio_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_portfolio_v_version_overview" CASCADE;
  DROP TABLE "_portfolio_v_version_key_decisions_points" CASCADE;
  DROP TABLE "_portfolio_v_version_key_decisions" CASCADE;
  DROP TABLE "_portfolio_v" CASCADE;
  DROP TABLE "_portfolio_v_rels" CASCADE;
  DROP INDEX "portfolio__status_idx";
  ALTER TABLE "portfolio_overview" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "portfolio_key_decisions_points" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "portfolio_key_decisions" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "portfolio_key_decisions" ALTER COLUMN "conclusion" SET NOT NULL;
  ALTER TABLE "portfolio" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "portfolio" ALTER COLUMN "eyebrow" SET NOT NULL;
  ALTER TABLE "portfolio" ALTER COLUMN "diagram_key" SET NOT NULL;
  ALTER TABLE "portfolio" DROP COLUMN "_status";
  DROP TYPE "public"."enum_portfolio_status";
  DROP TYPE "public"."enum__portfolio_v_version_key_decisions_conclusion";
  DROP TYPE "public"."enum__portfolio_v_version_diagram_key";
  DROP TYPE "public"."enum__portfolio_v_version_status";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_landing_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__landing_v_version_sections_key" AS ENUM('tldr', 'experience', 'portfolio', 'moreAboutMe', 'contact');
  CREATE TYPE "public"."enum__landing_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_landing_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" "enum__landing_v_version_sections_key",
  	"nav_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_v_version_tldr_blocks_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_v_version_tldr_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_v_version_experience_dive_into_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_v_version_portfolio_dive_into_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_v_version_more_about_me_teaser_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_landing_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_title" varchar DEFAULT 'PRODUCT ENGINEERING',
  	"version_hero_drive_label" varchar DEFAULT 'Drive',
  	"version_hero_drive" varchar,
  	"version_hero_list_label" varchar DEFAULT 'Craft & Scope',
  	"version_tldr_greeting" varchar DEFAULT 'Hi there! I''m Edu 👋',
  	"version_tldr_subtitle" varchar DEFAULT 'Here''s a quick summary of who I am and what I do if in case you''re short on time',
  	"version_experience_heading" varchar DEFAULT 'Experience',
  	"version_experience_subheader" varchar DEFAULT 'The roles and teams where I have shipped product.',
  	"version_experience_dive_into_subheader" varchar DEFAULT 'Dive into',
  	"version_experience_cta_label" varchar DEFAULT 'View Role',
  	"version_portfolio_heading" varchar DEFAULT 'Portfolio',
  	"version_portfolio_subheader" varchar DEFAULT 'The features, systems, and architectural decisions that power this website.',
  	"version_portfolio_dive_into_subheader" varchar DEFAULT 'Dive into',
  	"version_portfolio_cta_label" varchar DEFAULT 'Feature Details',
  	"version_more_about_me_heading" varchar DEFAULT 'More about me',
  	"version_more_about_me_subheader" varchar DEFAULT 'Slight chance that perhaps too much, lol',
  	"version_more_about_me_teaser_eyebrow" varchar DEFAULT 'Mental Graph',
  	"version_more_about_me_teaser_title" varchar DEFAULT 'Relational Map Of ChatGPT Conversations',
  	"version_more_about_me_teaser_description" varchar,
  	"version_more_about_me_teaser_cta_label" varchar DEFAULT 'Read the write-up',
  	"version_more_about_me_teaser_cta_portfolio_item_id" integer,
  	"version_contact_header" varchar DEFAULT 'Contact',
  	"version_contact_subheader" varchar DEFAULT 'Thanks for taking the time to drop by and check out my portfolio 👋',
  	"version_contact_description" varchar,
  	"version_contact_cta_label" varchar,
  	"version_contact_cta_url" varchar,
  	"version__status" "enum__landing_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_landing_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"keywords_id" integer
  );
  
  ALTER TABLE "landing_sections" ALTER COLUMN "key" DROP NOT NULL;
  ALTER TABLE "landing_sections" ALTER COLUMN "nav_label" DROP NOT NULL;
  ALTER TABLE "landing_tldr_blocks_body" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "landing_tldr_blocks" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "landing_experience_dive_into_items" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "landing_portfolio_dive_into_items" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "landing_more_about_me_teaser_items" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "landing" ADD COLUMN "_status" "enum_landing_status" DEFAULT 'draft';
  ALTER TABLE "_landing_v_version_sections" ADD CONSTRAINT "_landing_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_v_version_tldr_blocks_body" ADD CONSTRAINT "_landing_v_version_tldr_blocks_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_v_version_tldr_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_v_version_tldr_blocks" ADD CONSTRAINT "_landing_v_version_tldr_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_v_version_experience_dive_into_items" ADD CONSTRAINT "_landing_v_version_experience_dive_into_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_v_version_portfolio_dive_into_items" ADD CONSTRAINT "_landing_v_version_portfolio_dive_into_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_v_version_more_about_me_teaser_items" ADD CONSTRAINT "_landing_v_version_more_about_me_teaser_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_landing_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_v" ADD CONSTRAINT "_landing_v_version_more_about_me_teaser_cta_portfolio_item_id_portfolio_id_fk" FOREIGN KEY ("version_more_about_me_teaser_cta_portfolio_item_id") REFERENCES "public"."portfolio"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_landing_v_rels" ADD CONSTRAINT "_landing_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_landing_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_landing_v_rels" ADD CONSTRAINT "_landing_v_rels_keywords_fk" FOREIGN KEY ("keywords_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_landing_v_version_sections_order_idx" ON "_landing_v_version_sections" USING btree ("_order");
  CREATE INDEX "_landing_v_version_sections_parent_id_idx" ON "_landing_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_landing_v_version_tldr_blocks_body_order_idx" ON "_landing_v_version_tldr_blocks_body" USING btree ("_order");
  CREATE INDEX "_landing_v_version_tldr_blocks_body_parent_id_idx" ON "_landing_v_version_tldr_blocks_body" USING btree ("_parent_id");
  CREATE INDEX "_landing_v_version_tldr_blocks_order_idx" ON "_landing_v_version_tldr_blocks" USING btree ("_order");
  CREATE INDEX "_landing_v_version_tldr_blocks_parent_id_idx" ON "_landing_v_version_tldr_blocks" USING btree ("_parent_id");
  CREATE INDEX "_landing_v_version_experience_dive_into_items_order_idx" ON "_landing_v_version_experience_dive_into_items" USING btree ("_order");
  CREATE INDEX "_landing_v_version_experience_dive_into_items_parent_id_idx" ON "_landing_v_version_experience_dive_into_items" USING btree ("_parent_id");
  CREATE INDEX "_landing_v_version_portfolio_dive_into_items_order_idx" ON "_landing_v_version_portfolio_dive_into_items" USING btree ("_order");
  CREATE INDEX "_landing_v_version_portfolio_dive_into_items_parent_id_idx" ON "_landing_v_version_portfolio_dive_into_items" USING btree ("_parent_id");
  CREATE INDEX "_landing_v_version_more_about_me_teaser_items_order_idx" ON "_landing_v_version_more_about_me_teaser_items" USING btree ("_order");
  CREATE INDEX "_landing_v_version_more_about_me_teaser_items_parent_id_idx" ON "_landing_v_version_more_about_me_teaser_items" USING btree ("_parent_id");
  CREATE INDEX "_landing_v_version_more_about_me_teaser_version_more_abo_idx" ON "_landing_v" USING btree ("version_more_about_me_teaser_cta_portfolio_item_id");
  CREATE INDEX "_landing_v_version_version__status_idx" ON "_landing_v" USING btree ("version__status");
  CREATE INDEX "_landing_v_created_at_idx" ON "_landing_v" USING btree ("created_at");
  CREATE INDEX "_landing_v_updated_at_idx" ON "_landing_v" USING btree ("updated_at");
  CREATE INDEX "_landing_v_latest_idx" ON "_landing_v" USING btree ("latest");
  CREATE INDEX "_landing_v_rels_order_idx" ON "_landing_v_rels" USING btree ("order");
  CREATE INDEX "_landing_v_rels_parent_idx" ON "_landing_v_rels" USING btree ("parent_id");
  CREATE INDEX "_landing_v_rels_path_idx" ON "_landing_v_rels" USING btree ("path");
  CREATE INDEX "_landing_v_rels_keywords_id_idx" ON "_landing_v_rels" USING btree ("keywords_id");
  CREATE INDEX "landing__status_idx" ON "landing" USING btree ("_status");
  UPDATE "landing" SET "_status" = 'published';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_landing_v_version_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_v_version_tldr_blocks_body" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_v_version_tldr_blocks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_v_version_experience_dive_into_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_v_version_portfolio_dive_into_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_v_version_more_about_me_teaser_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_landing_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_landing_v_version_sections" CASCADE;
  DROP TABLE "_landing_v_version_tldr_blocks_body" CASCADE;
  DROP TABLE "_landing_v_version_tldr_blocks" CASCADE;
  DROP TABLE "_landing_v_version_experience_dive_into_items" CASCADE;
  DROP TABLE "_landing_v_version_portfolio_dive_into_items" CASCADE;
  DROP TABLE "_landing_v_version_more_about_me_teaser_items" CASCADE;
  DROP TABLE "_landing_v" CASCADE;
  DROP TABLE "_landing_v_rels" CASCADE;
  DROP INDEX "landing__status_idx";
  ALTER TABLE "landing_sections" ALTER COLUMN "key" SET NOT NULL;
  ALTER TABLE "landing_sections" ALTER COLUMN "nav_label" SET NOT NULL;
  ALTER TABLE "landing_tldr_blocks_body" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "landing_tldr_blocks" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "landing_experience_dive_into_items" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "landing_portfolio_dive_into_items" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "landing_more_about_me_teaser_items" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "landing" DROP COLUMN "_status";
  DROP TYPE "public"."enum_landing_status";
  DROP TYPE "public"."enum__landing_v_version_sections_key";
  DROP TYPE "public"."enum__landing_v_version_status";`)
}

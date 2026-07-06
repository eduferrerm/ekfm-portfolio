import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_experience_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__experience_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "_experience_v_version_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experience_v_version_responsibilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experience_v_version_deep_dive_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experience_v_version_deep_dive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experience_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_role" varchar,
  	"version_company" varchar,
  	"version_slug" varchar,
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_current" boolean DEFAULT false,
  	"version_company_logo_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__experience_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_experience_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"keywords_id" integer
  );
  
  ALTER TABLE "experience_showcase" ALTER COLUMN "image_id" DROP NOT NULL;
  ALTER TABLE "experience_responsibilities" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "experience_deep_dive_details" ALTER COLUMN "text" DROP NOT NULL;
  ALTER TABLE "experience" ALTER COLUMN "role" DROP NOT NULL;
  ALTER TABLE "experience" ALTER COLUMN "company" DROP NOT NULL;
  ALTER TABLE "experience" ALTER COLUMN "start_date" DROP NOT NULL;
  ALTER TABLE "experience" ADD COLUMN "_status" "enum_experience_status" DEFAULT 'draft';
  ALTER TABLE "_experience_v_version_showcase" ADD CONSTRAINT "_experience_v_version_showcase_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_experience_v_version_showcase" ADD CONSTRAINT "_experience_v_version_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_version_responsibilities" ADD CONSTRAINT "_experience_v_version_responsibilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_version_deep_dive_details" ADD CONSTRAINT "_experience_v_version_deep_dive_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v_version_deep_dive"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_version_deep_dive" ADD CONSTRAINT "_experience_v_version_deep_dive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v" ADD CONSTRAINT "_experience_v_parent_id_experience_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experience"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_experience_v" ADD CONSTRAINT "_experience_v_version_company_logo_id_media_id_fk" FOREIGN KEY ("version_company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_experience_v_rels" ADD CONSTRAINT "_experience_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_experience_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experience_v_rels" ADD CONSTRAINT "_experience_v_rels_keywords_fk" FOREIGN KEY ("keywords_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_experience_v_version_showcase_order_idx" ON "_experience_v_version_showcase" USING btree ("_order");
  CREATE INDEX "_experience_v_version_showcase_parent_id_idx" ON "_experience_v_version_showcase" USING btree ("_parent_id");
  CREATE INDEX "_experience_v_version_showcase_image_idx" ON "_experience_v_version_showcase" USING btree ("image_id");
  CREATE INDEX "_experience_v_version_responsibilities_order_idx" ON "_experience_v_version_responsibilities" USING btree ("_order");
  CREATE INDEX "_experience_v_version_responsibilities_parent_id_idx" ON "_experience_v_version_responsibilities" USING btree ("_parent_id");
  CREATE INDEX "_experience_v_version_deep_dive_details_order_idx" ON "_experience_v_version_deep_dive_details" USING btree ("_order");
  CREATE INDEX "_experience_v_version_deep_dive_details_parent_id_idx" ON "_experience_v_version_deep_dive_details" USING btree ("_parent_id");
  CREATE INDEX "_experience_v_version_deep_dive_order_idx" ON "_experience_v_version_deep_dive" USING btree ("_order");
  CREATE INDEX "_experience_v_version_deep_dive_parent_id_idx" ON "_experience_v_version_deep_dive" USING btree ("_parent_id");
  CREATE INDEX "_experience_v_parent_idx" ON "_experience_v" USING btree ("parent_id");
  CREATE INDEX "_experience_v_version_version_slug_idx" ON "_experience_v" USING btree ("version_slug");
  CREATE INDEX "_experience_v_version_version_company_logo_idx" ON "_experience_v" USING btree ("version_company_logo_id");
  CREATE INDEX "_experience_v_version_version_updated_at_idx" ON "_experience_v" USING btree ("version_updated_at");
  CREATE INDEX "_experience_v_version_version_created_at_idx" ON "_experience_v" USING btree ("version_created_at");
  CREATE INDEX "_experience_v_version_version__status_idx" ON "_experience_v" USING btree ("version__status");
  CREATE INDEX "_experience_v_created_at_idx" ON "_experience_v" USING btree ("created_at");
  CREATE INDEX "_experience_v_updated_at_idx" ON "_experience_v" USING btree ("updated_at");
  CREATE INDEX "_experience_v_latest_idx" ON "_experience_v" USING btree ("latest");
  CREATE INDEX "_experience_v_rels_order_idx" ON "_experience_v_rels" USING btree ("order");
  CREATE INDEX "_experience_v_rels_parent_idx" ON "_experience_v_rels" USING btree ("parent_id");
  CREATE INDEX "_experience_v_rels_path_idx" ON "_experience_v_rels" USING btree ("path");
  CREATE INDEX "_experience_v_rels_keywords_id_idx" ON "_experience_v_rels" USING btree ("keywords_id");
  CREATE INDEX "experience__status_idx" ON "experience" USING btree ("_status");
  UPDATE "experience" SET "_status" = 'published';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_experience_v_version_showcase" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_experience_v_version_responsibilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_experience_v_version_deep_dive_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_experience_v_version_deep_dive" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_experience_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_experience_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_experience_v_version_showcase" CASCADE;
  DROP TABLE "_experience_v_version_responsibilities" CASCADE;
  DROP TABLE "_experience_v_version_deep_dive_details" CASCADE;
  DROP TABLE "_experience_v_version_deep_dive" CASCADE;
  DROP TABLE "_experience_v" CASCADE;
  DROP TABLE "_experience_v_rels" CASCADE;
  DROP INDEX "experience__status_idx";
  ALTER TABLE "experience_showcase" ALTER COLUMN "image_id" SET NOT NULL;
  ALTER TABLE "experience_responsibilities" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "experience_deep_dive_details" ALTER COLUMN "text" SET NOT NULL;
  ALTER TABLE "experience" ALTER COLUMN "role" SET NOT NULL;
  ALTER TABLE "experience" ALTER COLUMN "company" SET NOT NULL;
  ALTER TABLE "experience" ALTER COLUMN "start_date" SET NOT NULL;
  ALTER TABLE "experience" DROP COLUMN "_status";
  DROP TYPE "public"."enum_experience_status";
  DROP TYPE "public"."enum__experience_v_version_status";`)
}

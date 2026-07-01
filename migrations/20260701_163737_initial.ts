import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_portfolio_key_decisions_conclusion" AS ENUM('up', 'down', 'none');
  CREATE TYPE "public"."enum_portfolio_diagram_key" AS ENUM('context-aware-routes', 'design-system-ssot', 'keyword-recall-lanes', 'seed-pipeline', 'mental-graph-render', 'diagram-registry', 'search-corpus', 'agent-guardrail-loop', 'website-stack');
  CREATE TYPE "public"."enum_keywords_category" AS ENUM('scope', 'craft', 'searchOnly');
  CREATE TYPE "public"."enum_landing_sections_key" AS ENUM('tldr', 'experience', 'portfolio', 'moreAboutMe', 'contact');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "portfolio_overview" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "portfolio_key_decisions_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "portfolio_key_decisions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"conclusion" "enum_portfolio_key_decisions_conclusion" DEFAULT 'up' NOT NULL
  );
  
  CREATE TABLE "portfolio" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"eyebrow" varchar NOT NULL,
  	"slug" varchar,
  	"order" numeric DEFAULT 0,
  	"thumbnail_id" integer,
  	"summary" varchar,
  	"diagram_key" "enum_portfolio_diagram_key" NOT NULL,
  	"key_decisions_title" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "portfolio_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"portfolio_id" integer,
  	"experience_id" integer,
  	"keywords_id" integer
  );
  
  CREATE TABLE "experience_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "experience_responsibilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "experience_deep_dive_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "experience_deep_dive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "experience" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" varchar NOT NULL,
  	"company" varchar NOT NULL,
  	"slug" varchar,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"current" boolean DEFAULT false,
  	"company_logo_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "experience_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"keywords_id" integer
  );
  
  CREATE TABLE "visitors_expectations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"expectation" varchar NOT NULL,
  	"reply" varchar NOT NULL
  );
  
  CREATE TABLE "visitors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"company" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"company_logo_id" integer,
  	"job_post_url" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "visitors_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"portfolio_id" integer,
  	"experience_id" integer
  );
  
  CREATE TABLE "keywords" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"category" "enum_keywords_category" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "keywords_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"portfolio_id" integer,
  	"experience_id" integer,
  	"visitors_id" integer,
  	"keywords_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "visitor_content_intro" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "visitor_content" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"welcome_greeting" varchar DEFAULT 'Thanks for making time to drop by!',
  	"highlight_phrase" varchar,
  	"constants_expectations" varchar DEFAULT 'Expectations',
  	"constants_reply" varchar DEFAULT 'Reply',
  	"constants_relevant_content" varchar DEFAULT 'Relevant content',
  	"constants_job_post" varchar DEFAULT 'Job Post Here',
  	"constants_dear_company_nav" varchar DEFAULT 'Dear Company',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "landing_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" "enum_landing_sections_key" NOT NULL,
  	"nav_label" varchar NOT NULL
  );
  
  CREATE TABLE "landing_tldr_blocks_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "landing_tldr_blocks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL
  );
  
  CREATE TABLE "landing_experience_dive_into_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "landing_portfolio_dive_into_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "landing_more_about_me_teaser_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "landing" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_title" varchar DEFAULT 'PRODUCT ENGINEERING',
  	"hero_drive_label" varchar DEFAULT 'Drive',
  	"hero_drive" varchar,
  	"hero_list_label" varchar DEFAULT 'Craft & Scope',
  	"tldr_greeting" varchar DEFAULT 'Hi there! I''m Edu 👋',
  	"tldr_subtitle" varchar DEFAULT 'Here''s a quick summary of who I am and what I do if in case you''re short on time',
  	"experience_heading" varchar DEFAULT 'Experience',
  	"experience_subheader" varchar DEFAULT 'The roles and teams where I have shipped product.',
  	"experience_dive_into_subheader" varchar DEFAULT 'Dive into',
  	"experience_cta_label" varchar DEFAULT 'View Role',
  	"portfolio_heading" varchar DEFAULT 'Portfolio',
  	"portfolio_subheader" varchar DEFAULT 'The features, systems, and architectural decisions that power this website.',
  	"portfolio_dive_into_subheader" varchar DEFAULT 'Dive into',
  	"portfolio_cta_label" varchar DEFAULT 'Feature Details',
  	"more_about_me_heading" varchar DEFAULT 'More about me',
  	"more_about_me_subheader" varchar DEFAULT 'Slight chance that perhaps too much, lol',
  	"more_about_me_teaser_eyebrow" varchar DEFAULT 'Mental Graph',
  	"more_about_me_teaser_title" varchar DEFAULT 'Relational Map Of ChatGPT Conversations',
  	"more_about_me_teaser_description" varchar,
  	"more_about_me_teaser_cta_label" varchar DEFAULT 'Read the write-up',
  	"more_about_me_teaser_cta_portfolio_item_id" integer,
  	"contact_header" varchar DEFAULT 'Contact',
  	"contact_subheader" varchar DEFAULT 'Thanks for taking the time to drop by and check out my portfolio 👋',
  	"contact_description" varchar,
  	"contact_cta_label" varchar,
  	"contact_cta_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "landing_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"keywords_id" integer
  );
  
  CREATE TABLE "labels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"constants_portfolio_overview" varchar DEFAULT 'Overview',
  	"constants_portfolio_system_design" varchar DEFAULT 'System Design',
  	"constants_portfolio_key_decisions" varchar DEFAULT 'Key Decisions',
  	"constants_portfolio_conclusion" varchar DEFAULT 'Conclusion',
  	"constants_portfolio_relevant_content" varchar DEFAULT 'Relevant content',
  	"constants_experience_role_description" varchar DEFAULT 'Responsibilities',
  	"constants_experience_scope" varchar DEFAULT 'Scope',
  	"constants_experience_craft" varchar DEFAULT 'Craft',
  	"constants_experience_deep_dive" varchar DEFAULT 'Deep Dive',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_overview" ADD CONSTRAINT "portfolio_overview_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_key_decisions_points" ADD CONSTRAINT "portfolio_key_decisions_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portfolio_key_decisions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_key_decisions" ADD CONSTRAINT "portfolio_key_decisions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "portfolio_rels" ADD CONSTRAINT "portfolio_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_rels" ADD CONSTRAINT "portfolio_rels_portfolio_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_rels" ADD CONSTRAINT "portfolio_rels_experience_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portfolio_rels" ADD CONSTRAINT "portfolio_rels_keywords_fk" FOREIGN KEY ("keywords_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_showcase" ADD CONSTRAINT "experience_showcase_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experience_showcase" ADD CONSTRAINT "experience_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_responsibilities" ADD CONSTRAINT "experience_responsibilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_deep_dive_details" ADD CONSTRAINT "experience_deep_dive_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experience_deep_dive"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_deep_dive" ADD CONSTRAINT "experience_deep_dive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience" ADD CONSTRAINT "experience_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experience_rels" ADD CONSTRAINT "experience_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experience_rels" ADD CONSTRAINT "experience_rels_keywords_fk" FOREIGN KEY ("keywords_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "visitors_expectations" ADD CONSTRAINT "visitors_expectations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."visitors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "visitors" ADD CONSTRAINT "visitors_company_logo_id_media_id_fk" FOREIGN KEY ("company_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "visitors_rels" ADD CONSTRAINT "visitors_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."visitors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "visitors_rels" ADD CONSTRAINT "visitors_rels_portfolio_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "visitors_rels" ADD CONSTRAINT "visitors_rels_experience_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "keywords_texts" ADD CONSTRAINT "keywords_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_portfolio_fk" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolio"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_experience_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experience"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_visitors_fk" FOREIGN KEY ("visitors_id") REFERENCES "public"."visitors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_keywords_fk" FOREIGN KEY ("keywords_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "visitor_content_intro" ADD CONSTRAINT "visitor_content_intro_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."visitor_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_sections" ADD CONSTRAINT "landing_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_tldr_blocks_body" ADD CONSTRAINT "landing_tldr_blocks_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_tldr_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_tldr_blocks" ADD CONSTRAINT "landing_tldr_blocks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_experience_dive_into_items" ADD CONSTRAINT "landing_experience_dive_into_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_portfolio_dive_into_items" ADD CONSTRAINT "landing_portfolio_dive_into_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_more_about_me_teaser_items" ADD CONSTRAINT "landing_more_about_me_teaser_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing" ADD CONSTRAINT "landing_more_about_me_teaser_cta_portfolio_item_id_portfolio_id_fk" FOREIGN KEY ("more_about_me_teaser_cta_portfolio_item_id") REFERENCES "public"."portfolio"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_rels" ADD CONSTRAINT "landing_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."landing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_rels" ADD CONSTRAINT "landing_rels_keywords_fk" FOREIGN KEY ("keywords_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "portfolio_overview_order_idx" ON "portfolio_overview" USING btree ("_order");
  CREATE INDEX "portfolio_overview_parent_id_idx" ON "portfolio_overview" USING btree ("_parent_id");
  CREATE INDEX "portfolio_key_decisions_points_order_idx" ON "portfolio_key_decisions_points" USING btree ("_order");
  CREATE INDEX "portfolio_key_decisions_points_parent_id_idx" ON "portfolio_key_decisions_points" USING btree ("_parent_id");
  CREATE INDEX "portfolio_key_decisions_order_idx" ON "portfolio_key_decisions" USING btree ("_order");
  CREATE INDEX "portfolio_key_decisions_parent_id_idx" ON "portfolio_key_decisions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "portfolio_slug_idx" ON "portfolio" USING btree ("slug");
  CREATE INDEX "portfolio_thumbnail_idx" ON "portfolio" USING btree ("thumbnail_id");
  CREATE INDEX "portfolio_updated_at_idx" ON "portfolio" USING btree ("updated_at");
  CREATE INDEX "portfolio_created_at_idx" ON "portfolio" USING btree ("created_at");
  CREATE INDEX "portfolio_rels_order_idx" ON "portfolio_rels" USING btree ("order");
  CREATE INDEX "portfolio_rels_parent_idx" ON "portfolio_rels" USING btree ("parent_id");
  CREATE INDEX "portfolio_rels_path_idx" ON "portfolio_rels" USING btree ("path");
  CREATE INDEX "portfolio_rels_portfolio_id_idx" ON "portfolio_rels" USING btree ("portfolio_id");
  CREATE INDEX "portfolio_rels_experience_id_idx" ON "portfolio_rels" USING btree ("experience_id");
  CREATE INDEX "portfolio_rels_keywords_id_idx" ON "portfolio_rels" USING btree ("keywords_id");
  CREATE INDEX "experience_showcase_order_idx" ON "experience_showcase" USING btree ("_order");
  CREATE INDEX "experience_showcase_parent_id_idx" ON "experience_showcase" USING btree ("_parent_id");
  CREATE INDEX "experience_showcase_image_idx" ON "experience_showcase" USING btree ("image_id");
  CREATE INDEX "experience_responsibilities_order_idx" ON "experience_responsibilities" USING btree ("_order");
  CREATE INDEX "experience_responsibilities_parent_id_idx" ON "experience_responsibilities" USING btree ("_parent_id");
  CREATE INDEX "experience_deep_dive_details_order_idx" ON "experience_deep_dive_details" USING btree ("_order");
  CREATE INDEX "experience_deep_dive_details_parent_id_idx" ON "experience_deep_dive_details" USING btree ("_parent_id");
  CREATE INDEX "experience_deep_dive_order_idx" ON "experience_deep_dive" USING btree ("_order");
  CREATE INDEX "experience_deep_dive_parent_id_idx" ON "experience_deep_dive" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "experience_slug_idx" ON "experience" USING btree ("slug");
  CREATE INDEX "experience_company_logo_idx" ON "experience" USING btree ("company_logo_id");
  CREATE INDEX "experience_updated_at_idx" ON "experience" USING btree ("updated_at");
  CREATE INDEX "experience_created_at_idx" ON "experience" USING btree ("created_at");
  CREATE INDEX "experience_rels_order_idx" ON "experience_rels" USING btree ("order");
  CREATE INDEX "experience_rels_parent_idx" ON "experience_rels" USING btree ("parent_id");
  CREATE INDEX "experience_rels_path_idx" ON "experience_rels" USING btree ("path");
  CREATE INDEX "experience_rels_keywords_id_idx" ON "experience_rels" USING btree ("keywords_id");
  CREATE INDEX "visitors_expectations_order_idx" ON "visitors_expectations" USING btree ("_order");
  CREATE INDEX "visitors_expectations_parent_id_idx" ON "visitors_expectations" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "visitors_slug_idx" ON "visitors" USING btree ("slug");
  CREATE INDEX "visitors_company_logo_idx" ON "visitors" USING btree ("company_logo_id");
  CREATE INDEX "visitors_updated_at_idx" ON "visitors" USING btree ("updated_at");
  CREATE INDEX "visitors_created_at_idx" ON "visitors" USING btree ("created_at");
  CREATE INDEX "visitors_rels_order_idx" ON "visitors_rels" USING btree ("order");
  CREATE INDEX "visitors_rels_parent_idx" ON "visitors_rels" USING btree ("parent_id");
  CREATE INDEX "visitors_rels_path_idx" ON "visitors_rels" USING btree ("path");
  CREATE INDEX "visitors_rels_portfolio_id_idx" ON "visitors_rels" USING btree ("portfolio_id");
  CREATE INDEX "visitors_rels_experience_id_idx" ON "visitors_rels" USING btree ("experience_id");
  CREATE UNIQUE INDEX "keywords_key_idx" ON "keywords" USING btree ("key");
  CREATE INDEX "keywords_updated_at_idx" ON "keywords" USING btree ("updated_at");
  CREATE INDEX "keywords_created_at_idx" ON "keywords" USING btree ("created_at");
  CREATE INDEX "keywords_texts_order_parent" ON "keywords_texts" USING btree ("order","parent_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_portfolio_id_idx" ON "payload_locked_documents_rels" USING btree ("portfolio_id");
  CREATE INDEX "payload_locked_documents_rels_experience_id_idx" ON "payload_locked_documents_rels" USING btree ("experience_id");
  CREATE INDEX "payload_locked_documents_rels_visitors_id_idx" ON "payload_locked_documents_rels" USING btree ("visitors_id");
  CREATE INDEX "payload_locked_documents_rels_keywords_id_idx" ON "payload_locked_documents_rels" USING btree ("keywords_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "visitor_content_intro_order_idx" ON "visitor_content_intro" USING btree ("_order");
  CREATE INDEX "visitor_content_intro_parent_id_idx" ON "visitor_content_intro" USING btree ("_parent_id");
  CREATE INDEX "landing_sections_order_idx" ON "landing_sections" USING btree ("_order");
  CREATE INDEX "landing_sections_parent_id_idx" ON "landing_sections" USING btree ("_parent_id");
  CREATE INDEX "landing_tldr_blocks_body_order_idx" ON "landing_tldr_blocks_body" USING btree ("_order");
  CREATE INDEX "landing_tldr_blocks_body_parent_id_idx" ON "landing_tldr_blocks_body" USING btree ("_parent_id");
  CREATE INDEX "landing_tldr_blocks_order_idx" ON "landing_tldr_blocks" USING btree ("_order");
  CREATE INDEX "landing_tldr_blocks_parent_id_idx" ON "landing_tldr_blocks" USING btree ("_parent_id");
  CREATE INDEX "landing_experience_dive_into_items_order_idx" ON "landing_experience_dive_into_items" USING btree ("_order");
  CREATE INDEX "landing_experience_dive_into_items_parent_id_idx" ON "landing_experience_dive_into_items" USING btree ("_parent_id");
  CREATE INDEX "landing_portfolio_dive_into_items_order_idx" ON "landing_portfolio_dive_into_items" USING btree ("_order");
  CREATE INDEX "landing_portfolio_dive_into_items_parent_id_idx" ON "landing_portfolio_dive_into_items" USING btree ("_parent_id");
  CREATE INDEX "landing_more_about_me_teaser_items_order_idx" ON "landing_more_about_me_teaser_items" USING btree ("_order");
  CREATE INDEX "landing_more_about_me_teaser_items_parent_id_idx" ON "landing_more_about_me_teaser_items" USING btree ("_parent_id");
  CREATE INDEX "landing_more_about_me_teaser_more_about_me_teaser_cta_po_idx" ON "landing" USING btree ("more_about_me_teaser_cta_portfolio_item_id");
  CREATE INDEX "landing_rels_order_idx" ON "landing_rels" USING btree ("order");
  CREATE INDEX "landing_rels_parent_idx" ON "landing_rels" USING btree ("parent_id");
  CREATE INDEX "landing_rels_path_idx" ON "landing_rels" USING btree ("path");
  CREATE INDEX "landing_rels_keywords_id_idx" ON "landing_rels" USING btree ("keywords_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "portfolio_overview" CASCADE;
  DROP TABLE "portfolio_key_decisions_points" CASCADE;
  DROP TABLE "portfolio_key_decisions" CASCADE;
  DROP TABLE "portfolio" CASCADE;
  DROP TABLE "portfolio_rels" CASCADE;
  DROP TABLE "experience_showcase" CASCADE;
  DROP TABLE "experience_responsibilities" CASCADE;
  DROP TABLE "experience_deep_dive_details" CASCADE;
  DROP TABLE "experience_deep_dive" CASCADE;
  DROP TABLE "experience" CASCADE;
  DROP TABLE "experience_rels" CASCADE;
  DROP TABLE "visitors_expectations" CASCADE;
  DROP TABLE "visitors" CASCADE;
  DROP TABLE "visitors_rels" CASCADE;
  DROP TABLE "keywords" CASCADE;
  DROP TABLE "keywords_texts" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "visitor_content_intro" CASCADE;
  DROP TABLE "visitor_content" CASCADE;
  DROP TABLE "landing_sections" CASCADE;
  DROP TABLE "landing_tldr_blocks_body" CASCADE;
  DROP TABLE "landing_tldr_blocks" CASCADE;
  DROP TABLE "landing_experience_dive_into_items" CASCADE;
  DROP TABLE "landing_portfolio_dive_into_items" CASCADE;
  DROP TABLE "landing_more_about_me_teaser_items" CASCADE;
  DROP TABLE "landing" CASCADE;
  DROP TABLE "landing_rels" CASCADE;
  DROP TABLE "labels" CASCADE;
  DROP TYPE "public"."enum_portfolio_key_decisions_conclusion";
  DROP TYPE "public"."enum_portfolio_diagram_key";
  DROP TYPE "public"."enum_keywords_category";
  DROP TYPE "public"."enum_landing_sections_key";`)
}

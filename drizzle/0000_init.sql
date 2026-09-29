CREATE TYPE "public"."client_status" AS ENUM('active', 'paused', 'ended');--> statement-breakpoint
CREATE TYPE "public"."contact_channel" AS ENUM('email', 'instagram', 'facebook', 'whatsapp', 'phone');--> statement-breakpoint
CREATE TYPE "public"."lead_category" AS ENUM('cafe', 'restaurant', 'salon', 'clinic', 'stay', 'other');--> statement-breakpoint
CREATE TYPE "public"."lead_stage" AS ENUM('found', 'demo_built', 'contacted', 'replied', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."payment_kind" AS ENUM('setup', 'monthly', 'other');--> statement-breakpoint
CREATE TYPE "public"."website_state" AS ENUM('none', 'broken', 'outdated', 'fine');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer,
	"name" text NOT NULL,
	"domain" text,
	"status" "client_status" DEFAULT 'active' NOT NULL,
	"setup_fee" integer DEFAULT 0 NOT NULL,
	"monthly_fee" integer DEFAULT 0 NOT NULL,
	"started_on" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_zh" text,
	"category" "lead_category" NOT NULL,
	"district" text,
	"stage" "lead_stage" DEFAULT 'found' NOT NULL,
	"website_state" "website_state" NOT NULL,
	"website_url" text,
	"problem" text,
	"channel" "contact_channel",
	"contact" text,
	"demo_slug" text,
	"sources" text,
	"notes" text,
	"contacted_on" date,
	"next_action_on" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"kind" "payment_kind" NOT NULL,
	"amount" integer NOT NULL,
	"paid_on" date NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;
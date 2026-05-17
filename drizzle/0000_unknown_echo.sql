CREATE TABLE "meta" (
	"key" varchar(128) PRIMARY KEY NOT NULL,
	"value" varchar(2048) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "setlists" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"items" jsonb NOT NULL,
	"notes" text,
	"created_at" varchar(32) NOT NULL,
	"updated_at" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "songs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"artist" varchar(255) NOT NULL,
	"original_key" varchar(16) NOT NULL,
	"current_key" varchar(16) NOT NULL,
	"bpm" integer,
	"time_signature" varchar(16),
	"sections" jsonb NOT NULL,
	"notes" text NOT NULL,
	"tags" jsonb NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"youtube_url" varchar(2048),
	"created_at" varchar(32) NOT NULL,
	"updated_at" varchar(32) NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL
);

CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"share_pin" text NOT NULL,
	"is_shared" boolean DEFAULT false NOT NULL,
	"is_pending_delete" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
INSERT INTO "sessions" ("id", "slug", "share_pin", "expires_at") VALUES ('01934e62-6363-7c39-9636-363636363636', 'legacy-session', 'legacy', '2099-01-01 00:00:00');
--> statement-breakpoint
ALTER TABLE "endpoints" ADD COLUMN "session_id" text;
--> statement-breakpoint
UPDATE "endpoints" SET "session_id" = '01934e62-6363-7c39-9636-363636363636';
--> statement-breakpoint
ALTER TABLE "endpoints" ALTER COLUMN "session_id" SET NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "endpoints" ADD CONSTRAINT "endpoints_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
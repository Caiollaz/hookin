CREATE TABLE "endpoints" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "endpoints_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "webhooks" ADD COLUMN "endpoint_id" text;--> statement-breakpoint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_endpoint_id_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."endpoints"("id") ON DELETE cascade ON UPDATE no action;
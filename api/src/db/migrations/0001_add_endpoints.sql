-- Create endpoints table
CREATE TABLE "endpoints" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create unique index on slug
CREATE UNIQUE INDEX "endpoints_slug_unique" ON "endpoints" ("slug");

-- Add endpoint_id column to webhooks table
ALTER TABLE "webhooks" ADD COLUMN "endpoint_id" text;

-- Create index on endpoint_id for performance
CREATE INDEX "webhooks_endpoint_id_idx" ON "webhooks" ("endpoint_id");

-- Add foreign key constraint
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_endpoint_id_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "endpoints"("id") ON DELETE cascade ON UPDATE no action;


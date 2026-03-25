CREATE TABLE "factus_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"client_id" text NOT NULL,
	"password" text NOT NULL,
	"client_secret" text NOT NULL,
	"environment" text DEFAULT 'sandbox' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "factus_integration" CASCADE;--> statement-breakpoint
ALTER TABLE "factus_credentials" ADD CONSTRAINT "factus_credentials_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "factus_credentials_userId_idx" ON "factus_credentials" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "factus_credentials_userId_isActive_idx" ON "factus_credentials" USING btree ("user_id","is_active");
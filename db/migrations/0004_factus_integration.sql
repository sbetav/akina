DROP TABLE "factus_token";
--> statement-breakpoint
CREATE TABLE "factus_integration" (
	"user_id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"client_secret" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"environment" text DEFAULT 'sandbox' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "factus_integration" ADD CONSTRAINT "factus_integration_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "factus_integration_userId_idx" ON "factus_integration" USING btree ("user_id");

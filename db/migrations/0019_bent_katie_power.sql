CREATE TABLE "providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credentials_id" uuid,
	"user_id" text NOT NULL,
	"identification" text NOT NULL,
	"dv" text,
	"identification_document_id" text NOT NULL,
	"names" text NOT NULL,
	"trade_name" text,
	"country_code" text DEFAULT 'CO',
	"is_resident" integer,
	"municipality_id" text,
	"address" text,
	"email" text,
	"phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_credentials_id_factus_credentials_id_fk" FOREIGN KEY ("credentials_id") REFERENCES "public"."factus_credentials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "providers_credentialsId_idx" ON "providers" USING btree ("credentials_id");--> statement-breakpoint
CREATE INDEX "providers_userId_idx" ON "providers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "providers_credentialsId_names_idx" ON "providers" USING btree ("credentials_id","names");
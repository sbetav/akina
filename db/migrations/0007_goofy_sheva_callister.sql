CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credentials_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"identification" text NOT NULL,
	"dv" text,
	"identification_document_id" text NOT NULL,
	"legal_organization_id" text NOT NULL,
	"tribute_id" text NOT NULL,
	"name" text NOT NULL,
	"trade_name" text,
	"address" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"municipality_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_credentials_id_factus_credentials_id_fk" FOREIGN KEY ("credentials_id") REFERENCES "public"."factus_credentials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customers_credentialsId_idx" ON "customers" USING btree ("credentials_id");--> statement-breakpoint
CREATE INDEX "customers_userId_idx" ON "customers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "customers_credentialsId_name_idx" ON "customers" USING btree ("credentials_id","name");
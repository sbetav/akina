CREATE TABLE "support_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credentials_id" uuid,
	"user_id" text NOT NULL,
	"number" text NOT NULL,
	"reference_code" text NOT NULL,
	"status" integer DEFAULT 0 NOT NULL,
	"provider_name" text NOT NULL,
	"provider_identification" text NOT NULL,
	"total" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "support_documents" ADD CONSTRAINT "support_documents_credentials_id_factus_credentials_id_fk" FOREIGN KEY ("credentials_id") REFERENCES "public"."factus_credentials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_documents" ADD CONSTRAINT "support_documents_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "support_documents_userId_idx" ON "support_documents" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "support_documents_credentialsId_idx" ON "support_documents" USING btree ("credentials_id");--> statement-breakpoint
CREATE UNIQUE INDEX "support_documents_referenceCode_unique" ON "support_documents" USING btree ("reference_code");
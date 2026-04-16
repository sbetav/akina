CREATE TABLE "adjustment_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"support_document_id" uuid NOT NULL,
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
ALTER TABLE "adjustment_notes" ADD CONSTRAINT "adjustment_notes_support_document_id_support_documents_id_fk" FOREIGN KEY ("support_document_id") REFERENCES "public"."support_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment_notes" ADD CONSTRAINT "adjustment_notes_credentials_id_factus_credentials_id_fk" FOREIGN KEY ("credentials_id") REFERENCES "public"."factus_credentials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment_notes" ADD CONSTRAINT "adjustment_notes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "adjustment_notes_supportDocumentId_idx" ON "adjustment_notes" USING btree ("support_document_id");--> statement-breakpoint
CREATE INDEX "adjustment_notes_userId_idx" ON "adjustment_notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "adjustment_notes_credentialsId_idx" ON "adjustment_notes" USING btree ("credentials_id");--> statement-breakpoint
CREATE UNIQUE INDEX "adjustment_notes_referenceCode_unique" ON "adjustment_notes" USING btree ("reference_code");
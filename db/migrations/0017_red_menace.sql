CREATE TABLE "credit_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"credentials_id" uuid,
	"user_id" text NOT NULL,
	"number" text NOT NULL,
	"reference_code" text NOT NULL,
	"status" integer DEFAULT 0 NOT NULL,
	"customer_name" text NOT NULL,
	"customer_identification" text NOT NULL,
	"total" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_credentials_id_factus_credentials_id_fk" FOREIGN KEY ("credentials_id") REFERENCES "public"."factus_credentials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_notes_invoiceId_idx" ON "credit_notes" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "credit_notes_userId_idx" ON "credit_notes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "credit_notes_credentialsId_idx" ON "credit_notes" USING btree ("credentials_id");--> statement-breakpoint
CREATE UNIQUE INDEX "credit_notes_referenceCode_unique" ON "credit_notes" USING btree ("reference_code");
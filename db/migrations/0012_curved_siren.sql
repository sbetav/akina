CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_credentials_id_factus_credentials_id_fk" FOREIGN KEY ("credentials_id") REFERENCES "public"."factus_credentials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoices_userId_idx" ON "invoices" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invoices_credentialsId_idx" ON "invoices" USING btree ("credentials_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_user_referenceCode_sandbox_unique" ON "invoices" USING btree ("user_id","reference_code") WHERE "invoices"."credentials_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_user_credentials_referenceCode_unique" ON "invoices" USING btree ("user_id","credentials_id","reference_code") WHERE "invoices"."credentials_id" is not null;

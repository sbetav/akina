DROP INDEX IF EXISTS "invoices_user_referenceCode_sandbox_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "invoices_user_credentials_referenceCode_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_referenceCode_unique" ON "invoices" USING btree ("reference_code");

ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_userId_credentialsId_code_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "products_userId_credentialsId_code_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "products_user_code_sandbox_unique" ON "products" USING btree ("user_id","code") WHERE "products"."credentials_id" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "products_user_credentials_code_unique" ON "products" USING btree ("user_id","credentials_id","code") WHERE "products"."credentials_id" is not null;

-- Add mode column to factus_integration
ALTER TABLE "factus_integration" ADD COLUMN "mode" text DEFAULT 'sandbox' NOT NULL;

-- Make credential columns nullable (they can exist without credentials when mode=sandbox)
ALTER TABLE "factus_integration" ALTER COLUMN "client_id" DROP NOT NULL;
ALTER TABLE "factus_integration" ALTER COLUMN "client_secret" DROP NOT NULL;
ALTER TABLE "factus_integration" ALTER COLUMN "username" DROP NOT NULL;
ALTER TABLE "factus_integration" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE "factus_integration" ALTER COLUMN "environment" DROP NOT NULL;

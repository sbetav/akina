-- Drop the old single-row-per-user table (no data migration needed)
DROP TABLE IF EXISTS "factus_integration";

-- Create the new multi-credential table
CREATE TABLE "factus_credentials" (
  "id"             uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id"        text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "name"           text NOT NULL,
  "username"       text NOT NULL,
  "client_id"      text NOT NULL,
  "password"       text NOT NULL,
  "client_secret"  text NOT NULL,
  "environment"    text NOT NULL DEFAULT 'sandbox',
  "is_active"      boolean NOT NULL DEFAULT false,
  "created_at"     timestamp DEFAULT now() NOT NULL,
  "updated_at"     timestamp DEFAULT now() NOT NULL
);

CREATE INDEX "factus_credentials_userId_idx"
  ON "factus_credentials" ("user_id");

CREATE INDEX "factus_credentials_userId_isActive_idx"
  ON "factus_credentials" ("user_id", "is_active");

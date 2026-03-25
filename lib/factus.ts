import { db } from "@/db/drizzle";
import { factusCredentials } from "@/db/schemas/factus-credentials";
import { decrypt } from "@/lib/crypto";
import { env } from "@/lib/env";
import { and, eq } from "drizzle-orm";
import { FactusClient } from "factus-js";

/**
 * The default shared sandbox client, instantiated from environment variables.
 * Used as a fallback when a user has no active credential set or their active
 * credential is invalid.
 */
export const defaultFactusClient = new FactusClient({
  clientId: env.FACTUS_CLIENT_ID,
  clientSecret: env.FACTUS_CLIENT_SECRET,
  username: env.FACTUS_USERNAME,
  password: env.FACTUS_PASSWORD,
  environment: "sandbox",
});

/**
 * Returns the active FactusClient for the given user.
 * If the user has an active credential set, it is decrypted and returned.
 * Otherwise, falls back to the shared Akina Sandbox client.
 */
export async function getFactusClientForUser(
  userId: string,
): Promise<FactusClient> {
  const row = await db.query.factusCredentials.findFirst({
    where: and(
      eq(factusCredentials.userId, userId),
      eq(factusCredentials.isActive, true),
    ),
  });

  if (!row) {
    return defaultFactusClient;
  }

  return new FactusClient({
    clientId: row.clientId,
    clientSecret: decrypt(row.clientSecret),
    username: row.username,
    password: decrypt(row.password),
    environment: row.environment as "sandbox" | "production",
  });
}

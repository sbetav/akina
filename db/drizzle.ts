import { authSchema } from "@/db/schemas/auth-schema";
import {
  factusCredentials,
  factusCredentialsRelations,
} from "@/db/schemas/factus-credentials";
import { env } from "@/lib/env";
import { drizzle } from "drizzle-orm/neon-http";

const schema = {
  ...authSchema,
  factusCredentials,
  factusCredentialsRelations,
};

export const db = drizzle(env.DATABASE_URL, { schema });

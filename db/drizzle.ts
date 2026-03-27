import { authSchema } from "@/db/schemas/auth-schema";
import { customers, customersRelations } from "@/db/schemas/customers";
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
  customers,
  customersRelations,
};

export const db = drizzle(env.DATABASE_URL, { schema });

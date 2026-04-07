import { drizzle } from "drizzle-orm/neon-http";
import { authSchema } from "@/db/schemas/auth-schema";
import { customers, customersRelations } from "@/db/schemas/customers";
import {
  factusCredentials,
  factusCredentialsRelations,
} from "@/db/schemas/factus-credentials";
import { products, productsRelations } from "@/db/schemas/products";
import { env } from "@/lib/env";

const schema = {
  ...authSchema,
  factusCredentials,
  factusCredentialsRelations,
  customers,
  customersRelations,
  products,
  productsRelations,
};

export const db = drizzle(env.DATABASE_URL, { schema });

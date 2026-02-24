import { env } from "@/lib/env";
import { drizzle } from "drizzle-orm/neon-http";

export const db = drizzle(env.DATABASE_URL);

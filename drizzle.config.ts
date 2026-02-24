import { defineConfig } from "drizzle-kit";
import { env } from "./lib/env";

export default defineConfig({
  schema: "./db/schemas/*",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});

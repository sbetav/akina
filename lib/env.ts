import { config } from "dotenv";
import z from "zod";

config({ path: ".env.local" });

const envSchema = z.object({
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  NEXT_PUBLIC_BASE_URL: z.string(),
});

export const env = envSchema.parse(process.env);

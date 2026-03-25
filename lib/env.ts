import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    RESEND_API_KEY: z.string(),
    RESEND_FROM: z.string(),
    FACTUS_USERNAME: z.string(),
    FACTUS_PASSWORD: z.string(),
    FACTUS_CLIENT_ID: z.string(),
    FACTUS_CLIENT_SECRET: z.string(),
    ENCRYPTION_KEY: z
      .string()
      .length(64, "ENCRYPTION_KEY must be a 64-char hex string (32 bytes)"),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
});

import { app } from "@/lib/elysia/app";
import { env } from "@/lib/env";
import { treaty } from "@elysiajs/eden";

export const api =
  typeof process !== "undefined"
    ? treaty(app).api
    : treaty<typeof app>(env.NEXT_PUBLIC_BASE_URL).api;

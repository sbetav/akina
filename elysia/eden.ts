import { treaty } from "@elysiajs/eden";
import type { app } from "@/elysia/app";
import { env } from "@/lib/env";

export const api = treaty<typeof app>(env.NEXT_PUBLIC_BASE_URL).api;

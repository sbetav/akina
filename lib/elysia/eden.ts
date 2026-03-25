import type { app } from "@/lib/elysia/app";
import { env } from "@/lib/env";
import { treaty } from "@elysiajs/eden";

export const api = treaty<typeof app>(env.NEXT_PUBLIC_BASE_URL).api;

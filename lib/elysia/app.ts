import { betterAuth } from "@/lib/elysia/better-auth";
import { Elysia } from "elysia";
import { factusModule } from "./modules/factus";

export const app = new Elysia({ prefix: "/api" })
  .use(betterAuth)
  .use(factusModule)
  .get("/health", () => ({
    ok: true as const,
  }));

import { betterAuth } from "@/lib/elysia/better-auth";
import { Elysia } from "elysia";
import { customersModule } from "./modules/customers";
import { factusModule } from "./modules/factus";
import { productsModule } from "./modules/products";

export const app = new Elysia({ prefix: "/api" })
  .use(betterAuth)
  .use(factusModule)
  .use(customersModule)
  .use(productsModule)
  .get("/health", () => ({
    ok: true as const,
  }));

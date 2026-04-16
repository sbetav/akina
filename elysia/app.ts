import { Elysia } from "elysia";
import { betterAuth } from "@/elysia/better-auth";
import { ApiError } from "@/elysia/errors";
import { adjustmentNotesModule } from "./modules/adjustment-notes";
import { creditNotesModule } from "./modules/credit-notes";
import { customersModule } from "./modules/customers";
import { dashboardModule } from "./modules/dashboard";
import { factusModule } from "./modules/factus";
import { invoicesModule } from "./modules/invoices";
import { productsModule } from "./modules/products";
import { providersModule } from "./modules/providers";
import { supportDocumentsModule } from "./modules/support-documents";

export const app = new Elysia({ prefix: "/api" })
  .error({ ApiError })
  .use(betterAuth)
  .use(dashboardModule)
  .use(factusModule)
  .use(customersModule)
  .use(creditNotesModule)
  .use(adjustmentNotesModule)
  .use(productsModule)
  .use(invoicesModule)
  .use(supportDocumentsModule)
  .use(providersModule)
  .onError(({ error, code, status }) => {
    if (error instanceof ApiError) {
      return status(error.status, { error: error.message });
    }

    if (code === "NOT_FOUND") {
      return status(404, { error: "Recurso no encontrado" });
    }

    if (code === "VALIDATION") {
      return status(422, {
        error: "Error de validación, revisa los datos y intenta de nuevo.",
      });
    }

    // catch-all
    return status(500, { error: "Error interno del servidor" });
  })
  .get("/health", () => ({
    ok: true as const,
  }));

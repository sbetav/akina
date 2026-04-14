import { Elysia, t } from "elysia";
import { FactusError } from "factus-js";
import { betterAuth } from "@/elysia/better-auth";
import {
  InvoiceCreateBody,
  InvoiceListQuery,
  InvoiceListResponse,
  InvoicePdfResponse,
  InvoiceRecord,
  InvoiceValidationError,
  InvoiceViewResponse,
} from "./model";
import { InvoiceService } from "./service";

export const invoicesModule = new Elysia({ prefix: "/invoices" })
  .use(betterAuth)

  // ─── List ───────────────────────────────────────────────────────────────────

  /**
   * GET /api/invoices
   * Returns a paginated list of invoices for the active workspace (from our DB).
   * Search tokenizes the query and matches partial terms against customerName
   * and number, ignoring punctuation.
   */
  .get(
    "/",
    async ({ user, query }) => {
      return await InvoiceService.list(user.id, query);
    },
    {
      auth: true,
      query: InvoiceListQuery,
      response: {
        200: InvoiceListResponse,
      },
    },
  )

  // ─── Create ─────────────────────────────────────────────────────────────────

  /**
   * POST /api/invoices
   * Creates a new invoice via Factus and persists the record to our DB.
   * Returns the saved invoice record on success.
   *
   * On DIAN validation failure, returns 422 with structured validationErrors
   * (keys = DIAN rule codes such as "FAK24", values = rejection descriptions).
   */
  .post(
    "/",
    async ({ user, body, status }) => {
      try {
        const record = await InvoiceService.create(user.id, body);
        return record;
      } catch (err) {
        if (err instanceof FactusError) {
          return status(422, {
            error: err.message,
            validationErrors: err.validationErrors ?? undefined,
          });
        }
        throw err;
      }
    },
    {
      auth: true,
      body: InvoiceCreateBody,
      response: {
        200: InvoiceRecord,
        422: InvoiceValidationError,
      },
    },
  )

  // ─── Get detail ─────────────────────────────────────────────────────────────

  /**
   * GET /api/invoices/:id
   * Returns the full invoice detail from Factus.
   * Uses our internal DB UUID as the route param; performs an ownership check
   * before calling Factus.
   */
  .get(
    "/:id",
    async ({ user, params }) => {
      const data = await InvoiceService.getFromFactus(user.id, params.id);
      return { data };
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: InvoiceViewResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )

  // ─── Download PDF ───────────────────────────────────────────────────────────

  /**
   * GET /api/invoices/:id/pdf
   * Returns the invoice PDF as a base64-encoded string along with the file name.
   * Uses our internal DB UUID as the route param; performs an ownership check
   * before calling Factus.
   */
  .get(
    "/:id/pdf",
    async ({ user, params }) => {
      return await InvoiceService.downloadPdf(user.id, params.id);
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: InvoicePdfResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )

  // ─── Delete ─────────────────────────────────────────────────────────────────

  /**
   * DELETE /api/invoices/:id
   * Deletes a non-validated invoice from Factus, then removes it from our DB.
   * Uses our internal DB UUID as the route param; performs an ownership check
   * before calling Factus.
   *
   * Returns 422 if the invoice has already been validated by the DIAN
   * (Factus will reject the deletion with a FactusError).
   */
  .delete(
    "/:id",
    async ({ user, params, status }) => {
      try {
        await InvoiceService.delete(user.id, params.id);
        return { success: true as const };
      } catch (err) {
        if (err instanceof FactusError) {
          return status(422, {
            error: err.message,
            validationErrors: err.validationErrors ?? undefined,
          });
        }
        throw err;
      }
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: t.Object({ success: t.Literal(true) }),
        404: t.Object({ error: t.String() }),
        422: InvoiceValidationError,
      },
    },
  );

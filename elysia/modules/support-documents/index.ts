import { Elysia, t } from "elysia";
import { FactusError } from "factus-js";
import { betterAuth } from "@/elysia/better-auth";
import {
  AdjustmentNoteCreateBody,
  AdjustmentNoteListResponse,
  AdjustmentNoteRecord,
  AdjustmentNoteValidationError,
} from "@/elysia/modules/adjustment-notes/model";
import { AdjustmentNoteService } from "@/elysia/modules/adjustment-notes/service";
import {
  SupportDocumentCreateBody,
  SupportDocumentListQuery,
  SupportDocumentListResponse,
  SupportDocumentPdfResponse,
  SupportDocumentRecord,
  SupportDocumentValidationError,
  SupportDocumentViewResponse,
} from "./model";
import { SupportDocumentService } from "./service";

export const supportDocumentsModule = new Elysia({
  prefix: "/support-documents",
})
  .use(betterAuth)

  // ─── List ───────────────────────────────────────────────────────────────────

  /**
   * GET /api/support-documents
   * Returns a paginated list of support documents for the active workspace.
   * Search tokenizes the query and matches partial terms against providerName
   * and number, ignoring punctuation.
   */
  .get(
    "/",
    async ({ user, query }) => {
      return await SupportDocumentService.list(user.id, query);
    },
    {
      auth: true,
      query: SupportDocumentListQuery,
      response: {
        200: SupportDocumentListResponse,
      },
    },
  )

  // ─── Create ─────────────────────────────────────────────────────────────────

  /**
   * POST /api/support-documents
   * Creates a new support document via Factus and persists the record to our DB.
   * Returns the saved record on success.
   *
   * On DIAN validation failure, returns 422 with structured validationErrors.
   * Also performs a best-effort deletion of the pending Factus draft to avoid
   * blocking other users sharing the same credentials.
   */
  .post(
    "/",
    async ({ user, body, status }) => {
      try {
        const record = await SupportDocumentService.create(user.id, body);
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
      body: SupportDocumentCreateBody,
      response: {
        200: SupportDocumentRecord,
        422: SupportDocumentValidationError,
      },
    },
  )

  // ─── Get detail ─────────────────────────────────────────────────────────────

  /**
   * GET /api/support-documents/:id
   * Returns the full support document detail from Factus.
   * Uses our internal DB UUID as the route param; performs an ownership check
   * before calling Factus.
   */
  .get(
    "/:id",
    async ({ user, params }) => {
      const data = await SupportDocumentService.getFromFactus(
        user.id,
        params.id,
      );
      return { data };
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: SupportDocumentViewResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )

  // ─── Download PDF ───────────────────────────────────────────────────────────

  /**
   * GET /api/support-documents/:id/pdf
   * Returns the support document PDF as a base64-encoded string along with
   * the file name. Uses our internal DB UUID; performs an ownership check
   * before calling Factus.
   */
  .get(
    "/:id/pdf",
    async ({ user, params }) => {
      return await SupportDocumentService.downloadPdf(user.id, params.id);
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: SupportDocumentPdfResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )

  // ─── Delete ─────────────────────────────────────────────────────────────────

  /**
   * DELETE /api/support-documents/:id
   * Deletes a non-validated support document from Factus, then removes it from
   * our DB. Uses our internal DB UUID; performs an ownership check before
   * calling Factus.
   *
   * Returns 422 if the document has already been validated by the DIAN
   * (Factus will reject the deletion with a FactusError).
   */
  .delete(
    "/:id",
    async ({ user, params, status }) => {
      try {
        await SupportDocumentService.delete(user.id, params.id);
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
        422: SupportDocumentValidationError,
      },
    },
  )

  // ─── Adjustment notes ────────────────────────────────────────────────────────

  /**
   * GET /api/support-documents/:id/adjustment-notes
   * Returns the list of adjustment notes for a support document (from our DB).
   */
  .get(
    "/:id/adjustment-notes",
    async ({ user, params }) => {
      return await AdjustmentNoteService.listForSupportDocument(
        user.id,
        params.id,
      );
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: AdjustmentNoteListResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )

  /**
   * POST /api/support-documents/:id/adjustment-notes
   * Creates a new adjustment note via Factus and persists it to our DB.
   * Returns the saved record on success.
   *
   * On DIAN validation failure, returns 422 with structured validationErrors.
   */
  .post(
    "/:id/adjustment-notes",
    async ({ user, params, body, status }) => {
      try {
        return await AdjustmentNoteService.create(user.id, params.id, body);
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
      body: AdjustmentNoteCreateBody,
      response: {
        200: AdjustmentNoteRecord,
        404: t.Object({ error: t.String() }),
        422: AdjustmentNoteValidationError,
      },
    },
  );

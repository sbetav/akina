import { Elysia, t } from "elysia";
import { FactusError } from "factus-js";
import { betterAuth } from "@/elysia/better-auth";
import {
  AdjustmentNotePdfResponse,
  AdjustmentNoteValidationError,
  AdjustmentNoteViewResponse,
} from "./model";
import { AdjustmentNoteService } from "./service";

export const adjustmentNotesModule = new Elysia({ prefix: "/adjustment-notes" })
  .use(betterAuth)

  // ─── Get detail ─────────────────────────────────────────────────────────────

  .get(
    "/:id",
    async ({ user, params }) => {
      const data = await AdjustmentNoteService.getFromFactus(
        user.id,
        params.id,
      );
      return { data };
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: AdjustmentNoteViewResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )

  // ─── Download PDF ───────────────────────────────────────────────────────────

  .get(
    "/:id/pdf",
    async ({ user, params }) => {
      return await AdjustmentNoteService.downloadPdf(user.id, params.id);
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: AdjustmentNotePdfResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )

  // ─── Delete ─────────────────────────────────────────────────────────────────

  .delete(
    "/:id",
    async ({ user, params, status }) => {
      try {
        await AdjustmentNoteService.delete(user.id, params.id);
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
        422: AdjustmentNoteValidationError,
      },
    },
  );

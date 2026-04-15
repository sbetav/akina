import { Elysia, t } from "elysia";
import { FactusError } from "factus-js";
import { betterAuth } from "@/elysia/better-auth";
import {
  CreditNotePdfResponse,
  CreditNoteValidationError,
  CreditNoteViewResponse,
} from "./model";
import { CreditNoteService } from "./service";

export const creditNotesModule = new Elysia({ prefix: "/credit-notes" })
  .use(betterAuth)
  .get(
    "/:id",
    async ({ user, params }) => {
      const data = await CreditNoteService.getFromFactus(user.id, params.id);
      return { data };
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: CreditNoteViewResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .get(
    "/:id/pdf",
    async ({ user, params }) => {
      return await CreditNoteService.downloadPdf(user.id, params.id);
    },
    {
      auth: true,
      params: t.Object({ id: t.String() }),
      response: {
        200: CreditNotePdfResponse,
        404: t.Object({ error: t.String() }),
      },
    },
  )
  .delete(
    "/:id",
    async ({ user, params, status }) => {
      try {
        await CreditNoteService.delete(user.id, params.id);
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
        422: CreditNoteValidationError,
      },
    },
  );

"use server";

import { factusApi } from "@/lib/factus";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";

export async function getMunicipalitiesAction() {
  return factusApi.municipalities.getAll();
}

export const getAcquirerAction = actionClient
  .inputSchema(
    z.object({
      identificationDocumentId: z.string(),
      identification: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    return factusApi.acquirers.getByDocument(
      parsedInput.identificationDocumentId,
      parsedInput.identification,
    );
  });

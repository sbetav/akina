"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import { ADJUSTMENT_NOTES_QUERY_KEY } from "@/lib/query-keys";

export async function getAdjustmentNote(adjustmentNoteId: string) {
  const res = await api["adjustment-notes"]({ id: adjustmentNoteId }).get();

  if (res.error) {
    throw new Error(
      getApiErrorMessage(res.error, "Error al obtener la nota de ajuste"),
    );
  }

  return res.data.data;
}

export function useAdjustmentNote(adjustmentNoteId: string, enabled = true) {
  return useQuery({
    queryKey: [...ADJUSTMENT_NOTES_QUERY_KEY, { adjustmentNoteId }],
    enabled,
    queryFn: () => getAdjustmentNote(adjustmentNoteId),
  });
}

export function usePrefetchAdjustmentNote() {
  const queryClient = useQueryClient();

  return (adjustmentNoteId: string) =>
    queryClient.prefetchQuery({
      queryKey: [...ADJUSTMENT_NOTES_QUERY_KEY, { adjustmentNoteId }],
      queryFn: () => getAdjustmentNote(adjustmentNoteId),
      staleTime: 60_000,
    });
}

export function useSupportDocumentAdjustmentNotes(supportDocumentId: string) {
  return useQuery({
    queryKey: [...ADJUSTMENT_NOTES_QUERY_KEY, { supportDocumentId }],
    queryFn: async () => {
      const res = await api["support-documents"]({ id: supportDocumentId })[
        "adjustment-notes"
      ].get();
      if (res.error) {
        throw new Error(
          getApiErrorMessage(res.error, "Error al obtener las notas de ajuste"),
        );
      }
      return res.data.items;
    },
  });
}

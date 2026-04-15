"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import { CREDIT_NOTES_QUERY_KEY } from "@/lib/query-keys";

export async function getCreditNote(creditNoteId: string) {
  const res = await api["credit-notes"]({ id: creditNoteId }).get();

  if (res.error) {
    throw new Error(
      getApiErrorMessage(res.error, "Error al obtener la nota crédito"),
    );
  }

  return res.data.data;
}

export function useCreditNote(creditNoteId: string, enabled = true) {
  return useQuery({
    queryKey: [...CREDIT_NOTES_QUERY_KEY, { creditNoteId }],
    enabled,
    queryFn: () => getCreditNote(creditNoteId),
  });
}

export function usePrefetchCreditNote() {
  const queryClient = useQueryClient();

  return (creditNoteId: string) =>
    queryClient.prefetchQuery({
      queryKey: [...CREDIT_NOTES_QUERY_KEY, { creditNoteId }],
      queryFn: () => getCreditNote(creditNoteId),
      staleTime: 60_000,
    });
}

export function useInvoiceCreditNotes(invoiceId: string) {
  return useQuery({
    queryKey: [...CREDIT_NOTES_QUERY_KEY, { invoiceId }],
    queryFn: async () => {
      const res = await api.invoices({ id: invoiceId })["credit-notes"].get();
      if (res.error) {
        throw new Error(
          getApiErrorMessage(res.error, "Error al obtener las notas crédito"),
        );
      }
      return res.data.items;
    },
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import { TRIBUTES_QUERY_KEY } from "@/lib/query-keys";

export function useTributes() {
  return useQuery({
    queryKey: TRIBUTES_QUERY_KEY,
    queryFn: async () => {
      const res = await api.factus.tributes.get();
      if (res.error) {
        throw new Error(
          getApiErrorMessage(res.error, "Error al obtener los tributos"),
        );
      }
      return res.data?.data ?? [];
    },
    staleTime: 60_000,
  });
}

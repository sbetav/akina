"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import { COUNTRIES_QUERY_KEY } from "@/lib/query-keys";

export function useCountries() {
  return useQuery({
    queryKey: [...COUNTRIES_QUERY_KEY],
    queryFn: async () => {
      const res = await api.factus.countries.get({ query: {} });
      if (res.error)
        throw new Error(
          getApiErrorMessage(res.error, "Error al obtener los países"),
        );
      return res.data?.data ?? [];
    },
    staleTime: Infinity,
  });
}

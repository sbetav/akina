"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import useDebounce from "@/hooks/ui/use-debounce";
import { DEFAULT_PROVIDERS_LIMIT, PROVIDERS_QUERY_KEY } from "@/lib/query-keys";

interface UseProvidersOptions {
  search?: string;
  page?: number;
  limit?: number;
  /** When true, keeps previous data while fetching (good for tables) */
  paginated?: boolean;
}

export function useProviders({
  search = "",
  page = 1,
  limit = DEFAULT_PROVIDERS_LIMIT,
  paginated = false,
}: UseProvidersOptions = {}) {
  const debouncedSearch = useDebounce(search, 300);

  const query = useQuery({
    queryKey: [
      ...PROVIDERS_QUERY_KEY,
      { search: debouncedSearch, page, limit },
    ],
    queryFn: async () => {
      const res = await api.providers.get({
        query: { search: debouncedSearch, page, limit },
      });
      if (res.error)
        throw new Error(
          getApiErrorMessage(res.error, "Error al buscar proveedores"),
        );
      return res.data;
    },
    placeholderData: paginated ? keepPreviousData : undefined,
    staleTime: 30_000,
  });

  return {
    ...query,
    debouncedSearch,
  };
}

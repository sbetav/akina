"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import useDebounce from "@/hooks/ui/use-debounce";
import { CUSTOMERS_QUERY_KEY, DEFAULT_CUSTOMERS_LIMIT } from "@/lib/query-keys";

interface UseCustomersOptions {
  search?: string;
  page?: number;
  limit?: number;
  /** When true, keeps previous data while fetching (good for tables) */
  paginated?: boolean;
}

export function useCustomers({
  search = "",
  page = 1,
  limit = DEFAULT_CUSTOMERS_LIMIT,
  paginated = false,
}: UseCustomersOptions = {}) {
  const debouncedSearch = useDebounce(search, 300);

  const query = useQuery({
    queryKey: [
      ...CUSTOMERS_QUERY_KEY,
      { search: debouncedSearch, page, limit },
    ],
    queryFn: async () => {
      const res = await api.customers.get({
        query: { search: debouncedSearch, page, limit },
      });
      if (res.error)
        throw new Error(
          getApiErrorMessage(res.error, "Error al buscar clientes"),
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

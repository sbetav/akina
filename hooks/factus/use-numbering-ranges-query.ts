import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import { NUMBERING_RANGES_QUERY_KEY } from "@/lib/query-keys";

interface UseNumberingRangesQueryParams {
  page: number;
  limit: number;
}

export function useNumberingRangesQuery({
  page,
  limit,
}: UseNumberingRangesQueryParams) {
  return useQuery({
    queryKey: [...NUMBERING_RANGES_QUERY_KEY, { page, limit }],
    queryFn: async () => {
      const res = await api.factus["numbering-ranges"].get({
        query: { page, limit },
      });
      if (res.error)
        throw new Error(
          getApiErrorMessage(
            res.error,
            "Error al obtener los rangos de numeración",
          ),
        );
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

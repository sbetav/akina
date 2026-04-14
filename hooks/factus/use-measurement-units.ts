"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import { MEASUREMENT_UNITS_QUERY_KEY } from "@/lib/query-keys";

export function useMeasurementUnits() {
  return useQuery({
    queryKey: MEASUREMENT_UNITS_QUERY_KEY,
    queryFn: async () => {
      const res = await api.factus["measurement-units"].get();
      if (res.error) {
        throw new Error(
          getApiErrorMessage(
            res.error,
            "Error al obtener las unidades de medida",
          ),
        );
      }
      return res.data?.data ?? [];
    },
    staleTime: 60_000,
  });
}

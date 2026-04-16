"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import { DASHBOARD_QUERY_KEY } from "@/lib/query-keys";

export function useDashboardMetrics() {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY],
    queryFn: async () => {
      const res = await api.dashboard.metrics.get();
      if (res.error)
        throw new Error(
          getApiErrorMessage(res.error, "Error al cargar las métricas"),
        );
      return res.data;
    },
    staleTime: 60_000, // 1 minute — dashboard metrics can be slightly stale
  });
}

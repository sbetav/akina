"use client";

import { useActiveCredentialsContext } from "@/contexts/active-credentials-context";
import { api } from "@/lib/elysia/eden";
import { CREDENTIALS_QUERY_KEY } from "@/lib/query-keys";
import { useQuery } from "@tanstack/react-query";

export function useActiveCredentials() {
  const { activate, isActivating } = useActiveCredentialsContext();

  const { data, isLoading } = useQuery({
    queryKey: CREDENTIALS_QUERY_KEY,
    queryFn: async () => {
      const res = await api.factus.credentials.get();
      if (res.error)
        throw new Error(
          (res.error as { value?: { error?: string } }).value?.error ??
            "Error al obtener las credenciales",
        );
      return res.data;
    },
  });

  const credentials = data?.items ?? [];
  const active = credentials.find((c) => c.isActive);

  return {
    credentials,
    active,
    isLoading,
    activate,
    isActivating,
  };
}

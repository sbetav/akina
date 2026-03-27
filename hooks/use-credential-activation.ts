"use client";

import {
  CREDENTIALS_QUERY_KEY,
  useCredentialActivationContext,
} from "@/contexts/credential-activation-context";
import { api } from "@/lib/elysia/eden";
import { useQuery } from "@tanstack/react-query";

export function useCredentialActivation() {
  const { activate, isPending } = useCredentialActivationContext();

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

  const items = data?.items ?? [];
  const activeItem = items.find((c) => c.isActive);

  return {
    isLoading,
    isPending,
    items,
    activeItem,
    selectedCredential: activeItem?.id ?? "akina-sandbox",
    activate,
  };
}

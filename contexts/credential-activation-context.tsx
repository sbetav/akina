"use client";

import { toast } from "@/components/ui/toast";
import { api } from "@/lib/elysia/eden";
import { CredentialListItem } from "@/lib/elysia/modules/factus";
import {
  CREDENTIAL_DEPENDENT_KEYS,
  CREDENTIALS_QUERY_KEY,
} from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, useContext } from "react";

interface CredentialActivationContextValue {
  activate: (id: string) => void;
  isPending: boolean;
}

const CredentialActivationContext =
  createContext<CredentialActivationContextValue | null>(null);

export function CredentialActivationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.factus.credentials({ id }).activate.patch();
      if (res.error)
        throw new Error(
          (res.error as { value?: { error?: string } }).value?.error ??
            "Error al activar la credencial",
        );
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: CREDENTIALS_QUERY_KEY });

      const previous = queryClient.getQueryData<{
        items: CredentialListItem[];
      }>(CREDENTIALS_QUERY_KEY);

      queryClient.setQueryData<{ items: CredentialListItem[] }>(
        CREDENTIALS_QUERY_KEY,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((item) => ({
              ...item,
              isActive: item.id === id,
            })),
          };
        },
      );

      return { previous };
    },
    onSuccess: () => {
      toast.success("Credencial seleccionada correctamente");
      queryClient.invalidateQueries({ queryKey: CREDENTIALS_QUERY_KEY });

      // Reset all credential-dependent queries: clears cached data
      // (so components enter isLoading for skeleton UI) and triggers
      // an immediate refetch for mounted observers.
      for (const key of CREDENTIAL_DEPENDENT_KEYS) {
        queryClient.resetQueries({ queryKey: [...key] });
      }
    },
    onError: (e: Error, _id, context) => {
      toast.error(e.message);
      if (context?.previous) {
        queryClient.setQueryData(CREDENTIALS_QUERY_KEY, context.previous);
      }
    },
  });

  return (
    <CredentialActivationContext
      value={{ activate: (id) => mutate(id), isPending }}
    >
      {children}
    </CredentialActivationContext>
  );
}

export function useCredentialActivationContext() {
  const ctx = useContext(CredentialActivationContext);
  if (!ctx)
    throw new Error(
      "useCredentialActivationContext must be used within CredentialActivationProvider",
    );
  return ctx;
}

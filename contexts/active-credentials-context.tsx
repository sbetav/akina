"use client";

import { toast } from "@/components/ui/toast";
import { api } from "@/lib/elysia/eden";
import { CredentialListItem } from "@/lib/elysia/modules/factus/service";
import {
  CREDENTIAL_DEPENDENT_KEYS,
  CREDENTIALS_QUERY_KEY,
} from "@/lib/query-keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, useContext } from "react";

interface ActiveCredentialsContextValue {
  activate: (id: string) => void;
  isActivating: boolean;
}

const ActiveCredentialsContext =
  createContext<ActiveCredentialsContextValue | null>(null);

export function ActiveCredentialsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = useQueryClient();

  const { mutate: activate, isPending: isActivating } = useMutation({
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
    <ActiveCredentialsContext
      value={{
        activate,
        isActivating,
      }}
    >
      {children}
    </ActiveCredentialsContext>
  );
}

export function useActiveCredentialsContext() {
  const ctx = useContext(ActiveCredentialsContext);
  if (!ctx)
    throw new Error(
      "useActiveCredentialsContext must be used within ActiveCredentialsProvider",
    );
  return ctx;
}

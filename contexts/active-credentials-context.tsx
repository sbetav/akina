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

      const previousCredentials = queryClient.getQueryData<{
        items: CredentialListItem[];
      }>(CREDENTIALS_QUERY_KEY);

      // Snapshot dependent queries before resetting them
      const previousDependents = CREDENTIAL_DEPENDENT_KEYS.map((key) => ({
        key,
        data: queryClient.getQueryData([...key]),
      }));

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

      return { previousCredentials, previousDependents };
    },
    onSuccess: () => {
      toast.success("Credencial seleccionada correctamente");
      // Safety net: sync any server-side side effects
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

      // Rollback credentials optimistic update
      if (context?.previousCredentials) {
        queryClient.setQueryData(
          CREDENTIALS_QUERY_KEY,
          context.previousCredentials,
        );
      }

      // Rollback dependent queries to their pre-mutation snapshots
      if (context?.previousDependents) {
        for (const { key, data } of context.previousDependents) {
          if (data !== undefined) {
            queryClient.setQueryData([...key], data);
          } else {
            // No snapshot means the query wasn't cached — just invalidate
            // so it refetches fresh rather than sitting in a reset state
            queryClient.invalidateQueries({ queryKey: [...key] });
          }
        }
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

"use client";

import { toast } from "@/components/ui/toast";
import { credentialsListQueryOptions } from "@/hooks/factus/credentials-query-options";
import { api } from "@/lib/elysia/eden";
import { CredentialListItem } from "@/lib/elysia/modules/factus/service";
import {
  CREDENTIAL_DEPENDENT_KEYS,
  CREDENTIALS_QUERY_KEY,
} from "@/lib/query-keys";
import {
  type MutateOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useState } from "react";

type CredentialsQueryData = { items: CredentialListItem[] };

export type ActivateCredentialOptions = MutateOptions<
  CredentialsQueryData,
  Error,
  string,
  unknown
>;

interface ActiveCredentialsContextValue {
  activate: (id: string, options?: ActivateCredentialOptions) => void;
  isActivating: boolean;
  /** Picker UI only — synced from server `active` when it changes; not used as app-wide “active”. */
  uiSelectedCredentialId: string | undefined;
  setUiSelectedCredentialId: (id: string | undefined) => void;
}

const ActiveCredentialsContext =
  createContext<ActiveCredentialsContextValue | null>(null);

/**
 * Clears credential-dependent cache without refetching (until `onSuccess` invalidates).
 * - `resetQueries` is unsuitable: it always refetches active observers afterward.
 * - `setQueryData(..., () => undefined)` does nothing: QueryClient bails out when the
 *   updater result is `undefined`, so it cannot wipe cached data.
 * `query.reset()` restores each query’s initial state (no data, pending, idle) — same
 * outcome you’d want from “set data to undefined”, without relying on internal setState.
 */
function resetCredentialDependentQueriesWithoutRefetch(
  client: ReturnType<typeof useQueryClient>,
) {
  for (const key of CREDENTIAL_DEPENDENT_KEYS) {
    for (const query of client
      .getQueryCache()
      .findAll({ queryKey: [...key] })) {
      query.reset();
    }
  }
}

export function ActiveCredentialsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = useQueryClient();

  const { data: credentialsData } = useQuery(credentialsListQueryOptions);
  const serverActiveId = credentialsData?.items.find((c) => c.isActive)?.id;

  const [uiSelectedCredentialId, setUiSelectedCredentialId] = useState<
    string | undefined
  >(() => serverActiveId);
  const [prevServerActiveId, setPrevServerActiveId] = useState<
    string | undefined
  >(() => serverActiveId);

  if (serverActiveId !== prevServerActiveId) {
    setPrevServerActiveId(serverActiveId);
    if (serverActiveId !== undefined) {
      setUiSelectedCredentialId(serverActiveId);
    }
  }

  const { mutate: mutateActivate, isPending: isActivating } = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.factus.credentials({ id }).activate.patch();
      if (res.error)
        throw new Error(
          (res.error as { value?: { error?: string } }).value?.error ??
            "Error al activar la credencial",
        );
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: CREDENTIALS_QUERY_KEY });
      await Promise.all(
        CREDENTIAL_DEPENDENT_KEYS.map((key) =>
          queryClient.cancelQueries({ queryKey: [...key] }),
        ),
      );
      resetCredentialDependentQueriesWithoutRefetch(queryClient);
    },
    onSuccess: (data) => {
      toast.success("Credencial seleccionada correctamente");
      queryClient.setQueryData<CredentialsQueryData>(
        CREDENTIALS_QUERY_KEY,
        data,
      );

      for (const key of CREDENTIAL_DEPENDENT_KEYS) {
        void queryClient.invalidateQueries({ queryKey: [...key] });
      }
    },
    onError: (e: Error) => {
      toast.error(e.message);
      for (const key of CREDENTIAL_DEPENDENT_KEYS) {
        void queryClient.invalidateQueries({ queryKey: [...key] });
      }
    },
  });

  const activate = (id: string, options?: ActivateCredentialOptions) =>
    mutateActivate(id, options);

  return (
    <ActiveCredentialsContext
      value={{
        activate,
        isActivating,
        uiSelectedCredentialId,
        setUiSelectedCredentialId,
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

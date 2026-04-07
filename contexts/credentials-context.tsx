"use client";

import {
  type MutateOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "@/components/ui/toast";
import { credentialsListQueryOptions } from "@/hooks/factus/credentials-query-options";
import { AKINA_SANDBOX_ID } from "@/lib/constants";
import {
  publishCrossTabSyncEvent,
  subscribeCrossTabSyncEvents,
} from "@/lib/cross-tab-sync";
import { api } from "@/lib/elysia/eden";
import { getApiErrorMessage } from "@/lib/elysia/get-api-error-message";
import type { CredentialListItem } from "@/lib/elysia/modules/factus/service";
import {
  CREDENTIAL_DEPENDENT_KEYS,
  CREDENTIALS_QUERY_KEY,
} from "@/lib/query-keys";

// ─── Types ───────────────────────────────────────────────────────────────────

type CredentialsQueryData = { items: CredentialListItem[] };

export type ActivateCredentialOptions = MutateOptions<
  CredentialsQueryData,
  Error,
  string,
  unknown
>;

interface CredentialsContextValue {
  credentials: CredentialListItem[];
  loadingCredentials: boolean;
  active: CredentialListItem | undefined;
  isAkinaSandbox: boolean;
  activate: (id: string, options?: ActivateCredentialOptions) => void;
  isActivating: boolean;
  selectedCredentialId: string | undefined;
  setSelectedCredentialId: (id: string | undefined) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const CredentialsContext = createContext<CredentialsContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────

type QueryClient = ReturnType<typeof useQueryClient>;

/**
 * Resets credential-dependent queries to initial state (pending, no data)
 * without triggering a refetch.
 */
function clearCredentialDependentQueries(client: QueryClient) {
  for (const key of CREDENTIAL_DEPENDENT_KEYS) {
    for (const query of client
      .getQueryCache()
      .findAll({ queryKey: [...key] })) {
      query.reset();
    }
  }
}

async function cancelCredentialQueries(client: QueryClient) {
  await client.cancelQueries({ queryKey: CREDENTIALS_QUERY_KEY });
  await Promise.all(
    CREDENTIAL_DEPENDENT_KEYS.map((key) =>
      client.cancelQueries({ queryKey: [...key] }),
    ),
  );
}

function invalidateCredentialQueries(client: QueryClient) {
  void client.invalidateQueries({ queryKey: CREDENTIALS_QUERY_KEY });
  for (const key of CREDENTIAL_DEPENDENT_KEYS) {
    void client.invalidateQueries({ queryKey: [...key] });
  }
}

function applyOptimisticCredentialChange(
  client: QueryClient,
  credentialId: string,
) {
  client.setQueryData<CredentialsQueryData>(CREDENTIALS_QUERY_KEY, (old) => {
    if (!old) return old;
    return {
      ...old,
      items: old.items.map((item) => ({
        ...item,
        isActive: item.id === credentialId,
      })),
    };
  });
  clearCredentialDependentQueries(client);
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function CredentialsContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const queryClient = useQueryClient();

  const { data, isLoading: loadingCredentials } = useQuery(
    credentialsListQueryOptions,
  );

  const credentials = data?.items ?? [];
  const active = credentials.find((item) => item.isActive);
  const isAkinaSandbox = active?.id === AKINA_SANDBOX_ID;

  const [selectedCredentialId, setSelectedCredentialId] = useState<
    string | undefined
  >(active?.id);

  // ── Cross-tab sync ──────────────────────────────────────────────────────────

  useEffect(() => {
    return subscribeCrossTabSyncEvents((event) => {
      // Another tab picked a credential but hasn't confirmed yet — mirror optimistically
      if (event.type === "credential:selected") {
        setSelectedCredentialId(event.credentialId);
        clearCredentialDependentQueries(queryClient);
        return;
      }

      // Another tab confirmed activation — apply full sync
      if (event.type === "credential:activated") {
        setSelectedCredentialId(event.credentialId);
        applyOptimisticCredentialChange(queryClient, event.credentialId);

        void cancelCredentialQueries(queryClient)
          .then(() => invalidateCredentialQueries(queryClient))
          .catch((e) =>
            console.error("[cross-tab-sync] credential:activated error", e),
          );
      }
    });
  }, [queryClient]);

  // ── Mutation ────────────────────────────────────────────────────────────────

  const { mutate: activate, isPending } = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.factus.credentials({ id }).activate.patch();
      if (res.error) {
        throw new Error(
          getApiErrorMessage(res.error, "Error al activar la credencial"),
        );
      }
      return res.data;
    },
    onMutate: async (id) => {
      setSelectedCredentialId(id);

      // Notify other tabs immediately, before the await
      publishCrossTabSyncEvent({
        type: "credential:selected",
        credentialId: id,
        at: Date.now(),
      });

      await cancelCredentialQueries(queryClient);
      clearCredentialDependentQueries(queryClient);
    },
    onSuccess: (data) => {
      toast.success("Credencial seleccionada correctamente");

      queryClient.setQueryData<CredentialsQueryData>(
        CREDENTIALS_QUERY_KEY,
        data,
      );

      const nextActiveId = data.items.find((i) => i.isActive)?.id;
      if (nextActiveId) {
        setSelectedCredentialId(nextActiveId);
        publishCrossTabSyncEvent({
          type: "credential:activated",
          credentialId: nextActiveId,
          at: Date.now(),
        });
      }

      invalidateCredentialQueries(queryClient);
    },
    onError: (error) => {
      toast.error(error.message);
      setSelectedCredentialId(active?.id);
      invalidateCredentialQueries(queryClient);
    },
  });

  const isActivatingCrossTab =
    selectedCredentialId !== undefined && selectedCredentialId !== active?.id;

  const isActivating = isActivatingCrossTab || isPending;

  return (
    <CredentialsContext
      value={{
        activate,
        isActivating,
        credentials,
        active,
        loadingCredentials,
        isAkinaSandbox,
        selectedCredentialId,
        setSelectedCredentialId,
      }}
    >
      {children}
    </CredentialsContext>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCredentialsContext() {
  const ctx = useContext(CredentialsContext);
  if (!ctx) {
    throw new Error(
      "useCredentialsContext must be used within CredentialsContextProvider",
    );
  }
  return ctx;
}

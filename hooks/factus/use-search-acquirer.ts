import { useQuery } from "@tanstack/react-query";
import type { Acquirer, IdentityDocumentTypeId } from "factus-js";
import { api } from "@/elysia/eden";
import { ACQUIRER_QUERY_KEY } from "@/lib/query-keys";

interface UseAcquirerAutofillProps {
  /** Accepts any identification document type id string (customers or support documents). */
  identificationDocumentId: string | undefined;
  identification: string;
  onSuccess?: (data: Acquirer) => void;
  enabled?: boolean;
}

export function useSearchAcquirer({
  identificationDocumentId,
  identification,
  onSuccess,
  enabled = true,
}: UseAcquirerAutofillProps) {
  const { isFetching } = useQuery({
    queryKey: [...ACQUIRER_QUERY_KEY, identificationDocumentId, identification],
    queryFn: async ({ signal }) => {
      if (!identificationDocumentId) return;
      const res = await api.factus.acquirer.get({
        query: {
          identificationDocumentId:
            identificationDocumentId as IdentityDocumentTypeId,
          identificationNumber: identification,
        },
        fetch: {
          signal,
        },
      });
      if (res.error) throw new Error("Adquiriente no encontrado");
      onSuccess?.(res.data);
      return res.data;
    },
    retry: false,
    staleTime: 0,
    enabled: enabled && !!identificationDocumentId && !!identification,
    refetchOnWindowFocus: false,
  });

  return { isPending: isFetching };
}

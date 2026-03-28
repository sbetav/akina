import { toast } from "@/components/ui/toast";
import { api } from "@/lib/elysia/eden";
import { ACQUIRER_QUERY_KEY } from "@/lib/query-keys";
import { CustomerFormValues } from "@/lib/validations/customer";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { UseFormSetValue } from "react-hook-form";

interface UseAcquirerAutofillProps {
  identificationDocumentId: string;
  identification: string;
  setValue: UseFormSetValue<CustomerFormValues>;
}

export function useAcquirerAutofill({
  identificationDocumentId,
  identification,
  setValue,
}: UseAcquirerAutofillProps) {
  const enabled = !!identificationDocumentId && identification.length >= 5;
  const appliedRef = useRef<string | null>(null);

  const { isFetching, data } = useQuery({
    queryKey: [...ACQUIRER_QUERY_KEY, identificationDocumentId, identification],
    queryFn: async () => {
      const res = await api.factus.acquirer.get({
        query: {
          identificationDocumentId,
          identificationNumber: identification,
        },
      });
      if (res.error) throw new Error("Adquiriente no encontrado");
      return res.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes — DIAN registry rarely changes
    retry: false,
  });

  // Autofill form fields when new data arrives — runs once per unique result
  useEffect(() => {
    if (!data) return;

    const key = `${data.email}:${data.name}`;
    if (appliedRef.current === key) return;

    appliedRef.current = key;
    setValue("email", data.email);
    setValue("name", data.name);
    toast.success("Correo electrónico y nombre autocompletados");
  }, [data, setValue]);

  return { isPending: isFetching, data };
}

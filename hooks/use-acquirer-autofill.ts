import { toast } from "@/components/ui/toast";
import { api } from "@/lib/elysia/eden";
import { CustomerFormValues } from "@/lib/validations/customer";
import { useQuery } from "@tanstack/react-query";
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

  const { isFetching, data } = useQuery({
    queryKey: ["factus", "acquirer", identificationDocumentId, identification],
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
    // Autofill form fields on successful fetch
    select: (data) => {
      if (data) {
        setValue("email", data.email);
        setValue("name", data.name);
        toast.success("Correo electrónico y nombre autocompletados");
      }
      return data;
    },
  });

  return { isPending: isFetching, data };
}

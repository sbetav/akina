import { getAcquirerAction } from "@/app/dashboard/customers/actions";
import { toast } from "@/components/ui/toast";
import { CustomerFormValues } from "@/lib/validations/customer";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
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
  const { execute, result, isPending } = useAction(getAcquirerAction, {
    onSuccess: ({ data }) => {
      setValue("email", data.email);
      setValue("name", data.name);
      toast.success("Correo electrónico y nombre autocompletados");
    },
    onError: ({ error }) => {
      console.log("Something went wrong:", error);
    },
  });

  useEffect(() => {
    if (
      !identificationDocumentId ||
      !identification ||
      identification.length < 5
    )
      return;

    const timer = setTimeout(async () => {
      execute({
        identificationDocumentId,
        identification,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [identificationDocumentId, identification, setValue]);

  return { isPending, result };
}

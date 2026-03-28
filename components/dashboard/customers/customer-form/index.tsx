"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAcquirerAutofill } from "@/hooks/use-acquirer-autofill";
import { useGoBack } from "@/hooks/use-go-back";
import { api } from "@/lib/elysia/eden";
import { CUSTOMERS_QUERY_KEY } from "@/lib/query-keys";
import {
  CustomerFormValues,
  customerFormSchema,
} from "@/lib/validations/customer";
import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Municipality } from "factus-js";
import { SaveIcon } from "lucide-react";
import { FC, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import DashboardCard from "../../dashboard-card";
import { ContactFieldSet } from "./contact-fieldset";
import { IdentificationFieldSet } from "./identification-fieldset";
import { OrganizationFieldSet } from "./organization-fieldset";

interface CustomerFormProps {
  municipalities: Municipality[];
}

const CustomerForm: FC<CustomerFormProps> = ({ municipalities }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { goBack } = useGoBack({ fallbackHref: "/dashboard/customers" });

  const { handleSubmit, control, resetField, setValue } =
    useForm<CustomerFormValues>({
      resolver: zodResolver(customerFormSchema),
      defaultValues: {
        identificationDocumentId: "",
        identification: "",
        dv: "",
        legalOrganizationId: "2",
        tributeId: "",
        name: "",
        tradeName: "",
        email: "",
        phone: "",
        municipalityId: "",
        address: "",
      },
    });

  const [identificationDocumentId, identification, legalOrganizationId] =
    useWatch({
      control,
      name: [
        "identificationDocumentId",
        "identification",
        "legalOrganizationId",
      ],
    });

  const isNIT = identificationDocumentId === "6";
  const isNaturalPerson = legalOrganizationId === "2";

  const { isPending: isSearchingAcquirer } = useAcquirerAutofill({
    identificationDocumentId,
    identification,
    setValue,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      const res = await api.customers.post(values);
      if (res.error)
        throw new Error(
          (res.error as { value?: { error?: string } }).value?.error ??
            "Error al crear el cliente",
        );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Cliente creado exitosamente");
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
      router.replace("/dashboard/customers");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  useEffect(() => {
    if (!isNIT) resetField("dv", { defaultValue: "" });
  }, [isNIT, resetField]);

  return (
    <DashboardCard className="flex flex-1">
      <form
        onSubmit={handleSubmit((data) => mutate(data))}
        className="flex w-full flex-col gap-8"
      >
        <div className="flex flex-1 flex-col gap-8">
          <IdentificationFieldSet
            control={control}
            isNIT={isNIT}
            isSearchingAcquirer={isSearchingAcquirer}
          />

          <OrganizationFieldSet
            control={control}
            isNaturalPerson={isNaturalPerson}
          />

          <ContactFieldSet control={control} municipalities={municipalities} />
        </div>

        <div className="flex w-full flex-col-reverse items-center justify-end gap-3 md:flex-row">
          <Button
            size="lg"
            type="button"
            variant="outline"
            className="w-full md:w-auto"
            onClick={goBack}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            size="lg"
            type="submit"
            className="w-full md:w-auto"
            disabled={isPending}
          >
            {isPending ? <Spinner /> : <SaveIcon />}
            Guardar
          </Button>
        </div>
      </form>
    </DashboardCard>
  );
};

export default CustomerForm;

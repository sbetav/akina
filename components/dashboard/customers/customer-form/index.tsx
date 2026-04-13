"use client";

import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IdentityDocumentTypeId } from "factus-js";
import { SaveIcon } from "lucide-react";
import { type FC, useState } from "react";
import {
  type FieldValues,
  FormProvider,
  useForm,
  useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import type { CustomerDetailResult } from "@/elysia/modules/customers";
import { useSearchAcquirer } from "@/hooks/factus/use-search-acquirer";
import useDebounce from "@/hooks/ui/use-debounce";
import { useGoBack } from "@/hooks/ui/use-go-back";
import { CUSTOMERS_QUERY_KEY } from "@/lib/query-keys";
import {
  type CustomerFormValues,
  customerFormSchema,
} from "@/lib/validations/customer";
import DashboardCard from "../../dashboard-card";
import { ContactFieldSet } from "./contact-fieldset";
import { type CustomerFieldNames, customerFormFieldNames } from "./field-names";
import { IdentificationFieldSet } from "./identification-fieldset";
import { OrganizationFieldSet } from "./organization-fieldset";

interface CustomerFormProps {
  selectedCustomer?: CustomerDetailResult;
}

const CustomerForm: FC<CustomerFormProps> = ({ selectedCustomer }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { goBack } = useGoBack({ fallbackHref: "/dashboard/customers" });

  const methods = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      identificationDocumentId:
        selectedCustomer?.identificationDocumentId ??
        IdentityDocumentTypeId.CitizenshipId,
      identification: selectedCustomer?.identification ?? "",
      dv: selectedCustomer?.dv ?? "",
      legalOrganizationId: selectedCustomer?.legalOrganizationId ?? "2",
      tributeId: selectedCustomer?.tributeId ?? "18",
      name: selectedCustomer?.name ?? "",
      tradeName: selectedCustomer?.tradeName ?? "",
      email: selectedCustomer?.email ?? "",
      phone: selectedCustomer?.phone ?? "",
      municipalityId: selectedCustomer?.municipalityId ?? "",
      address: selectedCustomer?.address ?? "",
    } as CustomerFormValues,
  });

  const { handleSubmit, control, setValue } = methods;

  const [identificationDocumentId, identification] = useWatch({
    control,
    name: ["identificationDocumentId", "identification"],
  });

  const [redirecting, setRedirecting] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      // Update
      if (selectedCustomer) {
        const res = await api
          .customers({ id: selectedCustomer.id })
          .put(values);
        if (res.error)
          throw new Error(
            getApiErrorMessage(res.error, "Error al actualizar el cliente"),
          );
        return res.data;
      }
      // Create
      const res = await api.customers.post(values);
      if (res.error)
        throw new Error(
          getApiErrorMessage(res.error, "Error al crear el cliente"),
        );
      return res.data;
    },
    onSuccess: () => {
      setRedirecting(true);
      toast.success(
        `Cliente ${selectedCustomer ? "actualizado" : "creado"} exitosamente`,
      );
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
      router.replace("/dashboard/customers");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  /* Autofill acquirer when identification changes */
  const debouncedIdentification = useDebounce(identification, 500);
  const { isPending: isSearchingAcquirer } = useSearchAcquirer({
    identificationDocumentId,
    identification: debouncedIdentification,
    onSuccess: (data) => {
      setValue("email", data.email);
      setValue("name", data.name);
      toast.success("Nombre y correo electrónico autocompletados");
    },
    enabled:
      identificationDocumentId !== selectedCustomer?.identificationDocumentId ||
      identification !== selectedCustomer?.identification,
  });

  return (
    <DashboardCard className="flex flex-1">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit((data) => mutate(data))}
          className="@container/customer-form flex w-full flex-col gap-8"
        >
          <CustomerFormFieldsets
            names={customerFormFieldNames}
            isSearchingAcquirer={isSearchingAcquirer}
          />

          <div className="flex w-full flex-col-reverse items-center justify-end gap-3 @md/customer-form:flex-row">
            <Button
              size="lg"
              type="button"
              variant="outline"
              className="w-full @md/customer-form:w-auto"
              onClick={goBack}
              disabled={isPending || redirecting}
            >
              Cancelar
            </Button>
            <Button
              size="lg"
              type="submit"
              className="w-full @md/customer-form:w-auto"
              disabled={isPending || redirecting}
            >
              {isPending ? <Spinner /> : <SaveIcon />}
              Guardar
            </Button>
          </div>
        </form>
      </FormProvider>
    </DashboardCard>
  );
};

interface CustomerFormFieldsetsProps<T extends FieldValues> {
  names: CustomerFieldNames<T>;
  isSearchingAcquirer?: boolean;
}

export const CustomerFormFieldsets = <T extends FieldValues>({
  names,
  isSearchingAcquirer = false,
}: CustomerFormFieldsetsProps<T>) => {
  return (
    <div className="@container/customer-form flex flex-1 flex-col gap-8">
      <IdentificationFieldSet<T>
        names={names}
        isSearchingAcquirer={isSearchingAcquirer}
      />
      <OrganizationFieldSet<T> names={names} />
      <ContactFieldSet<T> names={names} />
    </div>
  );
};

export default CustomerForm;

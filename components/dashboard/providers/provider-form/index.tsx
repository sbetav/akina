"use client";

import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SupportDocumentIdentityTypeId } from "factus-js";
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
import type { ProviderDetailResult } from "@/elysia/modules/providers";
import { useSearchAcquirer } from "@/hooks/factus/use-search-acquirer";
import useDebounce from "@/hooks/ui/use-debounce";
import { useGoBack } from "@/hooks/ui/use-go-back";
import { PROVIDERS_QUERY_KEY } from "@/lib/query-keys";
import {
  type ProviderFormValues,
  providerFormSchema,
} from "@/lib/validations/provider";
import DashboardCard from "../../dashboard-card";
import { ProviderDetailsFieldset } from "./details-fieldset";
import { type ProviderFieldNames, providerFormFieldNames } from "./field-names";
import { ProviderIdentificationFieldset } from "./identification-fieldset";

interface ProviderFormProps {
  selectedProvider?: ProviderDetailResult;
}

const ProviderForm: FC<ProviderFormProps> = ({ selectedProvider }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { goBack } = useGoBack({ fallbackHref: "/dashboard/providers" });

  const methods = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      identificationDocumentId:
        selectedProvider?.identificationDocumentId ??
        SupportDocumentIdentityTypeId.NIT,
      identification: selectedProvider?.identification ?? "",
      dv: selectedProvider?.dv ?? "",
      names: selectedProvider?.names ?? "",
      tradeName: selectedProvider?.tradeName ?? "",
      countryCode: selectedProvider?.countryCode ?? "CO",
      isResident: selectedProvider?.isResident === 0 ? 0 : 1,
      email: selectedProvider?.email ?? "",
      phone: selectedProvider?.phone ?? "",
      municipalityId: selectedProvider?.municipalityId ?? "",
      address: selectedProvider?.address ?? "",
    } as ProviderFormValues,
  });

  const { handleSubmit, control, setValue } = methods;

  const [identificationDocumentId, identification] = useWatch({
    control,
    name: ["identificationDocumentId", "identification"],
  });

  const [redirecting, setRedirecting] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: ProviderFormValues) => {
      // Update
      if (selectedProvider) {
        const res = await api
          .providers({ id: selectedProvider.id })
          .put(values);
        if (res.error)
          throw new Error(
            getApiErrorMessage(res.error, "Error al actualizar el proveedor"),
          );
        return res.data;
      }
      // Create
      const res = await api.providers.post(values);
      if (res.error)
        throw new Error(
          getApiErrorMessage(res.error, "Error al crear el proveedor"),
        );
      return res.data;
    },
    onSuccess: () => {
      setRedirecting(true);
      toast.success(
        `Proveedor ${selectedProvider ? "actualizado" : "creado"} exitosamente`,
      );
      queryClient.invalidateQueries({ queryKey: PROVIDERS_QUERY_KEY });
      router.replace("/dashboard/providers");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  /* Autofill names + email when identification changes */
  const debouncedIdentification = useDebounce(identification, 500);
  const { isPending: isSearchingAcquirer } = useSearchAcquirer({
    identificationDocumentId,
    identification: debouncedIdentification,
    onSuccess: (data) => {
      setValue("names", data.name);
      setValue("email", data.email);
      toast.success("Nombre y correo electrónico autocompletados");
    },
    enabled:
      identificationDocumentId !== selectedProvider?.identificationDocumentId ||
      identification !== selectedProvider?.identification,
  });

  return (
    <DashboardCard className="flex flex-1">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit((data) => mutate(data))}
          className="@container/provider-form flex w-full flex-col gap-8"
        >
          <ProviderFormFieldsets
            names={providerFormFieldNames}
            isSearchingAcquirer={isSearchingAcquirer}
          />

          <div className="flex w-full flex-col-reverse items-center justify-end gap-3 @md/provider-form:flex-row">
            <Button
              size="lg"
              type="button"
              variant="outline"
              className="w-full @md/provider-form:w-auto"
              onClick={goBack}
              disabled={isPending || redirecting}
            >
              Cancelar
            </Button>
            <Button
              size="lg"
              type="submit"
              className="w-full @md/provider-form:w-auto"
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

interface ProviderFormFieldsetsProps<T extends FieldValues> {
  names: ProviderFieldNames<T>;
  isSearchingAcquirer?: boolean;
}

export const ProviderFormFieldsets = <T extends FieldValues>({
  names,
  isSearchingAcquirer = false,
}: ProviderFormFieldsetsProps<T>) => {
  return (
    <div className="@container/provider-form flex flex-1 flex-col gap-8">
      <ProviderIdentificationFieldset<T>
        names={names}
        isSearchingAcquirer={isSearchingAcquirer}
      />
      <ProviderDetailsFieldset<T> names={names} />
    </div>
  );
};

export default ProviderForm;

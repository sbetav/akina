"use client";

import type { FC } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { ProviderFormFieldsets } from "@/components/dashboard/providers/provider-form";
import type { ProviderFieldNames } from "@/components/dashboard/providers/provider-form/field-names";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import type { ProviderDetailResult } from "@/elysia/modules/providers";
import { useSearchAcquirer } from "@/hooks/factus/use-search-acquirer";
import useDebounce from "@/hooks/ui/use-debounce";
import type { SupportDocumentFormValues } from "@/lib/validations/support-document";
import ProviderSearch from "./provider-search";

const SUPPORT_DOC_PROVIDER_FIELD_NAMES: ProviderFieldNames<SupportDocumentFormValues> =
  {
    identification: "provider.identification",
    dv: "provider.dv",
    identificationDocumentId: "provider.identificationDocumentId",
    names: "provider.names",
    tradeName: "provider.tradeName",
    countryCode: "provider.countryCode",
    isResident: "provider.isResident",
    email: "provider.email",
    phone: "provider.phone",
    municipalityId: "provider.municipalityId",
    address: "provider.address",
  };

export interface ProviderStepProps {
  selectedProvider?: ProviderDetailResult | null;
  onSelectedProviderChange?: (provider: ProviderDetailResult | null) => void;
}

const ProviderStep: FC<ProviderStepProps> = ({
  selectedProvider,
  onSelectedProviderChange,
}) => {
  const { control, setValue } = useFormContext<SupportDocumentFormValues>();

  const [identificationDocumentId, identification] = useWatch({
    control,
    name: ["provider.identificationDocumentId", "provider.identification"],
  });

  const debouncedIdentification = useDebounce(identification, 500);

  const { isPending: isSearchingAcquirer } = useSearchAcquirer({
    identificationDocumentId,
    identification: debouncedIdentification,
    onSuccess: (data) => {
      setValue("provider.names", data.name);
      setValue("provider.email", data.email);
      toast.success("Nombre y correo electrónico autocompletados");
    },
    enabled:
      identificationDocumentId !== selectedProvider?.identificationDocumentId ||
      identification !== selectedProvider?.identification,
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Detalles del proveedor</PageHeaderTitle>
          <PageHeaderDescription>
            Selecciona un proveedor o ingresa los datos manualmente
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <ProviderSearch
        selectedProvider={selectedProvider ?? null}
        onSelectedProviderChange={onSelectedProviderChange}
      />

      <Separator className="mt-2.5 mb-2" />

      <ProviderFormFieldsets
        names={SUPPORT_DOC_PROVIDER_FIELD_NAMES}
        isSearchingAcquirer={isSearchingAcquirer}
      />
    </div>
  );
};

export default ProviderStep;

"use client";

import {
  SupportDocumentIdentityTypeId,
  SupportDocumentIdentityTypeIdInfo,
} from "factus-js";
import { SearchIcon } from "lucide-react";
import { type FC, useCallback, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import type { ProviderDetailResult } from "@/elysia/modules/providers";
import { useProviders } from "@/hooks/api/use-providers";
import type { SupportDocumentFormValues } from "@/lib/validations/support-document";

interface ProviderSearchProps {
  selectedProvider: ProviderDetailResult | null;
  onSelectedProviderChange?: (provider: ProviderDetailResult | null) => void;
}

const EMPTY_PROVIDER_VALUES: SupportDocumentFormValues["provider"] = {
  identification: "",
  dv: "",
  identificationDocumentId: "6",
  names: "",
  tradeName: "",
  countryCode: "CO",
  isResident: 1,
  address: "",
  email: "",
  phone: "",
  municipalityId: "",
};

function toFormProviderValues(
  provider: ProviderDetailResult,
): SupportDocumentFormValues["provider"] {
  return {
    identification: provider.identification ?? "",
    dv: provider.dv ?? "",
    identificationDocumentId:
      provider.identificationDocumentId as SupportDocumentFormValues["provider"]["identificationDocumentId"],
    names: provider.names ?? "",
    tradeName: provider.tradeName ?? "",
    countryCode: provider.countryCode ?? "CO",
    isResident: (provider.isResident === 0 ? 0 : 1) as 0 | 1,
    address: provider.address ?? "",
    email: provider.email ?? "",
    phone: provider.phone ?? "",
    municipalityId: provider.municipalityId ?? "",
  };
}

const ProviderSearch: FC<ProviderSearchProps> = ({
  selectedProvider,
  onSelectedProviderChange,
}) => {
  const { setValue } = useFormContext<SupportDocumentFormValues>();

  const [search, setSearch] = useState(() => {
    if (!selectedProvider) return "";
    const idInfo =
      SupportDocumentIdentityTypeIdInfo[
        selectedProvider.identificationDocumentId as SupportDocumentIdentityTypeId
      ];
    return `${selectedProvider.names}, ${idInfo?.abbreviation ?? ""} ${selectedProvider.identification}`;
  });

  const { data, isFetching } = useProviders({ search, paginated: true });

  const selectedProviderItem = useMemo(() => {
    if (!selectedProvider) return null;
    const items = data?.items ?? [];
    return (
      items.find((item) => item.id === selectedProvider.id) ?? selectedProvider
    );
  }, [data?.items, selectedProvider]);

  const clearProviderValues = useCallback(() => {
    setValue("provider", EMPTY_PROVIDER_VALUES, { shouldValidate: false });
    onSelectedProviderChange?.(null);
  }, [onSelectedProviderChange, setValue]);

  const populateFromDetail = useCallback(
    (provider: ProviderDetailResult) => {
      setValue("provider", toFormProviderValues(provider), {
        shouldValidate: true,
      });
      onSelectedProviderChange?.(provider);
    },
    [onSelectedProviderChange, setValue],
  );

  const formatProviderId = (provider: ProviderDetailResult) => {
    const idInfo =
      SupportDocumentIdentityTypeIdInfo[
        provider.identificationDocumentId as SupportDocumentIdentityTypeId
      ];
    return `${idInfo?.abbreviation ?? ""} ${provider.identification}`;
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Combobox
        filter={null}
        items={data?.items ?? []}
        itemToStringLabel={(provider: ProviderDetailResult) =>
          `${provider.names}, ${formatProviderId(provider)}`
        }
        itemToStringValue={(provider: ProviderDetailResult) =>
          String(provider.id)
        }
        value={selectedProviderItem}
        onValueChange={(item) => {
          const provider = item ?? null;

          if (!provider?.id) {
            clearProviderValues();
            return;
          }

          populateFromDetail(provider);
        }}
        inputValue={search}
        onInputValueChange={(value) => setSearch(value)}
      >
        <ComboboxInput
          placeholder="Buscar por nombre o número de documento"
          showPending={isFetching}
          onChange={(e) => setSearch(e.target.value)}
        >
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </ComboboxInput>

        <ComboboxContent>
          <ComboboxEmpty>No se encontraron resultados.</ComboboxEmpty>
          <ComboboxList>
            {(provider: ProviderDetailResult) => (
              <ComboboxItem key={provider.id} value={provider}>
                <Item size="xs" className="p-0">
                  <ItemContent>
                    <ItemTitle className="whitespace-nowrap">
                      {provider.names}
                    </ItemTitle>
                    <ItemDescription>
                      {formatProviderId(provider)}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
};

export default ProviderSearch;

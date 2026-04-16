"use client";

import {
  SupportDocumentIdentityTypeId,
  SupportDocumentIdentityTypeIdInfo,
} from "factus-js";
import { GlobeIcon, HashIcon, ScrollTextIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Controller,
  type FieldPathValue,
  type FieldValues,
  useFormContext,
  useWatch,
} from "react-hook-form";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
} from "@/components/ui/combobox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectAddon,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useCountries } from "@/hooks/factus/use-countries";
import { calculateDV } from "@/lib/utils";
import type { ProviderFieldNames } from "./field-names";
import {
  type CountryVirtualizer,
  VirtualizedCountryList,
} from "./virtualized-country-list";

const supportDocumentIdentityTypes = Object.values(
  SupportDocumentIdentityTypeId,
);

interface ProviderIdentificationFieldsetProps {
  isSearchingAcquirer?: boolean;
}

export function ProviderIdentificationFieldset<T extends FieldValues>({
  names,
  isSearchingAcquirer = false,
}: ProviderIdentificationFieldsetProps & { names: ProviderFieldNames<T> }) {
  const { control, setValue, resetField, trigger } = useFormContext<T>();
  const virtualizerRef = useRef<CountryVirtualizer | null>(null);

  const identification = useWatch({ control, name: names.identification });
  const documentTypeId = useWatch({
    control,
    name: names.identificationDocumentId,
  });
  const countryCode = useWatch({ control, name: names.countryCode });
  const dv = useWatch({ control, name: names.dv });

  const isNIT = documentTypeId === SupportDocumentIdentityTypeId.NIT;

  const { data: countries = [], isPending: isLoadingCountries } =
    useCountries();

  // Auto-calculate DV when identification changes and type is NIT
  useEffect(() => {
    if (!isNIT) {
      resetField(names.dv, {
        defaultValue: "" as FieldPathValue<T, typeof names.dv>,
      });
      return;
    }
    setValue(
      names.dv,
      calculateDV(String(identification ?? "")) as FieldPathValue<
        T,
        typeof names.dv
      >,
    );
    if (identification?.length > 0 && dv?.length > 0) {
      trigger(names.dv);
    }
  }, [
    identification,
    documentTypeId,
    isNIT,
    names.dv,
    resetField,
    setValue,
    trigger,
  ]);

  // Auto-derive isResident from countryCode
  useEffect(() => {
    const resident = countryCode === "CO" ? 1 : 0;
    setValue(
      names.isResident,
      resident as FieldPathValue<T, typeof names.isResident>,
    );
  }, [countryCode, names.isResident, setValue]);

  return (
    <FieldSet>
      <FieldLegend>Identificación</FieldLegend>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-5 @xl/field-group:grid-cols-2">
          <Controller
            control={control}
            name={names.identificationDocumentId}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Tipo de documento</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <SelectAddon>
                      <ScrollTextIcon />
                    </SelectAddon>
                    <SelectValue>
                      {(value: string) => {
                        const match = supportDocumentIdentityTypes.find(
                          (doc) => doc === value,
                        );
                        return (
                          (match
                            ? SupportDocumentIdentityTypeIdInfo[match]
                                ?.description
                            : value) || "Selecciona una opción"
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {supportDocumentIdentityTypes.map((doc) => (
                      <SelectItem key={doc} value={doc}>
                        {SupportDocumentIdentityTypeIdInfo[doc].description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <div className="flex flex-col gap-3 @2xl/field-group:flex-row">
            <Controller
              control={control}
              name={names.identification}
              render={({ field, fieldState }) => (
                <Field className="w-full flex-1">
                  <FieldLabel htmlFor={field.name}>
                    Número de identificación
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <HashIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                      id={field.name}
                      placeholder="1234567890"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {isSearchingAcquirer && (
                      <InputGroupAddon align="inline-end">
                        <Spinner />
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {isNIT && (
              <Controller
                control={control}
                name={names.dv}
                render={({ field, fieldState }) => (
                  <Field className="w-full @2xl/field-group:max-w-32">
                    <FieldLabel htmlFor={field.name}>DV</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id={field.name}
                        placeholder="0"
                        maxLength={1}
                        aria-invalid={fieldState.invalid}
                        {...field}
                      />
                    </InputGroup>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            )}
          </div>

          <Controller
            control={control}
            name={names.countryCode}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>País</FieldLabel>
                <Combobox
                  id={field.name}
                  virtualized
                  items={countries}
                  itemToStringLabel={(c) => c.name}
                  itemToStringValue={(c) => c.code}
                  onItemHighlighted={(item, { reason, index }) => {
                    const virtualizer = virtualizerRef.current;
                    if (!item || !virtualizer) return;

                    const isStart = index === 0;
                    const isEnd = index === virtualizer.options.count - 1;
                    const shouldScroll =
                      reason === "none" ||
                      (reason === "keyboard" && (isStart || isEnd));

                    if (shouldScroll) {
                      queueMicrotask(() => {
                        virtualizer.scrollToIndex(index, {
                          align: isEnd ? "start" : "end",
                        });
                      });
                    }
                  }}
                  value={
                    field.value
                      ? (countries.find((c) => c.code === field.value) ?? null)
                      : null
                  }
                  onValueChange={(item) =>
                    field.onChange(item ? item.code : "")
                  }
                >
                  <ComboboxInput
                    placeholder="Buscar país"
                    aria-invalid={fieldState.invalid}
                    showPending={isLoadingCountries}
                  >
                    <InputGroupAddon>
                      <GlobeIcon />
                    </InputGroupAddon>
                  </ComboboxInput>
                  <ComboboxContent>
                    <ComboboxEmpty>
                      {isLoadingCountries
                        ? "Cargando países..."
                        : "No se encontraron resultados."}
                    </ComboboxEmpty>
                    <VirtualizedCountryList virtualizerRef={virtualizerRef} />
                  </ComboboxContent>
                </Combobox>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>
      </FieldGroup>
    </FieldSet>
  );
}

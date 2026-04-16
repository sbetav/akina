"use client";

import { IdentityDocumentTypeId, IdentityDocumentTypeIdInfo } from "factus-js";
import { HashIcon, ScrollTextIcon } from "lucide-react";
import { useEffect } from "react";
import {
  Controller,
  type FieldPathValue,
  type FieldValues,
  useFormContext,
  useWatch,
} from "react-hook-form";
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
import { calculateDV } from "@/lib/utils";
import type { CustomerFieldNames } from "./field-names";

const identityDocumentTypes = Object.values(IdentityDocumentTypeId);

interface IdentificationFieldSetProps {
  isSearchingAcquirer: boolean;
}

export function IdentificationFieldSet<T extends FieldValues>({
  isSearchingAcquirer,
  names,
}: IdentificationFieldSetProps & { names: CustomerFieldNames<T> }) {
  const { control, setValue, resetField, trigger } = useFormContext<T>();

  const identification = useWatch({ control, name: names.identification });
  const documentTypeId = useWatch({
    control,
    name: names.identificationDocumentId,
  });
  const dv = useWatch({ control, name: names.dv });

  const isNIT = documentTypeId === IdentityDocumentTypeId.NIT;

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
                        const match = identityDocumentTypes.find(
                          (document) => document === value,
                        );
                        return (
                          (match
                            ? IdentityDocumentTypeIdInfo[match]?.description
                            : value) || "Selecciona una opción"
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {identityDocumentTypes.map((doc) => (
                      <SelectItem key={doc} value={doc}>
                        {IdentityDocumentTypeIdInfo[doc].description}
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
        </div>
      </FieldGroup>
    </FieldSet>
  );
}

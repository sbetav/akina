"use client";

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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  FACTUS_IDENTITY_DOCUMENT_TYPES,
  FACTUS_IDENTITY_DOCUMENT_TYPES_BY_ID,
} from "@/lib/factus/constants";
import { CustomerFormValues } from "@/lib/validations/customer";
import { HashIcon } from "lucide-react";
import { Control, Controller } from "react-hook-form";

interface IdentificationFieldSetProps {
  control: Control<CustomerFormValues>;
  isNIT: boolean;
  isSearchingAcquirer: boolean;
}

export function IdentificationFieldSet({
  control,
  isNIT,
  isSearchingAcquirer,
}: IdentificationFieldSetProps) {
  return (
    <FieldSet>
      <FieldLegend>Identificación</FieldLegend>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Controller
            control={control}
            name="identification_document_id"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Tipo de documento</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSearchingAcquirer}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <SelectValue>
                      {(value: string) =>
                        (FACTUS_IDENTITY_DOCUMENT_TYPES_BY_ID[value] ??
                          value) ||
                        "Selecciona una opción"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {FACTUS_IDENTITY_DOCUMENT_TYPES.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <div className="flex flex-col gap-3 xl:flex-row">
            <Controller
              control={control}
              name="identification"
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
                      disabled={isSearchingAcquirer}
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
                name="dv"
                render={({ field, fieldState }) => (
                  <Field className="w-full xl:max-w-32">
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

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
  SelectAddon,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { CustomerFormValues } from "@/lib/validations/customer";
import { IdentityDocumentTypeId } from "factus-js";
import { HashIcon, ScrollTextIcon } from "lucide-react";
import { Control, Controller } from "react-hook-form";

const identityDocumentTypes = Object.values(IdentityDocumentTypeId);

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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Controller
            control={control}
            name="identificationDocumentId"
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
                          (d) => String(d.value) === value,
                        );
                        return (
                          (match?.description ?? value) ||
                          "Selecciona una opción"
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {identityDocumentTypes.map((doc) => (
                      <SelectItem key={doc.value} value={String(doc.value)}>
                        {doc.description}
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

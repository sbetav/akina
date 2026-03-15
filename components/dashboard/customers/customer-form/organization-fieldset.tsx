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
import {
  FACTUS_CUSTOMER_TRIBUTE_IDS,
  FACTUS_CUSTOMER_TRIBUTE_IDS_BY_ID,
  FACTUS_ORGANIZATION_TYPES,
  FACTUS_ORGANIZATION_TYPES_BY_ID,
} from "@/lib/factus/constants";
import { CustomerFormValues } from "@/lib/validations/customer";
import { Building2Icon, StoreIcon, UserIcon } from "lucide-react";
import { Control, Controller } from "react-hook-form";

interface OrganizationFieldSetProps {
  control: Control<CustomerFormValues>;
  isNaturalPerson: boolean;
}

export function OrganizationFieldSet({
  control,
  isNaturalPerson,
}: OrganizationFieldSetProps) {
  return (
    <FieldSet>
      <FieldLegend>Organización</FieldLegend>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="legal_organization_id"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Tipo de organización
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <SelectValue placeholder="Selecciona un tipo">
                      {(value: string) =>
                        (FACTUS_ORGANIZATION_TYPES_BY_ID[value] ?? value) ||
                        "Selecciona una opción"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {FACTUS_ORGANIZATION_TYPES.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="tribute_id"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Régimen tributario</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <SelectValue placeholder="Selecciona un régimen">
                      {(value: string) =>
                        (FACTUS_CUSTOMER_TRIBUTE_IDS_BY_ID[value] ?? value) ||
                        "Selecciona una opción"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {FACTUS_CUSTOMER_TRIBUTE_IDS.map((tribute) => (
                      <SelectItem key={tribute.id} value={tribute.id}>
                        {tribute.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  {isNaturalPerson ? "Nombre completo" : "Razón social"}
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    {isNaturalPerson ? <UserIcon /> : <Building2Icon />}
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    placeholder={
                      isNaturalPerson ? "Juan Pérez" : "Empresa S.A.S."
                    }
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="trade_name"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Nombre comercial{" "}
                  <span className="text-muted-foreground font-normal">
                    (opcional)
                  </span>
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <StoreIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    placeholder="Mi Empresa"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>
      </FieldGroup>
    </FieldSet>
  );
}

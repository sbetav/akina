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
import { CustomerFormValues } from "@/lib/validations/customer";
import { CustomerTributeId, OrganizationTypeId } from "factus-js";
import {
  Building2Icon,
  LandmarkIcon,
  ScaleIcon,
  StoreIcon,
  UserIcon,
} from "lucide-react";
import { Control, Controller } from "react-hook-form";

const organizationTypes = Object.values(OrganizationTypeId);
const customerTributes = Object.values(CustomerTributeId);

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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Controller
            control={control}
            name="legalOrganizationId"
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
                    <SelectAddon>
                      <LandmarkIcon />
                    </SelectAddon>
                    <SelectValue placeholder="Selecciona un tipo">
                      {(value: string) => {
                        const match = organizationTypes.find(
                          (o) => String(o.value) === value,
                        );
                        return (
                          (match?.description ?? value) ||
                          "Selecciona una opción"
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {organizationTypes.map((org) => (
                      <SelectItem key={org.value} value={String(org.value)}>
                        {org.description}
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
            name="tributeId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Régimen tributario</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <SelectAddon>
                      <ScaleIcon />
                    </SelectAddon>
                    <SelectValue placeholder="Selecciona un régimen">
                      {(value: string) => {
                        const match = customerTributes.find(
                          (t) => String(t.value) === value,
                        );
                        return (
                          (match?.description ?? value) ||
                          "Selecciona una opción"
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {customerTributes.map((tribute) => (
                      <SelectItem
                        key={tribute.value}
                        value={String(tribute.value)}
                      >
                        {tribute.description}
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
            name="tradeName"
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

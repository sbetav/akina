"use client";

import {
  CustomerTributeId,
  CustomerTributeIdInfo,
  OrganizationTypeId,
  OrganizationTypeIdInfo,
} from "factus-js";
import {
  Building2Icon,
  LandmarkIcon,
  ScaleIcon,
  StoreIcon,
  UserIcon,
} from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
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
import type { CustomerFormValues } from "@/lib/validations/customer";

const organizationTypes = Object.values(OrganizationTypeId);
const customerTributes = Object.values(CustomerTributeId);

export function OrganizationFieldSet() {
  const { control } = useFormContext<CustomerFormValues>();
  const legalOrganizationId = useWatch({
    control,
    name: "legalOrganizationId",
  });
  const isNaturalPerson =
    legalOrganizationId === OrganizationTypeId.NaturalPerson;
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
                          (organizationType) => organizationType === value,
                        );
                        return (
                          (match
                            ? OrganizationTypeIdInfo[match]?.description
                            : value) || "Selecciona una opción"
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {organizationTypes.map((org) => (
                      <SelectItem key={org} value={org}>
                        {OrganizationTypeIdInfo[org].description}
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
                          (tribute) => tribute === value,
                        );
                        return (
                          (match
                            ? CustomerTributeIdInfo[match]?.description
                            : value) || "Selecciona una opción"
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {customerTributes.map((tribute) => (
                      <SelectItem key={tribute} value={tribute}>
                        {CustomerTributeIdInfo[tribute].description}
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

"use client";

import { Button } from "@/components/ui/button";
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
  FACTUS_IDENTITY_DOCUMENT_TYPES,
  FACTUS_IDENTITY_DOCUMENT_TYPES_BY_ID,
  FACTUS_ORGANIZATION_TYPES,
  FACTUS_ORGANIZATION_TYPES_BY_ID,
} from "@/lib/factus/constants";
import {
  CustomerFormValues,
  customerFormSchema,
} from "@/lib/validations/customer";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2Icon,
  HashIcon,
  MailIcon,
  MapPinHouseIcon,
  MapPinIcon,
  PhoneIcon,
  SaveIcon,
  StoreIcon,
  UserIcon,
} from "lucide-react";
import { FC, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input/input";
import DashboardCard from "../dashboard-card";

interface CustomerFormProps {
  onSubmit: (data: CustomerFormValues) => void;
}

const CustomerForm: FC<CustomerFormProps> = ({ onSubmit }) => {
  const { handleSubmit, control, watch, resetField } =
    useForm<CustomerFormValues>({
      resolver: zodResolver(customerFormSchema),
      defaultValues: {
        identification: "",
        dv: "",
        identification_document_id:
          "" as CustomerFormValues["identification_document_id"],
        legal_organization_id:
          "" as CustomerFormValues["legal_organization_id"],
        tribute_id: "" as CustomerFormValues["tribute_id"],
        company: "",
        trade_name: "",
        names: "",
        address: "",
        email: "",
        phone: "",
        municipality_id: "",
      },
    });

  const identificationDocumentId = watch("identification_document_id");
  const legalOrganizationId = watch("legal_organization_id");

  const isNIT = identificationDocumentId === "6";
  const isJuridicalPerson = legalOrganizationId === "1";
  const isNaturalPerson = legalOrganizationId === "2";

  useEffect(() => {
    if (!isNIT) resetField("dv", { defaultValue: "" });
  }, [isNIT, resetField]);

  useEffect(() => {
    resetField("company", { defaultValue: "" });
    resetField("names", { defaultValue: "" });
  }, [legalOrganizationId, resetField]);

  return (
    <DashboardCard className="flex flex-1">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-8"
      >
        <div className="flex flex-1 flex-col gap-8">
          <FieldSet>
            <FieldLegend>Identificación</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Controller
                  control={control}
                  name="identification_document_id"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Tipo de documento
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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
                            {...field}
                          />
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
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          className="w-full"
                        >
                          <SelectValue placeholder="Selecciona un tipo">
                            {(value: string) =>
                              (FACTUS_ORGANIZATION_TYPES_BY_ID[value] ??
                                value) ||
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
                      <FieldLabel htmlFor={field.name}>
                        Régimen tributario
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          className="w-full"
                        >
                          <SelectValue placeholder="Selecciona un régimen">
                            {(value: string) =>
                              (FACTUS_CUSTOMER_TRIBUTE_IDS_BY_ID[value] ??
                                value) ||
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

                {isJuridicalPerson && (
                  <Controller
                    control={control}
                    name="company"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>
                          Razón social
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupAddon>
                            <Building2Icon />
                          </InputGroupAddon>
                          <InputGroupInput
                            id={field.name}
                            placeholder="Empresa S.A.S."
                            aria-invalid={fieldState.invalid}
                            {...field}
                          />
                        </InputGroup>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                )}

                {isNaturalPerson && (
                  <Controller
                    control={control}
                    name="names"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>
                          Nombre completo
                        </FieldLabel>
                        <InputGroup>
                          <InputGroupAddon>
                            <UserIcon />
                          </InputGroupAddon>
                          <InputGroupInput
                            id={field.name}
                            placeholder="Juan Pérez"
                            aria-invalid={fieldState.invalid}
                            {...field}
                          />
                        </InputGroup>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />
                )}

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

          <FieldSet>
            <FieldLegend>Contacto</FieldLegend>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Correo electrónico
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <MailIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          type="email"
                          placeholder="correo@ejemplo.com"
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
                  name="phone"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Teléfono</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <PhoneIcon />
                        </InputGroupAddon>
                        <PhoneInput
                          country="CO"
                          id={field.name}
                          placeholder="300 1234567"
                          aria-invalid={fieldState.invalid}
                          inputComponent={InputGroupInput}
                          {...field}
                        />
                      </InputGroup>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="municipality_id"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Municipio</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <MapPinIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          placeholder="Bogotá"
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
                  name="address"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Dirección</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <MapPinHouseIcon />
                        </InputGroupAddon>
                        <InputGroupInput
                          id={field.name}
                          placeholder="Calle 123 # 45-67"
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
        </div>

        <div className="flex w-full flex-col-reverse items-center justify-end gap-3 md:flex-row">
          <Button
            size="lg"
            type="button"
            variant="outline"
            className="w-full md:w-auto"
          >
            Cancelar
          </Button>
          <Button size="lg" type="submit" className="w-full md:w-auto">
            <SaveIcon />
            Guardar
          </Button>
        </div>
      </form>
    </DashboardCard>
  );
};

export default CustomerForm;

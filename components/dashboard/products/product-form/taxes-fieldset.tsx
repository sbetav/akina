"use client";

import {
  ProductStandardId,
  ProductStandardIdInfo,
  type Tribute,
} from "factus-js";
import { BarChart2Icon, BookOpenIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectAddon,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductFormValues } from "@/lib/validations/product";

const productStandards = Object.values(ProductStandardId);

const IVA_TAX_RATE_OPTIONS = [
  { label: "0%", value: 0 },
  { label: "5%", value: 0.05 },
  { label: "8%", value: 0.08 },
  { label: "19%", value: 0.19 },
] as const;

interface TaxesFieldSetProps {
  tributes: Tribute[];
}

export function TaxesFieldSet({ tributes }: TaxesFieldSetProps) {
  const { control, setValue } = useFormContext<ProductFormValues>();

  const isExcluded = useWatch({ control, name: "isExcluded" });
  const tributeId = useWatch({ control, name: "tributeId" });

  const ivaTributeId = tributes
    .find((t) => t.name.toLowerCase() === "iva")
    ?.id.toString();
  const isIva = !!ivaTributeId && tributeId === ivaTributeId;

  useEffect(() => {
    if (isExcluded || !isIva) {
      setValue("taxRate", 0);
    }
    if (isIva) {
      setValue("taxRate", 0.19);
    }
  }, [isExcluded, tributeId, setValue]);

  return (
    <FieldSet>
      <FieldLegend>Impuestos y tributación</FieldLegend>
      <FieldGroup className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Controller
          control={control}
          name="tributeId"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Tributo</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectAddon>
                    <BarChart2Icon />
                  </SelectAddon>
                  <SelectValue placeholder="Selecciona un tributo">
                    {(value: string) => {
                      const match = tributes?.find(
                        (t) => String(t.id) === value,
                      );
                      return (match?.name ?? value) || "Selecciona un tributo";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {tributes?.map((tribute) => (
                    <SelectItem key={tribute.id} value={String(tribute.id)}>
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
          name="isExcluded"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Excluido de impuesto</FieldLabel>
              <Select
                value={field.value ? "yes" : "no"}
                onValueChange={(value) => field.onChange(value === "yes")}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectValue placeholder="Selecciona una opción">
                    {(value: string) =>
                      value === "yes"
                        ? "Sí"
                        : value === "no"
                          ? "No"
                          : "Selecciona una opción"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Sí</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        {!isExcluded && (
          <Controller
            control={control}
            name="taxRate"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Tasa de impuesto</FieldLabel>
                {isIva ? (
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue placeholder="Selecciona una tasa">
                        {(value: string) => {
                          const match = IVA_TAX_RATE_OPTIONS.find(
                            (o) => String(o.value) === value,
                          );
                          return match?.label ?? "Selecciona una tasa";
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {IVA_TAX_RATE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <NumberInput
                    id={field.name}
                    placeholder="10%"
                    min={0}
                    max={1}
                    step={0.01}
                    aria-invalid={fieldState.invalid}
                    value={field.value}
                    onValueChange={field.onChange}
                    format={{
                      style: "percent",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    }}
                  />
                )}
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        )}

        <Controller
          control={control}
          name="standardCodeId"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Código estándar</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  className="w-full"
                >
                  <SelectAddon>
                    <BookOpenIcon />
                  </SelectAddon>
                  <SelectValue placeholder="Selecciona un estándar">
                    {(value: string) => {
                      const match = productStandards.find((s) => s === value);
                      return (
                        (match
                          ? ProductStandardIdInfo[match]?.description
                          : value) || "Selecciona un estándar"
                      );
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {productStandards.map((standard) => (
                    <SelectItem key={standard} value={standard}>
                      {ProductStandardIdInfo[standard].description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
    </FieldSet>
  );
}

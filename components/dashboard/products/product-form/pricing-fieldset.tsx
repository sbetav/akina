"use client";

import { LayersIcon } from "lucide-react";
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
import { PRODUCT_TYPES } from "@/lib/constants";
import type { ProductFormValues } from "@/lib/validations/product";

const productTypeLabels: Record<string, string> = {
  product: "Producto",
  service: "Servicio",
};

export function PricingFieldSet() {
  const { control, setValue } = useFormContext<ProductFormValues>();
  const isExcluded = useWatch({ control, name: "isExcluded" });

  useEffect(() => {
    if (isExcluded) {
      setValue("taxRate", 0);
    }
  }, [isExcluded, setValue]);

  return (
    <FieldSet>
      <FieldLegend>Precio e impuestos</FieldLegend>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Controller
            control={control}
            name="price"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Precio unitario</FieldLabel>
                <NumberInput
                  id={field.name}
                  placeholder="$100,000"
                  aria-invalid={fieldState.invalid}
                  value={field.value}
                  onValueChange={field.onChange}
                  format={{
                    style: "currency",
                    currencyDisplay: "narrowSymbol",
                    currency: "COP",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="type"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Tipo</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    className="w-full"
                  >
                    <SelectAddon>
                      <LayersIcon />
                    </SelectAddon>
                    <SelectValue placeholder="Selecciona un tipo">
                      {(value: string) =>
                        (productTypeLabels[value] ?? value) ||
                        "Selecciona un tipo"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {productTypeLabels[type]}
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
                <FieldLabel htmlFor={field.name}>
                  Excluido de impuesto
                </FieldLabel>
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
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          )}
        </div>
      </FieldGroup>
    </FieldSet>
  );
}

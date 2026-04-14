"use client";

import { useQuery } from "@tanstack/react-query";
import type { MeasurementUnit } from "factus-js";
import {
  CheckIcon,
  LockIcon,
  RulerIcon,
  ScanBarcode,
  TagIcon,
  XIcon,
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
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectAddon,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/elysia/eden";
import useDebounce from "@/hooks/ui/use-debounce";
import { PRODUCTS_QUERY_KEY } from "@/lib/query-keys";
import type { ProductFormValues } from "@/lib/validations/product";

interface DetailsFieldSetProps {
  editMode: boolean;
  disableReferenceCheck: boolean;
  measurementUnits: MeasurementUnit[];
  isLoadingMeasurementUnits: boolean;
}

export function DetailsFieldSet({
  editMode,
  disableReferenceCheck,
  measurementUnits,
  isLoadingMeasurementUnits,
}: DetailsFieldSetProps) {
  const { control, setError, trigger } = useFormContext<ProductFormValues>();

  const code = useWatch({ control, name: "code" });
  const debouncedCode = useDebounce(code, 500);
  const { data: isCodeAvailable, isFetching } = useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, "code-available", debouncedCode],
    queryFn: async () => {
      const { data } = await api.products["code-available"].get({
        query: {
          code: debouncedCode,
        },
      });
      if (!data?.available) {
        setError("code", { message: "El código ya está en uso" });
      } else {
        trigger("code");
      }

      return !!data?.available;
    },
    enabled: !!debouncedCode && !editMode && !disableReferenceCheck,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  return (
    <FieldSet>
      <FieldLegend>Información general</FieldLegend>
      <FieldGroup>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Controller
            control={control}
            name="code"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Código de referencia
                </FieldLabel>
                <InputGroup aria-disabled={editMode}>
                  <InputGroupAddon>
                    <ScanBarcode />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    placeholder="P-0001"
                    aria-invalid={fieldState.invalid}
                    disabled={editMode}
                    {...field}
                  />
                  <InputGroupAddon align="inline-end">
                    {editMode ? (
                      <LockIcon />
                    ) : isFetching ? (
                      <Spinner />
                    ) : isCodeAvailable ? (
                      <CheckIcon className="text-primary" />
                    ) : (
                      <XIcon className="text-destructive" />
                    )}
                  </InputGroupAddon>
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <TagIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    id={field.name}
                    placeholder="Nombre del producto o servicio"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                Descripción{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </FieldLabel>

              <Textarea
                id={field.name}
                placeholder="Descripción del producto o servicio"
                aria-invalid={fieldState.invalid}
                {...field}
              />

              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Controller
            control={control}
            name="price"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Precio</FieldLabel>
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
            name="unitMeasureId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Unidad de medida</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    isPending={isLoadingMeasurementUnits}
                    className="w-full capitalize"
                  >
                    <SelectAddon>
                      <RulerIcon />
                    </SelectAddon>
                    <SelectValue placeholder="Selecciona una unidad">
                      {(value: string) => {
                        const match = measurementUnits?.find(
                          (u) => String(u.id) === value,
                        );
                        return (
                          (match?.name ?? value) || "Selecciona una unidad"
                        );
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {measurementUnits?.map((unit) => (
                      <SelectItem
                        key={unit.id}
                        value={String(unit.id)}
                        className="capitalize"
                      >
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>
      </FieldGroup>
    </FieldSet>
  );
}

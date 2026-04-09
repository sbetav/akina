"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckIcon, LockIcon, ScanBarcode, TagIcon, XIcon } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  Field,
  FieldDescription,
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/elysia/eden";
import useDebounce from "@/hooks/ui/use-debounce";
import { PRODUCTS_QUERY_KEY } from "@/lib/query-keys";
import type { ProductFormValues } from "@/lib/validations/product";

interface DetailsFieldSetProps {
  editMode: boolean;
  disableReferenceCheck: boolean;
}

export function DetailsFieldSet({
  editMode,
  disableReferenceCheck,
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
                <FieldDescription>
                  El código de referencia es único y no puede ser editado.
                </FieldDescription>
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
      </FieldGroup>
    </FieldSet>
  );
}

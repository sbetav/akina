"use client";

import { PaymentMethodCodeInfo } from "factus-js";
import { FileDigitIcon } from "lucide-react";
import { type FC, useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectAddon,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCredentialsContext } from "@/contexts/credentials-context";
import { useNumberingRangesCatalog } from "@/hooks/factus/use-numbering-ranges";
import type { SupportDocumentFormValues } from "@/lib/validations/support-document";

const PAYMENT_METHOD_OPTIONS = Object.entries(PaymentMethodCodeInfo).map(
  ([value, info]) => ({
    value,
    label: info.description,
  }),
);

const DocumentDetailsStep: FC = () => {
  const { isAkinaSandbox } = useCredentialsContext();

  const { control, setValue } = useFormContext<SupportDocumentFormValues>();
  const { data: ranges = [], isPending: isLoadingRanges } =
    useNumberingRangesCatalog();

  const numberingRangeId = useWatch({ control, name: "numberingRangeId" });
  const observation = useWatch({ control, name: "observation" }) ?? "";

  // Auto-select an active range when not in sandbox mode and no range is set.
  useEffect(() => {
    if (numberingRangeId || ranges.length === 0 || isAkinaSandbox) return;
    const defaultRange = ranges.find((range) => range.isActive) ?? ranges[0];
    setValue("numberingRangeId", defaultRange.id, {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [numberingRangeId, ranges, isAkinaSandbox, setValue]);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Detalles del documento</PageHeaderTitle>
          <PageHeaderDescription>
            Configura la numeración, método de pago y observaciones
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      {ranges.length === 0 && !isLoadingRanges && (
        <Alert variant="warning">
          <AlertTitle>Sin rangos de numeración activos</AlertTitle>
          <AlertDescription>
            Debes crear o activar al menos un rango de numeración para emitir
            documentos soporte.
          </AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Controller
            control={control}
            name="numberingRangeId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Rango de numeración
                </FieldLabel>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) =>
                    field.onChange(value ? Number(value) : undefined)
                  }
                >
                  <SelectTrigger
                    id={field.name}
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                    isPending={isLoadingRanges}
                    disabled={isAkinaSandbox}
                    showLock={isAkinaSandbox}
                  >
                    <SelectAddon>
                      <FileDigitIcon />
                    </SelectAddon>
                    <SelectValue placeholder="Selecciona un rango">
                      {(value: string) => {
                        const range = ranges.find(
                          (item) => String(item.id) === value,
                        );
                        return range ? range.document : "Selecciona un rango";
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ranges.map((range) => (
                      <SelectItem key={range.id} value={String(range.id)}>
                        {range.prefix} · {range.document}
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
            name="paymentMethodCode"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Método de pago</FieldLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger
                    id={field.name}
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecciona el método de pago">
                      {(value: string) =>
                        PAYMENT_METHOD_OPTIONS.find(
                          (option) => option.value === value,
                        )?.label ?? "Selecciona el método de pago"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <Controller
          control={control}
          name="observation"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>
                Observación (opcional)
              </FieldLabel>
              <Textarea
                id={field.name}
                placeholder="Información adicional para este documento soporte"
                maxLength={250}
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldDescription className="text-right">
                {observation.length}/250
              </FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  );
};

export default DocumentDetailsStep;

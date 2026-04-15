"use client";

import {
  CreditNoteCorrectionCode,
  CreditNoteCorrectionCodeInfo,
  type PaymentMethodCode,
  PaymentMethodCodeInfo,
} from "factus-js";
import { type FC, useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCredentialsContext } from "@/contexts/credentials-context";
import { useNumberingRangesCatalog } from "@/hooks/factus/use-numbering-ranges";
import type { CreditNoteFormValues } from "@/lib/validations/credit-note";

const PAYMENT_METHOD_OPTIONS = Object.entries(PaymentMethodCodeInfo).map(
  ([value, info]) => ({
    value,
    label: info.description,
  }),
);

const SUPPORTED_CORRECTION_CONCEPTS = new Set<string>([
  CreditNoteCorrectionCode.PartialReturn,
  CreditNoteCorrectionCode.InvoiceCancellation,
]);

const CORRECTION_CONCEPT_OPTIONS = Object.entries(CreditNoteCorrectionCodeInfo)
  .filter(([value]) => SUPPORTED_CORRECTION_CONCEPTS.has(value))
  .map(([value, info]) => ({
    value,
    label: info.description,
  }));

const SettingsFieldset: FC = () => {
  const { isAkinaSandbox } = useCredentialsContext();
  const { data: numberingRanges = [], isPending: isLoadingRanges } =
    useNumberingRangesCatalog();
  const { control, setValue } = useFormContext<CreditNoteFormValues>();

  const numberingRangeId = useWatch({ control, name: "numberingRangeId" });
  const observation = useWatch({ control, name: "observation" }) ?? "";

  useEffect(() => {
    if (isAkinaSandbox) {
      setValue("numberingRangeId", 9, {
        shouldDirty: false,
        shouldValidate: true,
      });
      return;
    }

    if (numberingRangeId || numberingRanges.length === 0) return;

    const defaultRange =
      numberingRanges.find((range) => range.isActive) ?? numberingRanges[0];
    setValue("numberingRangeId", defaultRange.id, {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [numberingRangeId, numberingRanges, isAkinaSandbox, setValue]);

  return (
    <section className="space-y-5">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Configuración</PageHeaderTitle>
          <PageHeaderDescription>
            Define el concepto y los datos de emisión de la nota crédito.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

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
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger
                    id={field.name}
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                    isPending={isLoadingRanges}
                    disabled={isAkinaSandbox}
                    showLock={isAkinaSandbox}
                  >
                    <SelectValue placeholder="Selecciona un rango">
                      {(value: string) => {
                        const range = numberingRanges.find(
                          (item) => String(item.id) === value,
                        );
                        return range ? range.document : "Selecciona un rango";
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {numberingRanges.map((range) => (
                      <SelectItem key={range.id} value={String(range.id)}>
                        {range.document}
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
            name="correctionConceptCode"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Concepto de corrección
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecciona un concepto">
                      {(value: string) =>
                        CORRECTION_CONCEPT_OPTIONS.find(
                          (option) => option.value === value,
                        )?.label ?? "Selecciona un concepto"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CORRECTION_CONCEPT_OPTIONS.map((option) => (
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

          <Controller
            control={control}
            name="paymentMethodCode"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Método de pago</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange(value as PaymentMethodCode)
                  }
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
              <FieldLabel htmlFor={field.name}>Observación</FieldLabel>
              <Textarea
                id={field.name}
                placeholder="Motivo o detalle adicional de la nota crédito"
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

        <Controller
          control={control}
          name="sendEmail"
          render={({ field, fieldState }) => (
            <Field orientation="horizontal">
              <Checkbox
                id={field.name}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(!!checked)}
                aria-invalid={fieldState.invalid}
              />
              <FieldContent>
                <FieldLabel htmlFor={field.name}>
                  Enviar nota crédito por correo
                </FieldLabel>
                <FieldDescription>
                  Factus notificará al cliente al emitir la nota crédito.
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>
    </section>
  );
};

export default SettingsFieldset;

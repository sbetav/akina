"use client";

import {
  PaymentFormCode,
  PaymentFormCodeInfo,
  PaymentMethodCodeInfo,
} from "factus-js";
import { FileDigitIcon } from "lucide-react";
import { type FC, useEffect, useMemo } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
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
  SelectAddon,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCredentialsContext } from "@/contexts/credentials-context";
import { useNumberingRangesCatalog } from "@/hooks/factus/use-numbering-ranges";
import type { InvoiceFormValues } from "@/lib/validations/invoice";

const PAYMENT_METHOD_OPTIONS = Object.entries(PaymentMethodCodeInfo).map(
  ([value, info]) => ({
    value,
    label: info.description,
  }),
);

const PAYMENT_FORM_OPTIONS = Object.entries(PaymentFormCodeInfo).map(
  ([value, info]) => ({
    value,
    label: info.description,
  }),
);

const InvoiceDetailsStep: FC = () => {
  const { isAkinaSandbox } = useCredentialsContext();

  const { control, setValue } = useFormContext<InvoiceFormValues>();
  const { data: ranges = [], isPending: isLoadingRanges } =
    useNumberingRangesCatalog();

  const numberingRangeId = useWatch({ control, name: "numberingRangeId" });
  const paymentForm = useWatch({ control, name: "paymentForm" });
  const observation = useWatch({ control, name: "observation" }) ?? "";

  const isCreditPayment = paymentForm === PaymentFormCode.CreditPayment;
  const minDueDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const maxDueDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 5);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  useEffect(() => {
    if (numberingRangeId || ranges.length === 0) return;
    const defaultRange = ranges.find((range) => range.isActive) ?? ranges[0];
    setValue("numberingRangeId", defaultRange.id, {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [numberingRangeId, ranges, setValue]);

  useEffect(() => {
    if (isCreditPayment) return;
    setValue("paymentDueDate", "", {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [isCreditPayment, setValue]);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Detalles de la factura</PageHeaderTitle>
          <PageHeaderDescription>
            Configura el método de pago, numeración y observaciones
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      {ranges.length === 0 && !isLoadingRanges && (
        <Alert variant="warning">
          <AlertTitle>Sin rangos de numeración activos</AlertTitle>
          <AlertDescription>
            Debes crear o activar al menos un rango de numeración para emitir
            facturas.
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
            name="paymentForm"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Forma de pago</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id={field.name}
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecciona la forma de pago">
                      {(value: string) =>
                        PAYMENT_FORM_OPTIONS.find(
                          (option) => option.value === value,
                        )?.label ?? "Selecciona la forma de pago"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_FORM_OPTIONS.map((option) => (
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
                <Select value={field.value} onValueChange={field.onChange}>
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

          {isCreditPayment && (
            <Controller
              control={control}
              name="paymentDueDate"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Fecha de vencimiento
                  </FieldLabel>
                  <DatePicker
                    id={field.name}
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    minDate={minDueDate}
                    maxDate={maxDueDate}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          )}
        </div>

        <Controller
          control={control}
          name="observation"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Observación</FieldLabel>
              <Textarea
                id={field.name}
                placeholder="Información adicional para esta factura"
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
                  Enviar factura por correo
                </FieldLabel>
                <FieldDescription>
                  Factus notificará al cliente al emitir la factura.
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>
    </div>
  );
};

export default InvoiceDetailsStep;

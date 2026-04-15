"use client";

import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditNoteCorrectionCode,
  PaymentMethodCode,
  type ViewBillData,
} from "factus-js";
import { type FC, useState } from "react";
import { FormProvider, type Resolver, useForm } from "react-hook-form";
import DashboardCard from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import { useGoBack } from "@/hooks/ui/use-go-back";
import { CREDIT_NOTES_QUERY_KEY } from "@/lib/query-keys";
import {
  type CreditNoteFormValues,
  creditNoteFormSchema,
  getDefaultCreditNoteItems,
} from "@/lib/validations/credit-note";
import ItemsFieldset from "./items-fieldset";
import SettingsFieldset from "./settings-fieldset";
import SummaryCard from "./summary-card";

interface CreditNoteCreateError extends Error {
  validationErrors?: Record<string, string>;
}

function extractValidationErrors(error: unknown): Record<string, string> {
  if (!error || typeof error !== "object") return {};

  const value = "value" in error ? error.value : error;
  if (!value || typeof value !== "object") return {};
  if (!("validationErrors" in value)) return {};

  const validationErrors = value.validationErrors;
  if (!validationErrors || typeof validationErrors !== "object") return {};

  const entries = Object.entries(validationErrors).filter(
    ([key, val]) => typeof key === "string" && typeof val === "string",
  );

  return Object.fromEntries(entries);
}

interface CreditNoteFormProps {
  invoiceId: string;
  invoice: ViewBillData;
}

const CreditNoteForm: FC<CreditNoteFormProps> = ({ invoiceId, invoice }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { goBack } = useGoBack({
    fallbackHref: `/dashboard/invoices/${invoiceId}`,
  });
  const [redirecting, setRedirecting] = useState(false);

  const methods = useForm<CreditNoteFormValues>({
    resolver: zodResolver(
      creditNoteFormSchema,
    ) as Resolver<CreditNoteFormValues>,
    defaultValues: {
      numberingRangeId: undefined as never,
      correctionConceptCode: CreditNoteCorrectionCode.PartialReturn,
      observation: "",
      paymentMethodCode:
        (invoice.bill.payment_method.code as PaymentMethodCode) ??
        PaymentMethodCode.Cash,
      sendEmail: invoice.bill.send_email === 1,
      items: getDefaultCreditNoteItems(invoice),
    },
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreditNoteFormValues) => {
      const res = await api.invoices({ id: invoiceId })["credit-notes"].post({
        numberingRangeId: values.numberingRangeId,
        correctionConceptCode: values.correctionConceptCode,
        observation: values.observation?.trim() || undefined,
        paymentMethodCode: values.paymentMethodCode,
        sendEmail: values.sendEmail,
        items: values.items
          .filter((item) => item.quantity > 0)
          .map((item) => ({
            code: item.code,
            name: item.name,
            price: item.price,
            taxRate: item.taxRate,
            unitMeasureId: item.unitMeasureId,
            standardCodeId: item.standardCodeId,
            isExcluded: item.isExcluded,
            tributeId: item.tributeId,
            quantity: item.quantity,
            discountRate: item.discountRate,
          })),
      });

      if (res.error) {
        const error = new Error(
          getApiErrorMessage(res.error, "Error al crear la nota crédito"),
        ) as CreditNoteCreateError;
        error.validationErrors = extractValidationErrors(res.error);
        throw error;
      }

      return res.data;
    },
    onSuccess: () => {
      setRedirecting(true);
      toast.success("Nota crédito creada exitosamente");
      void queryClient.invalidateQueries({ queryKey: CREDIT_NOTES_QUERY_KEY });
      router.replace(`/dashboard/invoices/${invoiceId}`);
    },
    onError: (error: CreditNoteCreateError) => {
      setRedirecting(false);
      const validationEntries = Object.entries(error.validationErrors ?? {});
      const description = validationEntries.length
        ? validationEntries
            .slice(0, 3)
            .map(([code, message]) => `${code}: ${message}`)
            .join(" · ")
        : undefined;

      toast.error(error.message, { description });
    },
  });

  const onSubmit = (values: CreditNoteFormValues) => {
    mutate(values);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <DashboardCard className="flex flex-1 flex-col gap-8">
          <div className="min-w-0 flex-1 space-y-8">
            <SettingsFieldset />

            <Separator />

            <ItemsFieldset />
          </div>

          <div className="flex w-full flex-col-reverse items-center justify-end gap-3 md:flex-row">
            <Button
              size="lg"
              type="button"
              variant="outline"
              className="w-full md:w-auto"
              onClick={goBack}
              disabled={isPending || redirecting}
            >
              Cancelar
            </Button>
            <Button
              size="lg"
              type="submit"
              className="w-full md:w-auto"
              disabled={isPending || redirecting}
            >
              {isPending && <Spinner />}
              Crear nota crédito
            </Button>
          </div>
        </DashboardCard>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <SummaryCard
            invoiceNumber={invoice.bill.number}
            customerName={
              invoice.customer.graphic_representation_name ||
              invoice.customer.trade_name ||
              invoice.customer.company ||
              invoice.customer.names
            }
          />
        </aside>
      </form>
    </FormProvider>
  );
};

export default CreditNoteForm;

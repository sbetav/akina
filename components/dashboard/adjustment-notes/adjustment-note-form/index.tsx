"use client";

import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AdjustmentNoteReasonCode,
  PaymentMethodCode,
  type ViewSupportDocumentData,
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
import { ADJUSTMENT_NOTES_QUERY_KEY } from "@/lib/query-keys";
import {
  type AdjustmentNoteFormValues,
  adjustmentNoteFormSchema,
  getDefaultAdjustmentNoteItems,
} from "@/lib/validations/adjustment-note";
import ItemsFieldset from "./items-fieldset";
import SettingsFieldset from "./settings-fieldset";
import SummaryCard from "./summary-card";

interface AdjustmentNoteCreateError extends Error {
  validationErrors?: Record<string, string>;
}

function extractValidationErrors(error: unknown): Record<string, string> {
  if (!error || typeof error !== "object") return {};

  const value = "value" in error ? error.value : error;
  if (!value || typeof value !== "object") return {};
  if (!("validationErrors" in value)) return {};

  const validationErrors = value.validationErrors;
  if (!validationErrors || typeof validationErrors !== "object") return {};

  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(validationErrors)) {
    if (typeof key !== "string") continue;
    if (typeof val === "string") {
      result[key] = val;
    } else if (Array.isArray(val) && val.length > 0) {
      result[key] = val.filter((v) => typeof v === "string").join(" ");
    }
  }
  return result;
}

interface AdjustmentNoteFormProps {
  supportDocumentId: string;
  supportDocumentFactusId: number;
  document: ViewSupportDocumentData;
}

const AdjustmentNoteForm: FC<AdjustmentNoteFormProps> = ({
  supportDocumentId,
  supportDocumentFactusId,
  document,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { goBack } = useGoBack({
    fallbackHref: `/dashboard/support-documents/${supportDocumentId}`,
  });
  const [redirecting, setRedirecting] = useState(false);

  const providerName =
    document.provider.trade_name || document.provider.names || "N/A";

  const methods = useForm<AdjustmentNoteFormValues>({
    resolver: zodResolver(
      adjustmentNoteFormSchema,
    ) as Resolver<AdjustmentNoteFormValues>,
    defaultValues: {
      numberingRangeId: undefined as never,
      correctionConceptCode: AdjustmentNoteReasonCode.PartialReturn,
      observation: "",
      paymentMethodCode: document.support_document.payment_method
        .code as PaymentMethodCode,
      sendEmail: document.support_document.send_email === 1,
      items: getDefaultAdjustmentNoteItems(document),
    },
  });

  const { handleSubmit } = methods;

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: AdjustmentNoteFormValues) => {
      const res = await api["support-documents"]({
        id: supportDocumentId,
      })["adjustment-notes"].post({
        supportDocumentFactusId,
        numberingRangeId: values.numberingRangeId,
        correctionConceptCode: values.correctionConceptCode,
        observation: values.observation?.trim() || undefined,
        paymentMethodCode: values.paymentMethodCode,
        sendEmail: values.sendEmail,
        items: values.items
          .filter((item) => item.quantity > 0)
          .map((item) => ({
            codeReference: item.codeReference,
            name: item.name,
            price: item.price,
            unitMeasureId: item.unitMeasureId,
            standardCodeId: item.standardCodeId,
            quantity: item.quantity,
            discountRate: item.discountRate,
          })),
      });

      if (res.error) {
        const error = new Error(
          getApiErrorMessage(res.error, "Error al crear la nota de ajuste"),
        ) as AdjustmentNoteCreateError;
        error.validationErrors = extractValidationErrors(res.error);
        throw error;
      }

      return res.data;
    },
    onSuccess: () => {
      setRedirecting(true);
      toast.success("Nota de ajuste creada exitosamente");
      void queryClient.invalidateQueries({
        queryKey: ADJUSTMENT_NOTES_QUERY_KEY,
      });
      router.replace(`/dashboard/support-documents/${supportDocumentId}`);
    },
    onError: (error: AdjustmentNoteCreateError) => {
      setRedirecting(false);
      const validationEntries = Object.entries(error.validationErrors ?? {});
      const description = validationEntries.length
        ? validationEntries
            .slice(0, 3)
            .map(([, message]) => message)
            .join(" · ")
        : undefined;

      toast.error(error.message, { description });
    },
  });

  const onSubmit = (values: AdjustmentNoteFormValues) => {
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
              Crear nota de ajuste
            </Button>
          </div>
        </DashboardCard>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <SummaryCard
            supportDocumentNumber={document.support_document.number}
            providerName={providerName}
          />
        </aside>
      </form>
    </FormProvider>
  );
};

export default AdjustmentNoteForm;

"use client";

import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PaymentMethodCode, SupportDocumentIdentityTypeId } from "factus-js";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  FileTextIcon,
  ListChecksIcon,
  PackageIcon,
  TruckIcon,
} from "lucide-react";
import { type FC, useEffect, useRef, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { type FieldPath, FormProvider, useForm } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useCredentialsContext } from "@/contexts/credentials-context";
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import type { ProviderDetailResult } from "@/elysia/modules/providers";
import { SUPPORT_DOCUMENTS_QUERY_KEY } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import {
  type SupportDocumentFormValues,
  supportDocumentFormSchema,
} from "@/lib/validations/support-document";
import DashboardCard from "../../dashboard-card";
import DocumentDetailsStep from "./document-details-step";
import ProductsStep from "./products-step";
import ProviderStep from "./provider-step";
import ReviewStep from "./review-step";
import SummaryCard from "./summary-card";

/** Sandbox numbering range ID for support documents. */
const SANDBOX_NUMBERING_RANGE_ID = 148;

const FORM_STEPS = [
  {
    label: "Proveedor",
    value: "provider",
    icon: TruckIcon,
    component: ProviderStep,
  },
  {
    label: "Productos",
    value: "products",
    icon: PackageIcon,
    component: ProductsStep,
  },
  {
    label: "Documento",
    value: "document",
    icon: FileTextIcon,
    component: DocumentDetailsStep,
  },
  {
    label: "Resumen",
    value: "summary",
    icon: ListChecksIcon,
    component: ReviewStep,
  },
] as const;

interface SupportDocumentCreateError extends Error {
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

/**
 * Transforms form values into the shape expected by the support documents API.
 * Key differences from form values:
 * - `items[].code` → `codeReference`
 * - `items[].unitMeasureId` converted from string to number
 * - `provider.dv` converted from string to number
 * - Extra item fields (productId, tributeId, taxRate, isExcluded) stripped
 */
function toApiBody(values: SupportDocumentFormValues) {
  return {
    numberingRangeId: values.numberingRangeId,
    paymentMethodCode: values.paymentMethodCode,
    observation: values.observation || undefined,
    provider: {
      identificationDocumentId: values.provider.identificationDocumentId,
      identification: values.provider.identification,
      dv: values.provider.dv ? Number(values.provider.dv) : undefined,
      tradeName: values.provider.tradeName || undefined,
      names: values.provider.names,
      address: values.provider.address,
      email: values.provider.email as string,
      phone: values.provider.phone || undefined,
      isResident: values.provider.isResident,
      countryCode: values.provider.countryCode,
      municipalityId: values.provider.municipalityId || undefined,
    },
    items: values.items.map((item) => ({
      codeReference: item.code,
      name: item.name,
      quantity: item.quantity,
      discountRate: item.discountRate,
      price: item.price,
      unitMeasureId: Number(item.unitMeasureId),
      standardCodeId: item.standardCodeId,
    })),
  };
}

const SupportDocumentForm: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAkinaSandbox } = useCredentialsContext();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderDetailResult | null>(null);
  const prevStepIndexRef = useRef(currentStepIndex);

  const methods = useForm<SupportDocumentFormValues>({
    resolver: zodResolver(supportDocumentFormSchema),
    defaultValues: {
      provider: {
        identificationDocumentId: SupportDocumentIdentityTypeId.NIT,
        identification: "",
        dv: "",
        names: "",
        tradeName: "",
        countryCode: "CO",
        isResident: 1,
        address: "",
        email: "",
        phone: "",
        municipalityId: "",
      },
      items: [],
      numberingRangeId: isAkinaSandbox ? SANDBOX_NUMBERING_RANGE_ID : undefined,
      paymentMethodCode: PaymentMethodCode.Cash,
      observation: "",
    },
    mode: "all",
  });

  const currentStep = FORM_STEPS[currentStepIndex];
  const CurrentStepComponent = currentStep?.component;
  const isReviewStep = currentStep?.value === "summary";

  const stepProps = (() => {
    if (currentStep?.value === "provider") {
      return {
        selectedProvider,
        onSelectedProviderChange: setSelectedProvider,
      };
    }

    if (currentStep?.value === "summary") {
      return {
        onEditStep: (stepIndex: number) => setCurrentStepIndex(stepIndex),
      };
    }

    return {};
  })();

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === FORM_STEPS.length - 1;
  const currentStepNumber = currentStepIndex + 1;
  const totalSteps = FORM_STEPS.length;
  const progressValue =
    totalSteps > 0 ? Math.round((currentStepNumber / totalSteps) * 100) : 0;

  const getFieldsForStep = (
    stepValue: (typeof FORM_STEPS)[number]["value"],
  ): FieldPath<SupportDocumentFormValues>[] => {
    switch (stepValue) {
      case "provider":
        return [
          "provider.identification",
          "provider.dv",
          "provider.identificationDocumentId",
          "provider.names",
          "provider.tradeName",
          "provider.countryCode",
          "provider.isResident",
          "provider.address",
          "provider.email",
          "provider.phone",
          "provider.municipalityId",
        ];
      case "products":
        return ["items"];
      case "document":
        return ["numberingRangeId", "paymentMethodCode", "observation"];
      case "summary":
        return [];
      default:
        return [];
    }
  };

  const nextStep = async () => {
    if (!currentStep) return;

    const fields = getFieldsForStep(currentStep.value);
    const isValid = fields.length ? await methods.trigger(fields) : true;

    if (!isValid) {
      toast.error("Revisa los campos requeridos antes de continuar");
      return;
    }

    setCurrentStepIndex((prev) => Math.min(prev + 1, FORM_STEPS.length - 1));
  };

  const prevStep = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: SupportDocumentFormValues) => {
      const body = toApiBody(values);
      const res = await api["support-documents"].post(body);

      if (res.error) {
        const error = new Error(
          getApiErrorMessage(res.error, "Error al crear el documento soporte"),
        ) as SupportDocumentCreateError;
        error.validationErrors = extractValidationErrors(res.error);
        throw error;
      }

      return res.data;
    },
    onSuccess: (record) => {
      setRedirecting(true);
      setIsConfirmOpen(false);
      toast.success("Documento soporte creado exitosamente");
      void queryClient.invalidateQueries({
        queryKey: SUPPORT_DOCUMENTS_QUERY_KEY,
      });
      router.replace(`/dashboard/support-documents/${record.id}`);
    },
    onError: (error: SupportDocumentCreateError) => {
      setRedirecting(false);
      setIsConfirmOpen(false);
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

  const onConfirmSubmit = () => {
    void methods.handleSubmit(
      (values) => {
        mutate(values);
      },
      () => {
        setIsConfirmOpen(false);
        toast.error(
          "Revisa los campos requeridos antes de crear el documento soporte",
        );
      },
    )();
  };

  const isSubmitting = isPending || redirecting;

  useEffect(() => {
    if (prevStepIndexRef.current !== currentStepIndex) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      prevStepIndexRef.current = currentStepIndex;
    }
  }, [currentStepIndex]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
        className="flex flex-1 flex-col gap-6"
      >
        {/* Steps */}
        <Field className="w-full sm:hidden">
          <FieldLabel htmlFor="support-doc-form-progress">
            <span>{currentStep?.label ?? "Paso"}</span>
            <span className="ml-auto">
              {currentStepNumber}/{totalSteps}
            </span>
          </FieldLabel>
          <Progress value={progressValue} id="support-doc-form-progress" />
        </Field>

        <div className="hidden items-center gap-2.5 sm:flex">
          {FORM_STEPS.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const StepIcon = isCompleted ? CheckCircle2Icon : step.icon;
            return (
              <Fragment key={step.value}>
                <div
                  className={cn(
                    "bg-card text-muted-foreground flex items-center justify-center gap-1.5 border px-2.5 py-1.5 pl-[9px] transition-all",
                    {
                      "bg-primary/10 text-primary border-primary/20":
                        isActive || isCompleted,
                    },
                  )}
                >
                  <StepIcon className="size-3.5" />
                  <span className="text-xs font-medium">{step.label}</span>
                </div>

                {index < FORM_STEPS.length - 1 && (
                  <div className="bg-border h-px w-6" />
                )}
              </Fragment>
            );
          })}
        </div>

        {/* Main layout */}
        <div
          className={cn(
            "grid flex-1 grid-cols-1 items-stretch gap-6",
            isReviewStep ? "lg:grid-cols-1" : "xl:grid-cols-[1fr_350px]",
          )}
        >
          <DashboardCard className="flex flex-1 flex-col gap-8">
            {CurrentStepComponent && (
              <div className="flex flex-1 flex-col">
                <CurrentStepComponent {...stepProps} />
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              {!isFirstStep && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={prevStep}
                  disabled={isSubmitting}
                >
                  <ArrowLeftIcon />
                  Anterior
                </Button>
              )}

              {isLastStep ? (
                <Button
                  key="submit"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsConfirmOpen(true)}
                >
                  Crear documento soporte
                </Button>
              ) : (
                <Button
                  key="next"
                  type="button"
                  disabled={isSubmitting}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void nextStep();
                  }}
                >
                  Siguiente
                  <ArrowRightIcon />
                </Button>
              )}
            </div>
          </DashboardCard>

          {!isReviewStep && (
            <div className="sticky top-6 hidden self-start xl:block">
              <SummaryCard />
            </div>
          )}
        </div>
      </form>

      <AlertDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          if (isSubmitting) return;
          setIsConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Emitir documento soporte</AlertDialogTitle>
            <AlertDialogDescription>
              Se enviará el documento soporte a Factus para validación DIAN.
              Esta acción puede tardar unos segundos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : null}
              Enviar documento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormProvider>
  );
};

export default SupportDocumentForm;

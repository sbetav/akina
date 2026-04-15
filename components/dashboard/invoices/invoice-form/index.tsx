"use client";

import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IdentityDocumentTypeId,
  PaymentFormCode,
  PaymentMethodCode,
} from "factus-js";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ListChecksIcon,
  PackageIcon,
  ReceiptIcon,
  UserIcon,
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
import type { CustomerDetailResult } from "@/elysia/modules/customers";
import { INVOICES_QUERY_KEY } from "@/lib/query-keys";
import { cn } from "@/lib/utils";
import {
  type InvoiceFormValues,
  invoiceFormSchema,
} from "@/lib/validations/invoice";
import DashboardCard from "../../dashboard-card";
import CustomerStep from "./customer-step";
import InvoiceDetailsStep from "./invoice-details-step";
import ProductsStep from "./products-step";
import ReviewStep from "./review-step";
import SummaryCard from "./summary-card";

const FORM_STEPS = [
  {
    label: "Cliente",
    value: "customer",
    icon: UserIcon,
    component: CustomerStep,
  },
  {
    label: "Productos",
    value: "products",
    icon: PackageIcon,
    component: ProductsStep,
  },
  {
    label: "Factura",
    value: "invoice",
    icon: ReceiptIcon,
    component: InvoiceDetailsStep,
  },
  {
    label: "Resumen",
    value: "summary",
    icon: ListChecksIcon,
    component: ReviewStep,
  },
];

interface InvoiceCreateError extends Error {
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

const InvoiceForm: FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAkinaSandbox } = useCredentialsContext();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerDetailResult | null>(null);
  const prevStepIndexRef = useRef(currentStepIndex);

  const methods = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customer: {
        identification: "",
        dv: "",
        identificationDocumentId: IdentityDocumentTypeId.CitizenshipId,
        legalOrganizationId: "2",
        tributeId: "18",
        name: "",
        tradeName: "",
        address: "",
        email: "",
        phone: "",
        municipalityId: "",
      },

      // Items
      items: [],

      // Invoice details
      numberingRangeId: isAkinaSandbox ? 8 : undefined,
      observation: "",
      paymentForm: PaymentFormCode.CashPayment,
      paymentDueDate: "",
      paymentMethodCode: PaymentMethodCode.Cash,
      sendEmail: true,
    },
  });

  const currentStep = FORM_STEPS[currentStepIndex];
  const CurrentStepComponent = currentStep?.component;
  const isReviewStep = currentStep?.value === "summary";

  const stepProps = (() => {
    if (currentStep?.value === "customer") {
      return {
        selectedCustomer,
        onSelectedCustomerChange: setSelectedCustomer,
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
  ): FieldPath<InvoiceFormValues>[] => {
    switch (stepValue) {
      case "customer":
        return [
          "customer.identification",
          "customer.dv",
          "customer.identificationDocumentId",
          "customer.legalOrganizationId",
          "customer.tributeId",
          "customer.name",
          "customer.tradeName",
          "customer.address",
          "customer.email",
          "customer.phone",
          "customer.municipalityId",
        ];
      case "products":
        return ["items"];
      case "invoice":
        return [
          "numberingRangeId",
          "observation",
          "paymentForm",
          "paymentDueDate",
          "paymentMethodCode",
          "sendEmail",
        ];
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
    mutationFn: async (values: InvoiceFormValues) => {
      const res = await api.invoices.post(values);

      if (res.error) {
        const error = new Error(
          getApiErrorMessage(res.error, "Error al crear la factura"),
        ) as InvoiceCreateError;
        error.validationErrors = extractValidationErrors(res.error);
        throw error;
      }

      return res.data;
    },
    onSuccess: (invoice) => {
      setRedirecting(true);
      setIsConfirmOpen(false);
      toast.success("Factura creada exitosamente");
      void queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
      router.replace(`/dashboard/invoices/${invoice.id}`);
    },
    onError: (error: InvoiceCreateError) => {
      setRedirecting(false);
      setIsConfirmOpen(false);
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

  const onConfirmSubmit = () => {
    void methods.handleSubmit(
      (values) => {
        mutate(values);
      },
      () => {
        setIsConfirmOpen(false);
        toast.error("Revisa los campos requeridos antes de crear la factura");
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
          <FieldLabel htmlFor="invoice-form-progress">
            <span>{currentStep?.label ?? "Paso"}</span>
            <span className="ml-auto">
              {currentStepNumber}/{totalSteps}
            </span>
          </FieldLabel>
          <Progress value={progressValue} id="invoice-form-progress" />
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
                  Crear factura
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
            <AlertDialogTitle>Emitir factura electrónica</AlertDialogTitle>
            <AlertDialogDescription>
              Se enviará la factura a Factus para validación DIAN. Esta acción
              puede tardar unos segundos.
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
              Enviar factura
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormProvider>
  );
};

export default InvoiceForm;

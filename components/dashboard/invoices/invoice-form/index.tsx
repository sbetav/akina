"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";
import { useCredentialsContext } from "@/contexts/credentials-context";
import type { CustomerDetailResult } from "@/elysia/modules/customers";
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

const InvoiceForm: FC = () => {
  const { isAkinaSandbox } = useCredentialsContext();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
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

  const onSubmit = methods.handleSubmit((_values) => {
    toast.info("Envío de factura pendiente por implementar");
  });

  useEffect(() => {
    if (prevStepIndexRef.current !== currentStepIndex) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      prevStepIndexRef.current = currentStepIndex;
    }
  }, [currentStepIndex]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-6">
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
                <Button type="button" variant="secondary" onClick={prevStep}>
                  <ArrowLeftIcon />
                  Anterior
                </Button>
              )}

              {isLastStep ? (
                <Button key="submit" type="submit">
                  Crear factura
                </Button>
              ) : (
                <Button
                  key="next"
                  type="button"
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
    </FormProvider>
  );
};

export default InvoiceForm;

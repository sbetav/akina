"use client";

import { PaymentFormCodeInfo, PaymentMethodCodeInfo } from "factus-js";
import { PackageIcon, PencilIcon, ReceiptIcon, UserIcon } from "lucide-react";
import type { ComponentType, FC } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { formatPhoneNumber } from "react-phone-number-input";
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import {
  formatPercentagePoints,
  normalizeDiscountRate,
} from "@/components/dashboard/products/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNumberingRangesCatalog } from "@/hooks/factus/use-numbering-ranges";
import { COP } from "@/lib/utils";
import type { InvoiceFormValues } from "@/lib/validations/invoice";

export interface ReviewStepProps {
  onEditStep?: (stepIndex: number) => void;
}

// Map identity document type IDs to labels
const IDENTITY_DOCUMENT_LABELS: Record<string, string> = {
  "1": "Cédula de ciudadanía",
  "2": "NIT",
  "3": "Pasaporte",
  "4": "Tarjeta de extranjería",
  "5": "Cédula de extranjería",
  "6": "PEP",
  "7": "Registro civil",
  "8": "Tarjeta de identidad",
};

const LEGAL_ORGANIZATION_LABELS: Record<string, string> = {
  "1": "Persona jurídica",
  "2": "Persona natural",
};

const TRIBUTE_LABELS: Record<string, string> = {
  "18": "IVA",
  "21": "No aplica",
  "22": "No aplica - Persona natural",
};

// --- Sub-components ---

interface SectionHeaderProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  stepIndex: number;
  onEditStep?: (stepIndex: number) => void;
}

const SectionHeader: FC<SectionHeaderProps> = ({
  icon: Icon,
  title,
  stepIndex,
  onEditStep,
}) => (
  <div className="mb-4 flex items-center justify-between gap-2">
    <div className="flex items-center gap-2">
      <div className="bg-primary/10 text-primary flex size-6 items-center justify-center">
        <Icon className="size-3.5" />
      </div>
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
    </div>
    <Button
      type="button"
      size="xs"
      variant="default-subtle"
      onClick={() => onEditStep?.(stepIndex)}
      className="gap-1.5"
    >
      <PencilIcon className="size-3" />
      Editar
    </Button>
  </div>
);

interface FieldRowProps {
  label: string;
  value?: string | null;
  colSpan?: boolean;
}

const FieldRow: FC<FieldRowProps> = ({ label, value, colSpan }) => (
  <div className={colSpan ? "lg:col-span-2" : ""}>
    <p className="text-muted-foreground mb-0.5 text-xs">{label}</p>
    <p className="text-foreground truncate text-sm font-medium">
      {value?.trim().length ? value : "N/A"}
    </p>
  </div>
);

// --- Main Component ---

const ReviewStep: FC<ReviewStepProps> = ({ onEditStep }) => {
  const { control } = useFormContext<InvoiceFormValues>();
  const { data: numberingRanges = [] } = useNumberingRangesCatalog();

  const customer = useWatch({ control, name: "customer" });
  const items = useWatch({ control, name: "items" }) ?? [];
  const numberingRangeId = useWatch({ control, name: "numberingRangeId" });
  const paymentForm = useWatch({ control, name: "paymentForm" });
  const paymentDueDate = useWatch({ control, name: "paymentDueDate" });
  const paymentMethodCode = useWatch({ control, name: "paymentMethodCode" });
  const observation = useWatch({ control, name: "observation" });
  const sendEmail = useWatch({ control, name: "sendEmail" });

  const subtotal = items.reduce((sum, item) => {
    const discountRate = normalizeDiscountRate(item.discountRate);
    return sum + item.price * item.quantity * (1 - discountRate / 100);
  }, 0);
  const taxes = items.reduce((sum, item) => {
    if (item.isExcluded) return sum;
    const discountRate = normalizeDiscountRate(item.discountRate);
    const baseAmount = item.price * item.quantity * (1 - discountRate / 100);
    return sum + baseAmount * item.taxRate;
  }, 0);
  const total = subtotal + taxes;
  const discountTotal = items.reduce((sum, item) => {
    const discountRate = normalizeDiscountRate(item.discountRate);
    return sum + item.price * item.quantity * (discountRate / 100);
  }, 0);

  const identificationLabel = customer?.identificationDocumentId
    ? (IDENTITY_DOCUMENT_LABELS[String(customer.identificationDocumentId)] ??
      `Tipo ${customer.identificationDocumentId}`)
    : null;
  const numberingRangeLabel = numberingRangeId
    ? numberingRanges.find((range) => range.id === numberingRangeId)
    : undefined;
  const formattedPhone = customer?.phone
    ? (formatPhoneNumber(customer.phone) ?? customer.phone)
    : null;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Resumen</PageHeaderTitle>
          <PageHeaderDescription>
            Revisa la información antes de crear la factura
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <div className="flex flex-col gap-6">
        {/* ── CUSTOMER ───────────────────────────── */}
        <section>
          <SectionHeader
            icon={UserIcon}
            title="Cliente"
            stepIndex={0}
            onEditStep={onEditStep}
          />

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <FieldRow
              label="Nombre / Razón social"
              value={customer?.tradeName || customer?.name}
            />
            <FieldRow label="Correo electrónico" value={customer?.email} />
            <FieldRow label="Teléfono" value={formattedPhone} />
            <FieldRow label="Tipo de documento" value={identificationLabel} />
            <FieldRow
              label="Número de documento"
              value={
                customer?.identification
                  ? `${customer.identification}${customer.dv ? `-${customer.dv}` : ""}`
                  : null
              }
            />
            <FieldRow
              label="Tipo de organización"
              value={
                customer?.legalOrganizationId
                  ? LEGAL_ORGANIZATION_LABELS[
                      String(customer.legalOrganizationId)
                    ]
                  : null
              }
            />
            <FieldRow
              label="Régimen tributario"
              value={
                customer?.tributeId
                  ? TRIBUTE_LABELS[String(customer.tributeId)]
                  : null
              }
            />
            <FieldRow label="Municipio" value={customer?.municipalityId} />
            <FieldRow label="Dirección" value={customer?.address} />
          </div>
        </section>

        <Separator />

        {/* ── PRODUCTS ───────────────────────────── */}
        <section>
          <SectionHeader
            icon={PackageIcon}
            title="Productos"
            stepIndex={1}
            onEditStep={onEditStep}
          />

          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Sin productos agregados
            </p>
          ) : (
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* LEFT — TABLE */}
              <div className="border-border/60 flex-1 overflow-hidden border text-xs">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead>Producto</TableHead>

                      <TableHead className="hidden text-right sm:table-cell">
                        Cant.
                      </TableHead>

                      <TableHead className="hidden text-right sm:table-cell">
                        Precio unit.
                      </TableHead>

                      <TableHead className="hidden text-right md:table-cell">
                        Dto.
                      </TableHead>

                      <TableHead className="hidden text-right md:table-cell">
                        IVA
                      </TableHead>

                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {items.map((item) => {
                      const discountRate = normalizeDiscountRate(
                        item.discountRate,
                      );
                      const lineBase =
                        item.price * item.quantity * (1 - discountRate / 100);

                      const lineTotal = item.isExcluded
                        ? lineBase
                        : lineBase * (1 + item.taxRate);

                      return (
                        <TableRow key={item.productId}>
                          <TableCell>
                            <p className="max-w-[180px] truncate font-medium">
                              {item.name}
                            </p>

                            {item.isExcluded && (
                              <Badge
                                variant="secondary"
                                className="mt-0.5 text-[10px]"
                              >
                                Excluido
                              </Badge>
                            )}

                            <p className="text-muted-foreground mt-0.5 text-xs sm:hidden">
                              {item.quantity} × {COP.format(item.price)}
                            </p>
                          </TableCell>

                          <TableCell className="text-muted-foreground hidden text-right sm:table-cell">
                            {item.quantity}
                          </TableCell>

                          <TableCell className="text-muted-foreground hidden text-right sm:table-cell">
                            {COP.format(item.price)}
                          </TableCell>

                          <TableCell className="hidden text-right md:table-cell">
                            {discountRate > 0 ? (
                              <span className="text-amber-400">
                                {formatPercentagePoints(discountRate)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>

                          <TableCell className="hidden text-right md:table-cell">
                            {item.isExcluded ? (
                              <span className="text-muted-foreground text-xs">
                                Excluido
                              </span>
                            ) : item.taxRate > 0 ? (
                              <span>{(item.taxRate * 100).toFixed(0)}%</span>
                            ) : (
                              <span className="text-muted-foreground">0%</span>
                            )}
                          </TableCell>

                          <TableCell className="text-right font-medium">
                            {COP.format(lineTotal)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* RIGHT — SUMMARY */}
              <div className="border-border/60 w-full overflow-hidden border text-xs lg:w-[280px]">
                {/* Header */}
                <div className="bg-muted/40 border-border/60 border-b px-3 py-2">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Resumen
                  </p>
                </div>

                <Table className="text-xs">
                  <TableBody>
                    <TableRow className="border-b-0">
                      <TableCell className="text-muted-foreground">
                        Subtotal
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {COP.format(subtotal)}
                      </TableCell>
                    </TableRow>

                    {discountTotal > 0 && (
                      <TableRow className="border-b-0">
                        <TableCell className="text-amber-400">
                          Descuentos
                        </TableCell>
                        <TableCell className="text-right font-medium text-amber-400 tabular-nums">
                          - {COP.format(discountTotal)}
                        </TableCell>
                      </TableRow>
                    )}

                    <TableRow className="border-b-0">
                      <TableCell className="text-muted-foreground">
                        Impuestos
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {COP.format(taxes)}
                      </TableCell>
                    </TableRow>

                    <TableRow className="bg-muted/30 border-b-0">
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {COP.format(total)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </section>

        <Separator />

        {/* ── INVOICE DETAILS ────────────────────── */}
        <section>
          <SectionHeader
            icon={ReceiptIcon}
            title="Detalles de factura"
            stepIndex={2}
            onEditStep={onEditStep}
          />

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <FieldRow
              label="Rango de numeración"
              value={
                numberingRangeLabel
                  ? `${numberingRangeLabel.prefix} · ${numberingRangeLabel.document}`
                  : null
              }
            />
            <FieldRow
              label="Forma de pago"
              value={
                paymentForm
                  ? PaymentFormCodeInfo[paymentForm]?.description
                  : null
              }
            />
            <FieldRow
              label="Método de pago"
              value={
                paymentMethodCode
                  ? PaymentMethodCodeInfo[paymentMethodCode]?.description
                  : null
              }
            />
            <FieldRow
              label="Fecha de vencimiento"
              value={paymentDueDate || null}
            />

            {/* Send email — visual boolean */}
            <div>
              <p className="text-muted-foreground mb-0.5 text-xs">
                Envío por correo
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">
                  {sendEmail ? "Sí, enviar al cliente" : "No enviar"}
                </span>
              </div>
            </div>

            {/* Observation — full width */}
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-muted-foreground mb-0.5 text-xs">
                Observación
              </p>
              {observation ? (
                <p className="bg-muted/40 text-muted-foreground border-border/50 border px-3 py-1.5 text-xs leading-relaxed font-medium">
                  {observation}
                </p>
              ) : (
                <p className="text-sm">N/A</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReviewStep;

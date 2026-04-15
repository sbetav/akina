"use client";

import {
  PaymentMethodCodeInfo,
  SupportDocumentIdentityTypeId,
  SupportDocumentIdentityTypeIdInfo,
} from "factus-js";
import { FileTextIcon, PackageIcon, PencilIcon, TruckIcon } from "lucide-react";
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
import { getInvoiceLineTotal, getInvoiceTotals } from "@/lib/invoices/utils";
import { COP } from "@/lib/utils";
import type { SupportDocumentFormValues } from "@/lib/validations/support-document";

export interface ReviewStepProps {
  onEditStep?: (stepIndex: number) => void;
}

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
  const { control } = useFormContext<SupportDocumentFormValues>();
  const { data: numberingRanges = [] } = useNumberingRangesCatalog();

  const provider = useWatch({ control, name: "provider" });
  const items = useWatch({ control, name: "items" }) ?? [];
  const numberingRangeId = useWatch({ control, name: "numberingRangeId" });
  const paymentMethodCode = useWatch({ control, name: "paymentMethodCode" });
  const observation = useWatch({ control, name: "observation" });

  const { subtotal, taxes, total, discountTotal } = getInvoiceTotals(items);

  const numberingRangeLabel = numberingRangeId
    ? numberingRanges.find((range) => range.id === numberingRangeId)
    : undefined;

  const formattedPhone = provider?.phone
    ? (formatPhoneNumber(provider.phone) ?? provider.phone)
    : null;

  const idInfo = provider?.identificationDocumentId
    ? SupportDocumentIdentityTypeIdInfo[
        provider.identificationDocumentId as SupportDocumentIdentityTypeId
      ]
    : null;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Resumen</PageHeaderTitle>
          <PageHeaderDescription>
            Revisa la información antes de crear el documento soporte
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>

      <div className="flex flex-col gap-6">
        {/* ── PROVIDER ───────────────────────────── */}
        <section>
          <SectionHeader
            icon={TruckIcon}
            title="Proveedor"
            stepIndex={0}
            onEditStep={onEditStep}
          />

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <FieldRow
              label="Nombre / Razón social"
              value={provider?.tradeName || provider?.names}
            />
            <FieldRow label="Correo electrónico" value={provider?.email} />
            <FieldRow label="Teléfono" value={formattedPhone} />
            <FieldRow
              label="Tipo de documento"
              value={idInfo?.description ?? null}
            />
            <FieldRow
              label="Número de documento"
              value={
                provider?.identification
                  ? `${provider.identification}${provider.dv ? `-${provider.dv}` : ""}`
                  : null
              }
            />
            <FieldRow label="País" value={provider?.countryCode} />
            <FieldRow label="Municipio" value={provider?.municipalityId} />
            <FieldRow label="Dirección" value={provider?.address} />
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
                      const lineTotal = getInvoiceLineTotal(item);
                      const discountRate = normalizeDiscountRate(
                        item.discountRate,
                      );

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
                <div className="bg-muted/40 border-border/60 border-b px-3 py-2">
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Totales
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

        {/* ── DOCUMENT DETAILS ───────────────────── */}
        <section>
          <SectionHeader
            icon={FileTextIcon}
            title="Detalles del documento"
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
              label="Método de pago"
              value={
                paymentMethodCode
                  ? PaymentMethodCodeInfo[paymentMethodCode]?.description
                  : null
              }
            />

            {/* Observation — full width */}
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-muted-foreground mb-0.5 text-xs">
                Observación
              </p>
              {observation ? (
                <p className="bg-muted/40 border-border/50 w-fit border px-3 py-1.5 text-xs leading-relaxed font-medium">
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

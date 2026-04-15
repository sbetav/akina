"use client";

import { IdentityDocumentTypeIdInfo } from "factus-js";
import type { FC } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { getInvoiceTotals } from "@/lib/invoices/utils";
import { COP, formatDocumentNumber } from "@/lib/utils";
import type { InvoiceFormValues } from "@/lib/validations/invoice";
import DashboardCard from "../../dashboard-card";

const SummaryCard: FC = () => {
  const { control } = useFormContext<InvoiceFormValues>();

  const customer = useWatch({ control, name: "customer" });
  const customerName = customer?.tradeName || customer?.name;

  const items = useWatch({ control, name: "items" }) ?? [];
  const { subtotal, taxes, total } = getInvoiceTotals(items);

  return (
    <DashboardCard className="flex flex-col gap-4">
      <h3 className="font-semibold">Resumen</h3>

      <Separator />
      <div className="space-y-1.5 text-xs">
        {!customerName.length && (
          <p className="text-muted-foreground">Cliente</p>
        )}

        <p className="font-medium">
          {customerName.length ? customerName : "N/A"}
        </p>

        {customer?.identification && (
          <p className="text-muted-foreground">
            {customer.identificationDocumentId
              ? IdentityDocumentTypeIdInfo[customer.identificationDocumentId]
                  ?.abbreviation
              : ""}{" "}
            {formatDocumentNumber(customer.identification)}
            {customer.dv ? `-${customer.dv}` : ""}
          </p>
        )}
      </div>

      <Separator />
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Productos</span>
          <span className="font-medium">{items.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{COP.format(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Impuestos</span>
          <span>{COP.format(taxes)}</span>
        </div>
      </div>

      <Separator />
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>Total</span>
        <span>{COP.format(total)}</span>
      </div>
    </DashboardCard>
  );
};

export default SummaryCard;

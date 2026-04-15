"use client";

import {
  SupportDocumentIdentityTypeId,
  SupportDocumentIdentityTypeIdInfo,
} from "factus-js";
import type { FC } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { getInvoiceTotals } from "@/lib/invoices/utils";
import { COP, formatDocumentNumber } from "@/lib/utils";
import type { SupportDocumentFormValues } from "@/lib/validations/support-document";
import DashboardCard from "../../dashboard-card";

const SummaryCard: FC = () => {
  const { control } = useFormContext<SupportDocumentFormValues>();

  const provider = useWatch({ control, name: "provider" });
  const providerName = provider?.tradeName || provider?.names;

  const items = useWatch({ control, name: "items" }) ?? [];
  const { subtotal, taxes, total } = getInvoiceTotals(items);

  const idInfo = provider?.identificationDocumentId
    ? SupportDocumentIdentityTypeIdInfo[
        provider.identificationDocumentId as SupportDocumentIdentityTypeId
      ]
    : null;

  return (
    <DashboardCard className="flex flex-col gap-4">
      <h3 className="font-semibold">Resumen</h3>

      <Separator />
      <div className="space-y-1.5 text-xs">
        {!providerName?.length && (
          <p className="text-muted-foreground">Proveedor</p>
        )}

        <p className="font-medium">
          {providerName?.length ? providerName : "N/A"}
        </p>

        {provider?.identification && (
          <p className="text-muted-foreground">
            {idInfo?.abbreviation ?? ""}{" "}
            {formatDocumentNumber(provider.identification)}
            {provider.dv ? `-${provider.dv}` : ""}
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

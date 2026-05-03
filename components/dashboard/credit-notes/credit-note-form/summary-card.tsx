"use client";

import type { FC } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import DashboardCard from "@/components/dashboard/dashboard-card";
import { COP } from "@/lib/utils";
import type { CreditNoteFormValues } from "@/lib/validations/credit-note";

interface SummaryCardProps {
  invoiceNumber: string;
  customerName: string;
}

const SummaryCard: FC<SummaryCardProps> = ({ invoiceNumber, customerName }) => {
  const { control } = useFormContext<CreditNoteFormValues>();
  const items = useWatch({ control, name: "items" }) ?? [];

  const selectedItems = items.filter((item) => item.quantity > 0);
  const selectedTotal = selectedItems.reduce(
    (sum, item) =>
      sum + item.price * item.quantity * (1 - item.discountRate / 100),
    0,
  );

  return (
    <DashboardCard className="space-y-4">
      <div>
        <h3 className="font-sans text-lg font-medium">Resumen</h3>
        <p className="text-muted-foreground text-xs">
          Factura origen {invoiceNumber}
        </p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Cliente</span>
          <span className="text-right font-medium">{customerName}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Ítems seleccionados</span>
          <span className="font-medium">{selectedItems.length}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Total estimado</span>
          <span className="font-semibold">{COP.format(selectedTotal)}</span>
        </div>
      </div>
    </DashboardCard>
  );
};

export default SummaryCard;

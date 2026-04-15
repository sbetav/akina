"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import { InvoiceDownloadPdfButton } from "@/components/dashboard/invoices/invoice-download-pdf-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { InvoiceRecordResult } from "@/elysia/modules/invoices/service";
import { getInvoiceStatusDisplay } from "@/lib/invoices/utils";
import { COP, formatDocumentNumber } from "@/lib/utils";

function InvoiceActions({ invoice }: { invoice: InvoiceRecordResult }) {
  return (
    <div className="flex items-center justify-end gap-2">
      <InvoiceDownloadPdfButton
        invoiceId={invoice.id}
        invoiceNumber={invoice.number}
        label="PDF"
        size="sm"
        variant="default-subtle"
      />

      <Link
        href={`/dashboard/invoices/${invoice.id}`}
        className={buttonVariants({ size: "sm", variant: "secondary" })}
      >
        <EyeIcon />
        Ver
      </Link>
    </div>
  );
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<InvoiceRecordResult>[] = [
  {
    accessorKey: "number",
    header: "N° Factura",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return <span className="text-muted-foreground">{value}</span>;
    },
  },
  {
    accessorKey: "customerName",
    header: "Cliente",
  },
  {
    accessorKey: "customerIdentification",
    header: "Identificación",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return (
        <span className="text-muted-foreground">
          {formatDocumentNumber(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      if (!value) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="text-muted-foreground">
          {COP.format(parseFloat(value))}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue<number>();
      const config = getInvoiceStatusDisplay(value);
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    id: "actions",
    maxSize: 220,
    cell: ({ row }) => {
      const invoice = row.original;

      return <InvoiceActions invoice={invoice} />;
    },
  },
];

export { columns };

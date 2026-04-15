"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { SupportDocumentRecordResult } from "@/elysia/modules/support-documents/service";
import { getInvoiceStatusDisplay } from "@/lib/invoices/utils";
import { COP, formatDocumentNumber } from "@/lib/utils";
import { SupportDocumentDownloadPdfButton } from "../support-document-download-pdf-button";

function SupportDocumentActions({
  document,
}: {
  document: SupportDocumentRecordResult;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <SupportDocumentDownloadPdfButton
        documentId={document.id}
        documentNumber={document.number}
        label="PDF"
        size="sm"
        variant="default-subtle"
      />
      <Link
        href={`/dashboard/support-documents/${document.id}`}
        className={buttonVariants({ size: "sm", variant: "secondary" })}
      >
        <EyeIcon />
        Ver
      </Link>
    </div>
  );
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<SupportDocumentRecordResult>[] = [
  {
    accessorKey: "number",
    header: "N° Documento",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return <span className="text-muted-foreground">{value}</span>;
    },
  },
  {
    accessorKey: "providerName",
    header: "Proveedor",
  },
  {
    accessorKey: "providerIdentification",
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
    maxSize: 160,
    cell: ({ row }) => {
      const document = row.original;
      return <SupportDocumentActions document={document} />;
    },
  },
];

export { columns };

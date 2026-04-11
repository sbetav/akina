"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InvoiceRecordResult } from "@/elysia/modules/invoices/service";
import { COP } from "@/lib/utils";

// ─── Status display ───────────────────────────────────────────────────────────

const invoiceStatusConfig: Record<
  number,
  { label: string; variant: "warning" | "teal" }
> = {
  0: { label: "Pendiente", variant: "warning" },
  1: { label: "Validada", variant: "teal" },
};

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
      return <span className="text-muted-foreground">{value}</span>;
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
      const config = invoiceStatusConfig[value] ?? {
        label: String(value),
        variant: "warning" as const,
      };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    id: "actions",
    maxSize: 60,
    cell: ({ row }) => {
      const invoice = row.original;
      return (
        <div className="grid place-items-end!">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground active:text-foreground"
            render={<Link href={`/dashboard/invoices/${invoice.id}`} />}
          >
            <EyeIcon />
          </Button>
        </div>
      );
    },
  },
];

export { columns };

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { VariantProps } from "class-variance-authority";
import type { Tribute } from "factus-js";
import { SquarePenIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { type FC, useState } from "react";
import EllipsisIcon from "@/components/icons/ellipsis-icon";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProductDetailResult } from "@/elysia/modules/products/service";
import { COP } from "@/lib/utils";
import DeleteProductDialog from "../delete-product-dialog";

/** Cycles for every numeric `tributeId` (and future codes). */
const tributeBadgePalette = [
  "teal",
  "cyan",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
] as const satisfies readonly NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>[];

function tributeBadgeVariant(
  id: string,
): NonNullable<VariantProps<typeof badgeVariants>["variant"]> {
  const n = Number(id);
  if (!Number.isFinite(n) || n < 1) {
    return "info";
  }
  return tributeBadgePalette[(Math.trunc(n) - 1) % tributeBadgePalette.length];
}

function formatTaxRate(rate: number): string {
  if (rate === 0) return "0%";
  return `${+(rate * 100).toFixed(2)}%`;
}

// ─── Row actions cell ─────────────────────────────────────────────────────────

interface RowActionsCellProps {
  product: ProductDetailResult;
}

const RowActionsCell: FC<RowActionsCellProps> = ({ product }) => {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="grid place-items-end!">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground active:text-foreground"
            >
              <EllipsisIcon />
            </Button>
          }
        />
        <DropdownMenuContent side="left">
          <DropdownMenuGroup>
            <DropdownMenuItem
              render={
                <Link href={`/dashboard/products/edit/${product.id}`}>
                  <SquarePenIcon className="mt-px" />
                  Editar
                </Link>
              }
            />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setShowDelete(true)}
            >
              <Trash2Icon className="mt-px" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteProductDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        products={[product]}
      />
    </div>
  );
};

// ─── Columns factory ──────────────────────────────────────────────────────────

export function buildColumns(
  tributes: Tribute[],
): ColumnDef<ProductDetailResult>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "code",
      header: "Código",
      cell: ({ getValue }) => {
        const value = getValue<string>();
        return <Badge variant="info">{value}</Badge>;
      },
    },
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "price",
      header: "Precio",
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return (
          <span className="text-muted-foreground">{COP.format(value)}</span>
        );
      },
    },
    {
      accessorKey: "tributeId",
      header: "Tributo",
      cell: ({ getValue }) => {
        const value = getValue<string>();
        const label =
          tributes.find((t) => t.id.toString() === value)?.name ?? value;
        return <Badge variant={tributeBadgeVariant(value)}>{label}</Badge>;
      },
    },
    {
      accessorKey: "taxRate",
      header: "Tasa",
      cell: ({ row }) => {
        const { isExcluded, taxRate } = row.original;
        if (isExcluded) {
          return <Badge variant="warning">Excluido</Badge>;
        }
        return (
          <span className="text-muted-foreground tabular-nums">
            {formatTaxRate(taxRate)}
          </span>
        );
      },
    },
    {
      id: "actions",
      maxSize: 100,
      cell: ({ row }) => {
        const product = row.original;
        return <RowActionsCell product={product} />;
      },
    },
  ];
}

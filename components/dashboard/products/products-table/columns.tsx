"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { VariantProps } from "class-variance-authority";
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
import type { ProductListItem } from "@/elysia/modules/products/service";
import { COP } from "@/lib/utils";
import DeleteProductDialog from "../delete-product-dialog";

const productTypePalette: Record<
  string,
  NonNullable<VariantProps<typeof badgeVariants>["variant"]>
> = {
  product: "teal",
  service: "violet",
};

const productTypeLabels: Record<string, string> = {
  product: "Producto",
  service: "Servicio",
};

// ─── Row actions cell ─────────────────────────────────────────────────────────

interface RowActionsCellProps {
  product: ProductListItem;
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

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<ProductListItem>[] = [
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
      return <span className="text-muted-foreground">{COP.format(value)}</span>;
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      const variant = productTypePalette[value] ?? "info";
      return (
        <Badge variant={variant}>{productTypeLabels[value] ?? value}</Badge>
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

export { columns };

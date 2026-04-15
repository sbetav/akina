"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { VariantProps } from "class-variance-authority";
import {
  SupportDocumentIdentityTypeId,
  SupportDocumentIdentityTypeIdInfo,
} from "factus-js";
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
import type { ProviderDetailResult } from "@/elysia/modules/providers";
import { formatDocumentNumber } from "@/lib/utils";
import DeleteProviderDialog from "../delete-provider-dialog";

const supportDocumentIdentityTypes = Object.values(
  SupportDocumentIdentityTypeId,
);

/** Cycles for every `SupportDocumentIdentityTypeId` value. */
const identityDocumentBadgePalette = [
  "teal",
  "cyan",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
] as const satisfies readonly NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>[];

function identityDocumentBadgeVariant(
  id: string,
): NonNullable<VariantProps<typeof badgeVariants>["variant"]> {
  const n = Number(id);
  if (!Number.isFinite(n) || n < 1) {
    return "info";
  }
  return identityDocumentBadgePalette[
    (Math.trunc(n) - 1) % identityDocumentBadgePalette.length
  ];
}

// ─── Row actions cell ─────────────────────────────────────────────────────────

interface RowActionsCellProps {
  provider: ProviderDetailResult;
}

const RowActionsCell: FC<RowActionsCellProps> = ({ provider }) => {
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
                <Link href={`/dashboard/providers/edit/${provider.id}`}>
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

      <DeleteProviderDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        providers={[provider]}
      />
    </div>
  );
};

// ─── Columns ──────────────────────────────────────────────────────────────────

const columns: ColumnDef<ProviderDetailResult>[] = [
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
    accessorKey: "identificationDocumentId",
    header: "Tipo DOC.",
    cell: ({ getValue }) => {
      const id = getValue<string>();
      const match = supportDocumentIdentityTypes.find((doc) => doc === id);

      return (
        <Badge variant={identityDocumentBadgeVariant(id)}>
          {match ? SupportDocumentIdentityTypeIdInfo[match]?.abbreviation : id}
        </Badge>
      );
    },
  },
  {
    accessorKey: "identification",
    header: "N\u00BA Documento",
    cell: ({ row }) => {
      const value = row.original.identification;
      const dv = row.original.dv;
      const formatted = formatDocumentNumber(value);
      return (
        <span className="text-muted-foreground">
          {dv ? `${formatted}-${dv}` : formatted}
        </span>
      );
    },
  },
  {
    accessorKey: "names",
    header: "Nombre / Razón social",
  },
  {
    accessorKey: "email",
    header: "Correo electrónico",
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return (
        <span className="text-muted-foreground">
          {value?.length ? value : "N/A"}
        </span>
      );
    },
  },
  {
    id: "actions",
    maxSize: 100,
    cell: ({ row }) => {
      const provider = row.original;
      return <RowActionsCell provider={provider} />;
    },
  },
];

export { columns };

import EllipsisIcon from "@/components/icons/ellipsis-icon";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerListItem } from "@/lib/elysia/modules/customers";
import { formatDocumentNumber } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { type VariantProps } from "class-variance-authority";
import { IdentityDocumentTypeId } from "factus-js";
import { SquarePenIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

const identityDocumentTypes = Object.values(IdentityDocumentTypeId);

/** Cycles for every `IdentityDocumentTypeId` value (and future numeric codes). */
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

const columns: ColumnDef<CustomerListItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() ? true : false)
        }
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
      return (
        <Badge variant={identityDocumentBadgeVariant(id)}>
          {identityDocumentTypes.find((d) => String(d.value) === id)
            ?.abbreviation ?? id}
        </Badge>
      );
    },
  },
  {
    accessorKey: "identification",
    header: "Nº Documento",
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
    accessorKey: "name",
    header: "Nombre Completo",
  },
  {
    accessorKey: "email",
    header: "Correo electrónico",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return <span className="text-muted-foreground">{value}</span>;
    },
  },
  {
    id: "actions",
    maxSize: 100,
    cell: ({ row }) => {
      const customer = row.original;
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
                    <Link href={`/dashboard/customers/edit/${customer.id}`}>
                      <SquarePenIcon className="mt-px" />
                      Editar
                    </Link>
                  }
                />
                <DropdownMenuItem
                  variant="destructive"
                  // onClick={() => setShowDelete(true)}
                >
                  <Trash2Icon className="mt-px" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export { columns };

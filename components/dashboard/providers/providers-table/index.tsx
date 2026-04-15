"use client";

import {
  getCoreRowModel,
  type RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import { PlusIcon, SearchIcon, Trash2Icon, TruckIcon } from "lucide-react";
import Link from "next/link";
import { type FC, useState } from "react";
import ErrorFallback from "@/components/error-fallback";
import { Button, buttonVariants } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DataTableControls } from "@/components/ui/data-table-controls";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useCredentialsContext } from "@/contexts/credentials-context";
import { useProviders } from "@/hooks/api/use-providers";
import { DEFAULT_PROVIDERS_LIMIT } from "@/lib/query-keys";
import DeleteProviderDialog from "../delete-provider-dialog";
import { columns } from "./columns";

export default function ProvidersTable() {
  const { active } = useCredentialsContext();

  return <ProvidersTableContent key={active?.id} />;
}

function ProvidersTableContent() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PROVIDERS_LIMIT);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const {
    data,
    error,
    isError,
    isFetching,
    isPending,
    refetch,
    debouncedSearch,
  } = useProviders({
    search,
    page,
    limit,
    paginated: true,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const pageCount = Math.max(1, Math.ceil(total / limit));

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      pagination: { pageIndex: page - 1, pageSize: limit },
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedProviders = selectedRows.map((row) => row.original);

  const handleBulkDeleteSuccess = () => {
    setRowSelection({});
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      {isPending ? (
        <>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="w-full flex-1" />
        </>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <InputGroup className="flex-1">
              <InputGroupAddon align="inline-start">
                <SearchIcon className="text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Buscar por nombre o número de documento..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {isFetching && (
                <InputGroupAddon align="inline-end">
                  <Spinner className="text-muted-foreground" />
                </InputGroupAddon>
              )}
            </InputGroup>

            {selectedProviders.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setShowBulkDelete(true)}
                size="lg"
              >
                <Trash2Icon />
                Eliminar ({selectedProviders.length})
              </Button>
            )}
          </div>

          {isError ? (
            <ErrorFallback
              title="Error al obtener los proveedores"
              message={error?.message}
              onRetry={() => void refetch()}
              isRetrying={isFetching}
            />
          ) : !total ? (
            <EmptyStatus
              mode={debouncedSearch.trim() ? "not_found" : "empty"}
            />
          ) : (
            <DataTable table={table} />
          )}
        </>
      )}

      <DataTableControls
        page={page}
        pageCount={pageCount}
        limit={limit}
        totalRows={total}
        selectedRows={selectedProviders.length}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />

      <DeleteProviderDialog
        open={showBulkDelete}
        onOpenChange={(open) => {
          setShowBulkDelete(open);
          if (!open) handleBulkDeleteSuccess();
        }}
        providers={selectedProviders}
      />
    </div>
  );
}

interface EmptyStatusProps {
  mode?: "empty" | "not_found";
}

const EmptyStatus: FC<EmptyStatusProps> = ({ mode = "empty" }) => (
  <Empty fillSpace>
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <TruckIcon />
      </EmptyMedia>
      <EmptyTitle>
        {mode === "empty" ? "Sin proveedores aún" : "Sin resultados"}
      </EmptyTitle>
      <EmptyDescription className="max-w-[300px]">
        {mode === "empty"
          ? "Crea tu primer proveedor para empezar a emitir documentos soporte."
          : "No se encontraron proveedores con los criterios de búsqueda."}
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Link
        href="/dashboard/providers/new"
        className={buttonVariants({ size: "lg" })}
      >
        <PlusIcon />
        Nuevo proveedor
      </Link>
    </EmptyContent>
  </Empty>
);

"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  type RowSelectionState,
  useReactTable,
} from "@tanstack/react-table";
import type { Tribute } from "factus-js";
import { PackageIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
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
import { api } from "@/elysia/eden";
import { getApiErrorMessage } from "@/elysia/get-api-error-message";
import useDebounce from "@/hooks/ui/use-debounce";
import { DEFAULT_PRODUCTS_LIMIT, PRODUCTS_QUERY_KEY } from "@/lib/query-keys";
import DeleteProductDialog from "../delete-product-dialog";
import { buildColumns } from "./columns";

interface ProductsTableProps {
  tributes?: Tribute[];
}

export default function ProductsTable({ tributes = [] }: ProductsTableProps) {
  const { active } = useCredentialsContext();

  return <ProductsTableContent key={active?.id} tributes={tributes} />;
}

function ProductsTableContent({ tributes }: { tributes: Tribute[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PRODUCTS_LIMIT);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data, error, isError, isFetching, isPending, refetch } = useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, { search: debouncedSearch, page, limit }],
    queryFn: async () => {
      const res = await api.products.get({
        query: { search: debouncedSearch, page, limit },
      });
      if (res.error)
        throw new Error(
          getApiErrorMessage(res.error, "Error al obtener los productos"),
        );
      return res.data;
    },
    placeholderData: keepPreviousData,
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
    columns: buildColumns(tributes),
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
  const selectedProducts = selectedRows.map((row) => row.original);

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
                placeholder="Buscar por nombre o código..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {isFetching && (
                <InputGroupAddon align="inline-end">
                  <Spinner className="text-muted-foreground" />
                </InputGroupAddon>
              )}
            </InputGroup>

            {selectedProducts.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setShowBulkDelete(true)}
                size="lg"
              >
                <Trash2Icon />
                Eliminar ({selectedProducts.length})
              </Button>
            )}
          </div>

          {isError ? (
            <ErrorFallback
              title="Error al obtener los productos"
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
        selectedRows={selectedProducts.length}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />

      <DeleteProductDialog
        open={showBulkDelete}
        onOpenChange={(open) => {
          setShowBulkDelete(open);
          if (!open) handleBulkDeleteSuccess();
        }}
        products={selectedProducts}
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
        <PackageIcon />
      </EmptyMedia>
      <EmptyTitle>
        {mode === "empty" ? "Sin productos aún" : "Sin resultados"}
      </EmptyTitle>
      <EmptyDescription className="max-w-[300px]">
        {mode === "empty"
          ? "Crea tu primer producto o servicio para empezar a facturar."
          : "No se encontraron productos con los criterios de búsqueda."}
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Link
        href="/dashboard/products/new"
        className={buttonVariants({ size: "lg" })}
      >
        <PlusIcon />
        Nuevo producto
      </Link>
    </EmptyContent>
  </Empty>
);

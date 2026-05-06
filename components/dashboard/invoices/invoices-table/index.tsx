"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { PlusIcon, ReceiptIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { type FC, useEffect, useState } from "react";
import ErrorFallback from "@/components/error-fallback";
import { buttonVariants } from "@/components/ui/button";
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
import { DEFAULT_INVOICES_LIMIT, INVOICES_QUERY_KEY } from "@/lib/query-keys";
import { columns } from "./columns";

export default function InvoicesTable() {
  const { active } = useCredentialsContext();

  return <InvoicesTableContent key={active?.id} />;
}

function InvoicesTableContent() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_INVOICES_LIMIT);

  const debouncedSearch = useDebounce(search, 300);

  const [isUserFetch, setIsUserFetch] = useState(false);

  const { data, error, isError, isFetching, isPending, refetch } = useQuery({
    queryKey: [...INVOICES_QUERY_KEY, { search: debouncedSearch, page, limit }],
    queryFn: async () => {
      const res = await api.invoices.get({
        query: { search: debouncedSearch, page, limit },
      });
      if (res.error)
        throw new Error(
          getApiErrorMessage(res.error, "Error al obtener las facturas"),
        );
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    setIsUserFetch(true);
  }, [debouncedSearch, page, limit]);

  useEffect(() => {
    if (!isFetching) setIsUserFetch(false);
  }, [isFetching]);

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
  });

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
                placeholder="Buscar por cliente o número de factura..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {isFetching && isUserFetch && (
                <InputGroupAddon align="inline-end">
                  <Spinner className="text-muted-foreground" />
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>

          {isError ? (
            <ErrorFallback
              title="Error al obtener las facturas"
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
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
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
        <ReceiptIcon />
      </EmptyMedia>
      <EmptyTitle>
        {mode === "empty" ? "Sin facturas aún" : "Sin resultados"}
      </EmptyTitle>
      <EmptyDescription className="max-w-[300px]">
        {mode === "empty"
          ? "Las facturas electrónicas emitidas aparecerán aquí."
          : "No se encontraron facturas con los criterios de búsqueda."}
      </EmptyDescription>
    </EmptyHeader>

    <EmptyContent>
      <Link
        href="/dashboard/invoices/new-invoice"
        className={buttonVariants({ size: "lg" })}
      >
        <PlusIcon />
        Nueva factura
      </Link>
    </EmptyContent>
  </Empty>
);

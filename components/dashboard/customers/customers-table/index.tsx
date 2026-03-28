"use client";

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
import useDebounce from "@/hooks/use-debounce";
import { api } from "@/lib/elysia/eden";
import { CUSTOMERS_QUERY_KEY, DEFAULT_CUSTOMERS_LIMIT } from "@/lib/query-keys";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { PlusIcon, SearchIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { FC, useState } from "react";
import { columns } from "./columns";

export default function CustomersTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_CUSTOMERS_LIMIT);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isFetching, isLoading } = useQuery({
    queryKey: [
      ...CUSTOMERS_QUERY_KEY,
      { search: debouncedSearch, page, limit },
    ],
    queryFn: async () => {
      const res = await api.customers.get({
        query: { search: debouncedSearch, page, limit },
      });
      if (res.error)
        throw new Error(
          (res.error as { value?: { error?: string } }).value?.error ??
            "Error al obtener los clientes",
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

  const handleLimitChange = (limit: number) => {
    setLimit(limit);
    setPage(1);
  };

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: {
      pagination: { pageIndex: page - 1, pageSize: limit },
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-6">
      {isLoading ? (
        <>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="w-full flex-1" />
        </>
      ) : (
        <>
          <InputGroup>
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

          {!total ? (
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
        selectedRows={table.getFilteredSelectedRowModel().rows.length}
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
        <UsersIcon />
      </EmptyMedia>
      <EmptyTitle>
        {mode === "empty" ? "Sin clientes aún" : "Sin resultados"}
      </EmptyTitle>
      <EmptyDescription className="max-w-[300px]">
        {mode === "empty"
          ? "Crea tu primer cliente para empezar a emitir documentos."
          : "No se encontraron clientes con los criterios de búsqueda."}
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Link
        href="/dashboard/customers/new"
        className={buttonVariants({ size: "lg" })}
      >
        <PlusIcon />
        Nuevo cliente
      </Link>
    </EmptyContent>
  </Empty>
);

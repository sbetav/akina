"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { FileTextIcon, SearchIcon } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import ErrorFallback from "@/components/error-fallback";
import { DataTable } from "@/components/ui/data-table";
import { DataTableControls } from "@/components/ui/data-table-controls";
import {
  Empty,
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
import {
  DEFAULT_SUPPORT_DOCUMENTS_LIMIT,
  SUPPORT_DOCUMENTS_QUERY_KEY,
} from "@/lib/query-keys";
import { columns } from "./columns";

export default function SupportDocumentsTable() {
  const { active } = useCredentialsContext();

  return <SupportDocumentsTableContent key={active?.id} />;
}

function SupportDocumentsTableContent() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_SUPPORT_DOCUMENTS_LIMIT);

  const debouncedSearch = useDebounce(search, 300);

  const [isUserFetch, setIsUserFetch] = useState(false);

  const { data, error, isError, isFetching, isPending, refetch } = useQuery({
    queryKey: [
      ...SUPPORT_DOCUMENTS_QUERY_KEY,
      { search: debouncedSearch, page, limit },
    ],
    queryFn: async () => {
      const res = await api["support-documents"].get({
        query: { search: debouncedSearch, page, limit },
      });
      if (res.error)
        throw new Error(
          getApiErrorMessage(
            res.error,
            "Error al obtener los documentos soporte",
          ),
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
                placeholder="Buscar por proveedor o número de documento..."
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
              title="Error al obtener los documentos soporte"
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
        <FileTextIcon />
      </EmptyMedia>
      <EmptyTitle>
        {mode === "empty" ? "Sin documentos soporte aún" : "Sin resultados"}
      </EmptyTitle>
      <EmptyDescription className="max-w-[300px]">
        {mode === "empty"
          ? "Los documentos soporte emitidos aparecerán aquí."
          : "No se encontraron documentos soporte con los criterios de búsqueda."}
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
);

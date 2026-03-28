"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30];

/**
 * Generates an array of page numbers to render, with ellipsis gaps.
 * E.g. [1, '...', 4, 5, 6, '...', 10]
 */
function getPageRange(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (currentPage > 3) {
    pages.push("...");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("...");
  }

  pages.push(totalPages);

  return pages;
}

interface DataTablePaginationProps {
  /** Current 1-based page number. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  /** Current items-per-page value. */
  limit: number;
  /** Total number of rows currently displayed (for "X de Y" label). */
  totalRows: number;
  /** Number of selected rows (for "X de Y seleccionados" label). */
  selectedRows?: number;
  /** Called when the page changes. Receives a 1-based page number. */
  onPageChange: (page: number) => void;
  /** Called when items-per-page changes. */
  onLimitChange: (limit: number) => void;
}

export function DataTablePagination({
  page,
  pageCount,
  limit,
  totalRows,
  selectedRows = 0,
  onPageChange,
  onLimitChange,
}: DataTablePaginationProps) {
  const pageRange = getPageRange(page, pageCount);

  const handleLimitChange = (value: number | null) => {
    if (value == null) return;
    onLimitChange(value);
  };

  return (
    <div className="grid! grid-cols-3">
      <span className="text-muted-foreground text-xs uppercase">
        {selectedRows} de {totalRows} registros seleccionados
      </span>

      <div className="flex items-center gap-1 place-self-center">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          aria-label="Primera página"
        >
          <ChevronFirstIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Página anterior"
        >
          <ChevronLeftIcon />
        </Button>

        {pageRange.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="text-muted-foreground px-1 text-sm"
            >
              ...
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "secondary" : "outline"}
              size="icon"
              onClick={() => onPageChange(p)}
              aria-label={`Página ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pageCount}
          aria-label="Página siguiente"
        >
          <ChevronRightIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(pageCount)}
          disabled={page === pageCount}
          aria-label="Última página"
        >
          <ChevronLastIcon />
        </Button>
      </div>

      <div className="flex items-center gap-2 place-self-end">
        <Label htmlFor="registros-por-pagina" className="whitespace-nowrap">
          Registros por página:
        </Label>
        <Select value={limit} onValueChange={handleLimitChange}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

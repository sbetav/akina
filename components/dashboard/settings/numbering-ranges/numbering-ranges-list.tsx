"use client";

import EllipsisIcon from "@/components/icons/ellipsis-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveCredentials } from "@/hooks/factus/use-active-credentials";
import { useNumberingRangesQuery } from "@/hooks/factus/use-numbering-ranges-query";
import { NumberingRangeItemResult } from "@/lib/elysia/modules/factus/service";
import { DEFAULT_NUMBERING_RANGES_LIMIT } from "@/lib/query-keys";
import { formatDate } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FileDigitIcon,
  SquarePenIcon,
  Trash2Icon,
} from "lucide-react";
import { FC, useMemo, useState } from "react";
import CreateNumberingRangeDialog from "./create-numbering-range-dialog";
import DeleteNumberingRangeDialog from "./delete-numbering-range-dialog";
import UpdateNumberingRangeDialog from "./update-numbering-current-dialog";

const NumberingRangesList: FC = () => {
  const [page, setPage] = useState(1);
  const limit = DEFAULT_NUMBERING_RANGES_LIMIT;

  const [selectedRange, setSelectedRange] =
    useState<NumberingRangeItemResult | null>(null);
  const [showDeleteRange, setShowDeleteRange] = useState(false);
  const [showUpdateRange, setShowUpdateRange] = useState(false);

  const { data, isLoading } = useNumberingRangesQuery({ page, limit });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const canGoPrev = page > 1;
  const canGoNext = page < pageCount;

  const pageLabel = useMemo(
    () => `Página ${page} de ${pageCount}`,
    [page, pageCount],
  );

  if (isLoading) {
    return (
      <div className="@container/numbering-ranges w-full min-w-0">
        <div className="grid grid-cols-1 gap-4 @2xl/numbering-ranges:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-46 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!total) {
    return (
      <Empty fillSpace>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileDigitIcon />
          </EmptyMedia>
          <EmptyTitle>Sin rangos de numeración</EmptyTitle>
          <EmptyDescription className="max-w-[320px]">
            Crea tu primer rango para gestionar consecutivos desde Akina.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreateNumberingRangeDialog />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="@container/numbering-ranges w-full min-w-0">
        <div className="grid grid-cols-1 gap-4 @2xl/numbering-ranges:grid-cols-2">
          {items.map((range) => (
            <NumberingRangeItem
              key={range.id}
              range={range}
              onDelete={(range) => {
                setSelectedRange(range);
                setShowDeleteRange(true);
              }}
              onUpdateRange={(range) => {
                setSelectedRange(range);
                setShowUpdateRange(true);
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <p className="text-muted-foreground text-xs">{pageLabel}</p>
        {pageCount > 1 && (
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={!canGoPrev}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={!canGoNext}
              onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        )}
      </div>

      <DeleteNumberingRangeDialog
        open={!!selectedRange && showDeleteRange}
        onOpenChange={setShowDeleteRange}
        range={selectedRange}
      />
      <UpdateNumberingRangeDialog
        open={!!selectedRange && showUpdateRange}
        onOpenChange={setShowUpdateRange}
        range={selectedRange}
      />
    </div>
  );
};

interface NumberingRangeItemProps {
  range: NumberingRangeItemResult;
  onDelete: (range: NumberingRangeItemResult) => void;
  onUpdateRange: (range: NumberingRangeItemResult) => void;
}

const NumberingRangeItem: FC<NumberingRangeItemProps> = ({
  range,
  onDelete,
  onUpdateRange,
}) => {
  const { isAkinaSandbox } = useActiveCredentials();

  const DETAILS_MAP = useMemo(() => {
    return [
      {
        label: "Consecutivo actual",
        value: range.current.toLocaleString(),
      },
      {
        label: "Rango autorizado",
        value:
          range.from !== null && range.to !== null
            ? `${range.from.toLocaleString()} - ${range.to.toLocaleString()}`
            : "N/A",
      },
      {
        label: "Resolución",
        value: range.resolutionNumber?.trim() ? range.resolutionNumber : "N/A",
      },
      {
        label: "Vigencia",
        value:
          range.startDate && range.endDate
            ? `${formatDate(range.startDate, "dd MMM yyyy", { locale: es })} - ${formatDate(range.endDate, "dd MMM yyyy", { locale: es })}`
            : "No aplica",
      },
    ];
  }, [range]);

  return (
    <div className="bg-background/50 relative flex flex-col gap-4 border px-6 py-5">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{range.prefix}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge size="sm" variant={range.isActive ? "teal" : "warning"}>
              {range.isActive ? "Activo" : "Inactivo"}
            </Badge>
            {range.isExpired && (
              <Badge size="sm" variant="destructive">
                Expirado
              </Badge>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-xs">{range.document}</p>
      </div>

      <div className="space-y-2">
        {DETAILS_MAP.map((detail) => (
          <div
            key={detail.label}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="text-muted-foreground">{detail.label}</span>
            <span className="text-foreground truncate text-right font-medium">
              {detail.value}
            </span>
          </div>
        ))}
      </div>

      {!isAkinaSandbox && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground active:text-foreground absolute top-2 right-2"
              >
                <EllipsisIcon />
              </Button>
            }
          />
          <DropdownMenuContent side="left">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onUpdateRange(range)}>
                <SquarePenIcon className="mt-px" />
                Actualizar
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(range)}
              >
                <Trash2Icon className="mt-px" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default NumberingRangesList;

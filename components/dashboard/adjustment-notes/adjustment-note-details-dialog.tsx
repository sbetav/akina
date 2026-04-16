"use client";

import type { ViewAdjustmentNoteData } from "factus-js";
import { ExternalLinkIcon, EyeIcon } from "lucide-react";
import { type FC, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdjustmentNote,
  usePrefetchAdjustmentNote,
} from "@/hooks/api/use-adjustment-notes";
import {
  formatDocumentCurrency,
  formatDocumentDate,
  getDocumentValidationStatus,
} from "@/lib/documents/display";

const DETAILS_SKELETON_KEYS = [
  "number",
  "status",
  "concept",
  "reference",
  "created-at",
  "total",
] as const;

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs uppercase">{label}</p>
      <p className="text-sm font-medium break-all">{value}</p>
    </div>
  );
}

function AdjustmentNoteDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {DETAILS_SKELETON_KEYS.map((key) => (
          <div key={key} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

function AdjustmentNoteDetailsBody({
  adjustmentNote,
}: {
  adjustmentNote: ViewAdjustmentNoteData;
}) {
  const status = getDocumentValidationStatus(
    adjustmentNote.adjustment_note.status,
  );
  const dianUrl = adjustmentNote.adjustment_note.qr;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-6">
        <Detail label="Número" value={adjustmentNote.adjustment_note.number} />
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs uppercase">Estado</p>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <Detail
          label="Concepto"
          value={
            adjustmentNote.adjustment_note.correction_concept?.name || "N/A"
          }
        />
        <Detail
          label="Referencia"
          value={adjustmentNote.adjustment_note.reference_code}
        />
        <Detail
          label="CUDS"
          value={adjustmentNote.adjustment_note.cuds || "N/A"}
        />
        <Detail
          label="Fecha de emisión"
          value={formatDocumentDate(adjustmentNote.adjustment_note.created_at)}
        />
        <Detail
          label="Fecha de validación"
          value={formatDocumentDate(adjustmentNote.adjustment_note.validated)}
        />
        <Detail
          label="Total"
          value={formatDocumentCurrency(adjustmentNote.adjustment_note.total)}
        />
      </div>

      {dianUrl ? (
        <div>
          <a
            href={dianUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex"
          >
            <Button type="button" variant="secondary">
              <ExternalLinkIcon />
              Ver en la DIAN
            </Button>
          </a>
        </div>
      ) : null}

      <div className="space-y-3">
        <h4 className="font-medium">Productos</h4>
        <div className="space-y-3 lg:hidden">
          {adjustmentNote.items.map((item) => (
            <div
              key={`${item.code_reference}-${item.name}`}
              className="border-border/60 space-y-3 border p-4"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="font-medium wrap-break-word">{item.name}</span>
                <span className="text-muted-foreground text-xs break-all">
                  {item.code_reference}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Detail label="Cantidad" value={String(item.quantity)} />
                <Detail
                  label="Precio"
                  value={formatDocumentCurrency(item.price)}
                />
                <Detail label="Descuento" value={`${item.discount_rate}%`} />
                <Detail
                  label="Total"
                  value={formatDocumentCurrency(item.total)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="border-border/60 hidden overflow-hidden border lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-right">Descuento</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustmentNote.items.map((item) => (
                <TableRow key={`${item.code_reference}-${item.name}`}>
                  <TableCell>
                    <div className="flex min-w-0 flex-col">
                      <span className="font-medium wrap-break-word">
                        {item.name}
                      </span>
                      <span className="text-muted-foreground text-xs break-all">
                        {item.code_reference}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatDocumentCurrency(item.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.discount_rate}%
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDocumentCurrency(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Totales</h4>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Bruto</span>
            <span className="font-medium">
              {formatDocumentCurrency(
                adjustmentNote.adjustment_note.gross_value,
              )}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Descuentos</span>
            <span className="font-medium">
              {formatDocumentCurrency(
                adjustmentNote.adjustment_note.discount_amount,
              )}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold">
              {formatDocumentCurrency(adjustmentNote.adjustment_note.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AdjustmentNoteDetailsDialogProps {
  adjustmentNoteId: string;
  adjustmentNoteNumber: string;
}

export const AdjustmentNoteDetailsDialog: FC<
  AdjustmentNoteDetailsDialogProps
> = ({ adjustmentNoteId, adjustmentNoteNumber }) => {
  const [open, setOpen] = useState(false);
  const prefetchAdjustmentNote = usePrefetchAdjustmentNote();
  const { data, isPending, isError, error } = useAdjustmentNote(
    adjustmentNoteId,
    open,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button size="sm" variant="secondary" />}
        onMouseEnter={() => void prefetchAdjustmentNote(adjustmentNoteId)}
        onFocus={() => void prefetchAdjustmentNote(adjustmentNoteId)}
        onClick={() => void prefetchAdjustmentNote(adjustmentNoteId)}
      >
        <EyeIcon />
        Ver
      </DialogTrigger>
      <DialogContent className="overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nota de ajuste {adjustmentNoteNumber}</DialogTitle>
          <DialogDescription>
            Consulta el detalle emitido en Factus para esta nota de ajuste.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[600px] overflow-x-hidden pr-2">
          {isPending ? <AdjustmentNoteDetailsSkeleton /> : null}

          {isError ? (
            <div className="text-sm">
              <p className="font-medium">
                No fue posible cargar la nota de ajuste.
              </p>
              <p className="text-muted-foreground wrap-break-word">
                {error.message}
              </p>
            </div>
          ) : null}

          {data ? <AdjustmentNoteDetailsBody adjustmentNote={data} /> : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

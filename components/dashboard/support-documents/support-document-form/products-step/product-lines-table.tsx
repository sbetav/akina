"use client";

import type { Tribute } from "factus-js";
import { EditIcon, Trash2Icon } from "lucide-react";
import type { FC } from "react";
import {
  formatPercentagePoints,
  formatRate,
  getTributeLabel,
  normalizeDiscountRate,
  tributeBadgeVariant,
} from "@/components/dashboard/products/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInvoiceLineTotal } from "@/lib/invoices/utils";
import { COP } from "@/lib/utils";
import type { SupportDocumentItemValues } from "@/lib/validations/support-document";

export interface ProductLinesTableProps {
  items: SupportDocumentItemValues[];
  tributes: Tribute[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

const ProductLinesTable: FC<ProductLinesTableProps> = ({
  items,
  tributes,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-background/30 border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Descuento</TableHead>
            <TableHead>Impuesto</TableHead>
            <TableHead>Subtotal</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => {
            const discountRate = normalizeDiscountRate(item.discountRate);
            const subtotal = getInvoiceLineTotal(item);

            return (
              <TableRow key={item.productId}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {item.code}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{COP.format(item.price)}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatPercentagePoints(discountRate)}</TableCell>
                <TableCell>
                  <Badge variant={tributeBadgeVariant(item.tributeId)}>
                    {getTributeLabel(tributes, item.tributeId)}{" "}
                    {item.isExcluded ? "Excluido" : formatRate(item.taxRate)}
                  </Badge>
                </TableCell>
                <TableCell>{COP.format(subtotal)}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="secondary"
                      onClick={() => onEdit(index)}
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => onDelete(index)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductLinesTable;

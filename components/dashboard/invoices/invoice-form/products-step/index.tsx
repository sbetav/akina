"use client";

import { PackageIcon, PlusIcon } from "lucide-react";
import { type FC, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { toast } from "@/components/ui/toast";
import { useTributes } from "@/hooks/factus/use-tributes";
import type {
  InvoiceFormValues,
  InvoiceItemValues,
} from "@/lib/validations/invoice";
import ProductLineDialog from "./product-line-dialog";
import ProductLinesTable from "./product-lines-table";

interface SelectedLine {
  index: number;
  item: InvoiceItemValues;
}

interface DialogState {
  line: SelectedLine | null;
  closing?: boolean;
}

const ProductsStep: FC = () => {
  const { control, setValue, trigger } = useFormContext<InvoiceFormValues>();
  const items = useWatch({ control, name: "items" }) ?? [];
  const { data: tributes = [] } = useTributes();

  const [dialogState, setDialogState] = useState<DialogState | null>(null);

  const openAdd = () => setDialogState({ line: null });
  const openEdit = (index: number) =>
    setDialogState({ line: { index, item: items[index] } });
  const closeDialog = () => {
    setDialogState((prev) => (prev ? { ...prev, closing: true } : null));
    setTimeout(() => setDialogState(null), 150);
  };

  const onAddProduct = (item: InvoiceItemValues) => {
    const duplicated = items.some(
      (existing) => existing.productId === item.productId,
    );

    if (duplicated) {
      toast.error("Producto ya agregado");
      return false;
    }

    setValue("items", [...items, item], {
      shouldDirty: true,
      shouldValidate: true,
    });
    void trigger("items");
    return true;
  };

  const onEditProduct = (index: number, item: InvoiceItemValues) => {
    const duplicated = items.some(
      (existing, i) => existing.productId === item.productId && i !== index,
    );

    if (duplicated) {
      toast.error("Producto ya agregado");
      return false;
    }

    const currentItems = [...items];
    currentItems[index] = item;
    setValue("items", currentItems, {
      shouldDirty: true,
      shouldValidate: true,
    });
    void trigger("items");
    return true;
  };

  const onDeleteProduct = (index: number) => {
    setValue(
      "items",
      items.filter((_, i) => i !== index),
      { shouldDirty: true, shouldValidate: true },
    );
    void trigger("items");
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader size="sm">
        <PageHeaderContent>
          <PageHeaderTitle>Seleccionar productos</PageHeaderTitle>
          <PageHeaderDescription>
            Agrega los productos o servicios que incluirá la factura
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button type="button" variant="secondary" onClick={openAdd}>
            <PlusIcon />
            Agregar producto
          </Button>
        </PageHeaderActions>
      </PageHeader>

      {items.length === 0 ? (
        <Empty fillSpace className="bg-background/30">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageIcon />
            </EmptyMedia>
            <EmptyTitle>Sin productos aún</EmptyTitle>
            <EmptyDescription className="max-w-[330px]">
              Agrega los productos o servicios a facturar
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button type="button" variant="secondary" onClick={openAdd}>
              <PlusIcon />
              Agregar producto
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <ProductLinesTable
          items={items}
          tributes={tributes}
          onEdit={openEdit}
          onDelete={onDeleteProduct}
        />
      )}

      <ProductLineDialog
        open={dialogState !== null && !dialogState.closing}
        onClose={closeDialog}
        selectedLine={dialogState?.line ?? null}
        existingItems={items}
        onAddProduct={onAddProduct}
        onEditProduct={(item) => {
          if (!dialogState?.line) return false;
          return onEditProduct(dialogState.line.index, item);
        }}
      />
    </div>
  );
};

export default ProductsStep;
